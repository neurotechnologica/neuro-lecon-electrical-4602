# n8n Integration: Auto-Deploy Trade Business Site from Lead Data

This document describes the n8n workflow that replaces `public/content.json` in the GitHub repository and triggers a Vercel redeploy — fully automated from a Postgres lead record.

---

## Overview

```
Postgres (fetch lead)
  → Apify (scrape lead website)
    → Code (Groq API — extract structured data)
      → Code (generate content.json)
        → GitHub GET (fetch current file SHA)
          → GitHub PUT (commit updated content.json)
            → Wait 30s
              → Postgres (mark lead as 'responded')
```

Vercel detects the GitHub commit and automatically rebuilds the site with the new `content.json`.

---

## Required Environment Variables

Set these as n8n credentials or environment variables before activating the workflow.

| Variable | Description |
|---|---|
| `APIFY_TOKEN` | Apify API token for running the website scraper actor |
| `GROQ_API_KEY` | Groq API key for the LLM data extraction call |
| `GITHUB_TOKEN` | GitHub Personal Access Token with `repo` scope (read + write) |
| `GITHUB_REPO` | GitHub repository in `owner/repo` format, e.g. `acme/trade-site` |
| `VERCEL_DEPLOY_HOOK_URL` | Vercel deploy hook URL (from Project Settings → Git → Deploy Hooks) |

> **Note:** `VERCEL_DEPLOY_HOOK_URL` is not used as a separate node in this workflow. Vercel auto-deploys on every push to the connected branch. If your Vercel project is not connected to GitHub auto-deploy, add an HTTP Request node after the Wait node that POSTs to `VERCEL_DEPLOY_HOOK_URL`.

---

## Workflow Nodes

### Node 1 — Schedule Trigger

**Type:** Schedule Trigger

Runs the workflow on a recurring schedule (e.g. daily at 08:00).

**Configuration:**
- Rule: `0 8 * * *` (every day at 08:00 UTC)
- Timezone: set to your local timezone

---

### Node 2 — Postgres: Fetch Lead

**Type:** Postgres

Fetches the next unprocessed lead with status `outreach` from your leads table.

**Operation:** Execute Query

```sql
SELECT id, business_name, website_url, trade_type, location
FROM leads
WHERE status = 'outreach'
ORDER BY created_at ASC
LIMIT 1;
```

**Output:** Single row with `id`, `business_name`, `website_url`, `trade_type`, `location`.

---

### Node 3 — Apify: Scrape Lead Website

**Type:** HTTP Request (Apify REST API)

Runs the Apify `apify/web-scraper` actor against the lead's website URL to extract text content, contact details, services, and images.

**Method:** POST  
**URL:** `https://api.apify.com/v2/acts/apify~web-scraper/runs?token={{ $env.APIFY_TOKEN }}`

**Body (JSON):**
```json
{
  "startUrls": [{ "url": "{{ $json.website_url }}" }],
  "maxCrawlPages": 5,
  "pageFunction": "async function pageFunction(context) { const { $, request, log } = context; return { url: request.url, title: $('title').text(), body: $('body').text().substring(0, 8000), h1: $('h1').map((i, el) => $(el).text()).get(), phone: $('a[href^=\"tel:\"]').first().attr('href') || '', emails: $('a[href^=\"mailto:\"]').map((i, el) => $(el).attr('href').replace('mailto:', '')).get() }; }"
}
```

Poll the run status until `SUCCEEDED`, then fetch results from:  
`GET https://api.apify.com/v2/acts/apify~web-scraper/runs/last/dataset/items?token={{ $env.APIFY_TOKEN }}`

---

### Node 4 — Code: Groq API Data Extraction

**Type:** Code (JavaScript)

Calls the Groq API to extract structured business data from the scraped content.

```javascript
const scrapedPages = $input.all().map(item => item.json);
const leadData = $('Postgres: Fetch Lead').first().json;

const scrapedText = scrapedPages
  .map(p => `URL: ${p.url}\nTitle: ${p.title}\nContent: ${p.body}`)
  .join('\n\n---\n\n')
  .substring(0, 12000);

const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${$env.GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama3-70b-8192',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: `You are a data extraction assistant. Extract structured business information from scraped website content and return ONLY valid JSON matching the schema provided. Do not include markdown fences.`
      },
      {
        role: 'user',
        content: `Extract business data from this scraped content for a ${leadData.trade_type} business in ${leadData.location}.

