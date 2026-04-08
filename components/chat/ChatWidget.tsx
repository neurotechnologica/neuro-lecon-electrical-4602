'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { loadContent } from '@/lib/content';
import { searchKnowledgeBase, KnowledgeBase } from '@/lib/chat';
import type { ChatContent } from '@/types/content';

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [chatContent, setChatContent] = useState<ChatContent | null>(null);
  const [phone, setPhone] = useState('');
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>({ faq: [], services: [] });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load content once on mount
  useEffect(() => {
    loadContent()
      .then((content) => {
        setChatContent(content.chat);
        setPhone(content.meta.phone);
        setKnowledgeBase({ faq: content.faq, services: content.services });
      })
      .catch(() => {
        // silently fall back — widget will use empty fallback
      });
  }, []);

  // Show greeting when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0 && chatContent) {
      setMessages([
        { role: 'bot', text: chatContent.greeting, timestamp: Date.now() },
      ]);
    }
  }, [isOpen, chatContent, messages.length]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  function getFallback(): string {
    if (chatContent?.fallbackMessage) return chatContent.fallbackMessage;
    return phone ? `Please call us at ${phone}` : 'Please contact us for assistance.';
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;

    const userMsg: ChatMessage = { role: 'user', text: query, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Respond within 500ms
    setTimeout(() => {
      let answer: string | null = null;
      try {
        answer = searchKnowledgeBase(query, knowledgeBase);
      } catch {
        answer = null;
      }
      const botText = answer ?? getFallback();
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: botText, timestamp: Date.now() },
      ]);
    }, 300);
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--color-primary)] text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
      >
        {isOpen ? (
          // X icon
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Chat bubble icon
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat with us"
          className="fixed bottom-24 right-6 z-50 w-80 max-h-[480px] flex flex-col rounded-2xl shadow-2xl bg-white border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[var(--color-primary)] text-white px-4 py-3 text-sm font-semibold">
            Chat with us
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <span
                  className={`inline-block max-w-[85%] px-3 py-2 rounded-xl leading-snug ${
                    msg.role === 'user'
                      ? 'bg-[var(--color-primary)] text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 flex">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              aria-label="Chat message"
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="px-3 py-2 bg-[var(--color-primary)] text-white text-sm hover:opacity-90 transition-opacity"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