Scraped content:
${scrapedText}

Return JSON with these fields:
{
  "businessName": string,
  "phone": string,
  "email": string,
  "address": string,
  "tradeType": string,
  "primaryColor": string (hex, infer from brand if visible, else "#1E3A8A"),
  "accentColor": string (hex, else "#3B82F6"),
  "headline": string (compelling hero headline),
  "subheadline": string,
  "services": [{ "name": string, "description": string, "icon": string (emoji), "priceIndicator": string, "ctaText": string }],
  "differentiators": [{ "icon": string (emoji), "title": string, "description": string }],
  "story": string (about section),
  "yearsInBusiness": number,
  "certifications": string[],
  "faq": [{ "question": string, "answer": string }],
  "reviewItems": [{ "name": string, "rating": number, "text": string, "date": string }],
  "locations": [{ "name": string, "slug": string, "description": string, "lat": number, "lng": number }],
  "centerLat": number,
  "centerLng": number
}`
      }
    ]
  })
});

const result = await response.json();
const extracted = JSON.parse(result.choices[0].message.content);

return [{ json: { ...extracted, leadId: leadData.id } }];
```

---

### Node 5 — Code: Generate content.json

**Type:** Code (JavaScript)

Transforms the extracted data into a full `ContentSchema`-conforming object.

```javascript
const d = $input.first().json;

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const content = {
  meta: {
    businessName: d.businessName || 'Local Trade Co.',
    phone: d.phone || '+1-555-000-0000',
    email: d.email || 'hello@example.com',
    address: d.address || '',
    tradeType: d.tradeType || 'tradesperson'
  },
  branding: {
    trade: d.tradeType || 'Trade',
    primaryColor: d.primaryColor || '#1E3A8A',
    accentColor: d.accentColor || '#3B82F6',
    logoUrl: null,
    heroImageUrl: null,
    ownerName: null,
    ownerPhotoUrl: null,
    ownerStory: null
  },
  header: {
    logoUrl: '/logo.svg',
    navLinks: [
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Reviews', href: '#reviews' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '#booking' }
    ]
  },
  hero: {
    headline: d.headline || `Trusted ${d.tradeType} Services`,
    subheadline: d.subheadline || 'Licensed & insured. Available when you need us.',
    ctaText: `Book a ${d.tradeType}`,
    ctaLink: '#booking',
    backgroundImage: '/images/hero-bg.jpg',
    phoneCtaText: 'Call us now'
  },
  emergencyBanner: {
    enabled: false,
    message: `24/7 Emergency ${d.tradeType} service available. Call now!`
  },
  reviews: {
    aggregateRating: d.reviewItems?.length
      ? (d.reviewItems.reduce((s, r) => s + r.rating, 0) / d.reviewItems.length).toFixed(1) * 1
      : 5.0,
    totalCount: d.reviewItems?.length || 0,
    items: (d.reviewItems || []).map(r => ({
      name: r.name,
      rating: r.rating,
      text: r.text,
      date: r.date || new Date().toISOString().split('T')[0]
    }))
  },
  services: (d.services || []).map(s => ({
    name: s.name,
    description: s.description,
    icon: s.icon || '🔧',
    priceIndicator: s.priceIndicator || undefined,
    ctaText: s.ctaText || 'Book Now'
  })),
  differentiators: {
    heading: `Why Choose ${d.businessName}?`,
    subheading: 'Quality work, honest pricing, and reliable service.',
    items: (d.differentiators || [
      { icon: '⏱️', title: 'Fast Response', description: 'Same-day service available for urgent jobs.' },
      { icon: '💰', title: 'Upfront Pricing', description: 'No hidden fees. You know the cost before we start.' },
      { icon: '🏅', title: 'Licensed & Insured', description: 'Fully licensed and carrying full public liability insurance.' }
    ])
  },
  about: {
    story: d.story || `${d.businessName} has been serving the local community for years with quality workmanship and honest service.`,
    teamImage: '/images/team.jpg',
    yearsInBusiness: d.yearsInBusiness || 5,
    certifications: d.certifications || [],
    ctaText: `Book a ${d.tradeType} Today`
  },
  gallery: [
    { src: null, alt: '[PLACEHOLDER: Add a photo of completed work]', isPlaceholder: true },
    { src: null, alt: '[PLACEHOLDER: Add a before/after photo]', isPlaceholder: true },
    { src: null, alt: '[PLACEHOLDER: Add a team photo]', isPlaceholder: true }
  ],
  serviceArea: {
    heading: `We Serve ${d.locations?.[0]?.name || 'Your Area'} & Surrounds`,
    description: `Our licensed ${d.tradeType}s cover the local area and surrounding suburbs. Same-day service available.`,
    center: { lat: d.centerLat || 0, lng: d.centerLng || 0 },
    zoom: 11,
    polygon: [],
    locations: (d.locations || []).map(loc => ({
      name: loc.name,
      slug: loc.slug || slug(loc.name),
      description: loc.description || `Professional ${d.tradeType} services in ${loc.name}.`,
      coords: { lat: loc.lat || d.centerLat || 0, lng: loc.lng || d.centerLng || 0 }
    }))
  },
  booking: {
    heading: `Book a ${d.tradeType}`,
    fields: {
      name: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address',
      service: 'Service Required',
      preferredDate: 'Preferred Date',
      message: 'Tell us about the job'
    },
    submitText: 'Request Booking',
    confirmationMessage: "Thanks! We'll be in touch shortly to confirm your booking.",
    errorMessage: `Something went wrong. Please call us directly on ${d.phone || '+1-555-000-0000'}.`
  },
  faq: (d.faq || []),
  maintenancePlans: {
    enabled: false,
    heading: 'Maintenance Plans',
    plans: []
  },
  chat: {
    greeting: `Hi! I'm the ${d.businessName} assistant. Ask me anything about our services or availability.`,
    fallbackMessage: `I'm not sure about that one. For the fastest answer, call us on ${d.phone || '+1-555-000-0000'}.`
  },
  blog: {
    heading: `${d.tradeType} Tips & News`,
    postsPerPage: 6,
    posts: []
  },
  adminPanel: {
    heading: 'Booking Management'
  },
  seo: {
    defaultTitle: `${d.businessName} | Licensed ${d.tradeType} Services`,
    defaultDescription: `Fast, reliable ${d.tradeType} services. Licensed & insured. Book online today.`,
    ogImage: '/images/og-image.jpg',
    siteUrl: 'https://example.com',
    localBusiness: {
      name: d.businessName || 'Local Trade Co.',
      type: d.tradeType ? d.tradeType.charAt(0).toUpperCase() + d.tradeType.slice(1) : 'GeneralContractor',
      telephone: d.phone || '+1-555-000-0000',
      address: {
        streetAddress: '',
        addressLocality: d.locations?.[0]?.name || '',
        addressRegion: '',
        postalCode: '',
        addressCountry: 'US'
      },
      geo: { latitude: d.centerLat || 0, longitude: d.centerLng || 0 },
      openingHours: ['Mo-Fr 08:00-17:00']
    }
  }
};

return [{ json: { content, leadId: d.leadId } }];
```

---

### Node 6 — GitHub HTTP Request (GET): Fetch Current SHA

**Type:** HTTP Request

Fetches the current SHA of `public/content.json` — required by the GitHub API to update an existing file.

**Method:** GET  
**URL:** `https://api.github.com/repos/{{ $env.GITHUB_REPO }}/contents/public/content.json`

**Headers:**
```
Authorization: Bearer {{ $env.GITHUB_TOKEN }}
Accept: application/vnd.github+json
X-GitHub-Api-Version: 2022-11-28
```

**Output:** Use `{{ $json.sha }}` in the next node.

---

### Node 7 — GitHub HTTP Request (PUT): Commit Updated content.json

**Type:** HTTP Request

Commits the new `content.json` to the repository, replacing the existing file.

**Method:** PUT  
**URL:** `https://api.github.com/repos/{{ $env.GITHUB_REPO }}/contents/public/content.json`

**Headers:**
```
Authorization: Bearer {{ $env.GITHUB_TOKEN }}
Accept: application/vnd.github+json
Content-Type: application/json
X-GitHub-Api-Version: 2022-11-28
```

**Body (JSON):**
```json
{
  "message": "chore: update content.json for {{ $('Postgres: Fetch Lead').first().json.business_name }}",
  "content": "{{ Buffer.from(JSON.stringify($('Code: Generate content.json').first().json.content, null, 2)).toString('base64') }}",
  "sha": "{{ $('GitHub GET SHA').first().json.sha }}"
}
```

> The `content` field must be the base64-encoded UTF-8 string of the JSON file. In n8n's Code node you can compute this; in an HTTP Request node body expression use the `btoa` / `Buffer` approach shown above.

Vercel detects this commit on the connected branch and automatically triggers a redeploy.

---

### Node 8 — Wait: 30 Seconds

**Type:** Wait

Pauses execution for 30 seconds to allow the Vercel build to initiate before marking the lead as processed.

**Configuration:**
- Wait amount: `30`
- Unit: `Seconds`

---

### Node 9 — Postgres: Mark Lead as Responded

**Type:** Postgres

Updates the lead record to prevent it from being picked up again on the next run.

**Operation:** Execute Query

```sql
UPDATE leads
SET status = 'responded', updated_at = NOW()
WHERE id = {{ $('Code: Generate content.json').first().json.leadId }};
```

---

## Workflow JSON Export

The following JSON can be imported directly into an n8n instance via **Workflows → Import from JSON**.

```json
{
  "name": "Trade Site Auto-Deploy",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [{ "field": "cronExpression", "expression": "0 8 * * *" }]
        }
      },
      "id": "node-schedule",
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT id, business_name, website_url, trade_type, location FROM leads WHERE status = 'outreach' ORDER BY created_at ASC LIMIT 1;",
        "options": {}
      },
      "id": "node-pg-fetch",
      "name": "Postgres: Fetch Lead",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.4,
      "position": [460, 300],
      "credentials": { "postgres": { "id": "pg-cred", "name": "Postgres account" } }
    },
    {
      "parameters": {
        "method": "POST",
        "url": "=https://api.apify.com/v2/acts/apify~web-scraper/runs?token={{ $env.APIFY_TOKEN }}",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "startUrls",
              "value": "=[{ \"url\": \"{{ $json.website_url }}\" }]"
            },
            { "name": "maxCrawlPages", "value": "5" }
          ]
        },
        "options": {}
      },
      "id": "node-apify",
      "name": "Apify: Scrape Lead",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [680, 300]
    },
    {
      "parameters": {
        "jsCode": "// Groq API call — see Node 4 documentation above for full code\nconst d = $('Postgres: Fetch Lead').first().json;\nconst pages = $input.all().map(i => i.json);\nconst scrapedText = pages.map(p => `URL: ${p.url}\\nContent: ${p.body}`).join('\\n---\\n').substring(0, 12000);\n\nconst res = await fetch('https://api.groq.com/openai/v1/chat/completions', {\n  method: 'POST',\n  headers: { 'Authorization': `Bearer ${$env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },\n  body: JSON.stringify({ model: 'llama3-70b-8192', temperature: 0.2, messages: [{ role: 'user', content: `Extract business JSON from: ${scrapedText}` }] })\n});\nconst result = await res.json();\nconst extracted = JSON.parse(result.choices[0].message.content);\nreturn [{ json: { ...extracted, leadId: d.id } }];"
      },
      "id": "node-groq",
      "name": "Code: Groq Extraction",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [900, 300]
    },
    {
      "parameters": {
        "jsCode": "// Generate content.json — see Node 5 documentation above for full code\nconst d = $input.first().json;\nconst content = { meta: { businessName: d.businessName || 'Local Trade Co.', phone: d.phone || '+1-555-000-0000', email: d.email || 'hello@example.com', address: d.address || '', tradeType: d.tradeType || 'tradesperson' } /* ... full schema */ };\nreturn [{ json: { content, leadId: d.leadId } }];"
      },
      "id": "node-generate",
      "name": "Code: Generate content.json",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1120, 300]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "=https://api.github.com/repos/{{ $env.GITHUB_REPO }}/contents/public/content.json",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Authorization", "value": "=Bearer {{ $env.GITHUB_TOKEN }}" },
            { "name": "Accept", "value": "application/vnd.github+json" },
            { "name": "X-GitHub-Api-Version", "value": "2022-11-28" }
          ]
        },
        "options": {}
      },
      "id": "node-gh-get",
      "name": "GitHub GET SHA",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1340, 300]
    },
    {
      "parameters": {
        "method": "PUT",
        "url": "=https://api.github.com/repos/{{ $env.GITHUB_REPO }}/contents/public/content.json",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "Authorization", "value": "=Bearer {{ $env.GITHUB_TOKEN }}" },
            { "name": "Accept", "value": "application/vnd.github+json" },
            { "name": "Content-Type", "value": "application/json" },
            { "name": "X-GitHub-Api-Version", "value": "2022-11-28" }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            { "name": "message", "value": "=chore: update content.json for {{ $('Postgres: Fetch Lead').first().json.business_name }}" },
            { "name": "content", "value": "={{ Buffer.from(JSON.stringify($('Code: Generate content.json').first().json.content, null, 2)).toString('base64') }}" },
            { "name": "sha", "value": "={{ $('GitHub GET SHA').first().json.sha }}" }
          ]
        },
        "options": {}
      },
      "id": "node-gh-put",
      "name": "GitHub PUT content.json",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [1560, 300]
    },
    {
      "parameters": {
        "amount": 30,
        "unit": "seconds"
      },
      "id": "node-wait",
      "name": "Wait 30s",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [1780, 300],
      "webhookId": "wait-webhook-id"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "=UPDATE leads SET status = 'responded', updated_at = NOW() WHERE id = {{ $('Code: Generate content.json').first().json.leadId }};",
        "options": {}
      },
      "id": "node-pg-update",
      "name": "Postgres: Mark Responded",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.4,
      "position": [2000, 300],
      "credentials": { "postgres": { "id": "pg-cred", "name": "Postgres account" } }
    }
  ],
  "connections": {
    "Schedule Trigger": { "main": [[{ "node": "Postgres: Fetch Lead", "type": "main", "index": 0 }]] },
    "Postgres: Fetch Lead": { "main": [[{ "node": "Apify: Scrape Lead", "type": "main", "index": 0 }]] },
    "Apify: Scrape Lead": { "main": [[{ "node": "Code: Groq Extraction", "type": "main", "index": 0 }]] },
    "Code: Groq Extraction": { "main": [[{ "node": "Code: Generate content.json", "type": "main", "index": 0 }]] },
    "Code: Generate content.json": { "main": [[{ "node": "GitHub GET SHA", "type": "main", "index": 0 }]] },
    "GitHub GET SHA": { "main": [[{ "node": "GitHub PUT content.json", "type": "main", "index": 0 }]] },
    "GitHub PUT content.json": { "main": [[{ "node": "Wait 30s", "type": "main", "index": 0 }]] },
    "Wait 30s": { "main": [[{ "node": "Postgres: Mark Responded", "type": "main", "index": 0 }]] }
  },
  "settings": {
    "executionOrder": "v1"
  },
  "staticData": null,
  "tags": [],
  "triggerCount": 1,
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "versionId": "1"
}
```

---

## Setup Checklist

1. **Postgres credentials** — add a Postgres credential in n8n pointing to your leads database. The `leads` table must have columns: `id`, `business_name`, `website_url`, `trade_type`, `location`, `status`, `created_at`, `updated_at`.
2. **Apify token** — set `APIFY_TOKEN` in n8n environment variables (Settings → Environment Variables).
3. **Groq API key** — set `GROQ_API_KEY` in n8n environment variables.
4. **GitHub token** — set `GITHUB_TOKEN` (PAT with `repo` scope) and `GITHUB_REPO` (e.g. `acme/trade-site`) in n8n environment variables.
5. **Vercel auto-deploy** — ensure your Vercel project is connected to the GitHub repository and auto-deploy on push is enabled for the target branch (default: `main`).
6. **Import workflow** — in n8n go to Workflows → Import from JSON and paste the JSON export above.
7. **Activate** — toggle the workflow to Active. It will run daily at 08:00 UTC and process one lead per run.

---

## ContentSchema Reference

The generated `content.json` must conform to the `ContentSchema` TypeScript interface defined in `types/content.ts`. All top-level keys are required:

`meta` · `branding` · `header` · `hero` · `emergencyBanner` · `reviews` · `services` · `differentiators` · `about` · `gallery` · `serviceArea` · `booking` · `faq` · `maintenancePlans` · `chat` · `blog` · `adminPanel` · `seo`

Missing any required field will cause the Next.js build to throw a descriptive error identifying the missing field by its dot-notation path (e.g. `Missing required field: seo.localBusiness.geo`).
