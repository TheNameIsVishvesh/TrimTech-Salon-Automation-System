/**
 * Simple rule-based FAQ chatbot for TrimTech
 * Mock / rule-based acceptable for the requirement
 */
import React, { useState, useRef, useEffect } from 'react';

const FAQ = [
  { q: ['book', 'appointment', 'how to book'], a: 'To book an appointment, please log in or register, then go to Dashboard > Book. Choose category, service, employee, date and time slot.' },
  { q: ['price', 'cost', 'charges', 'fee'], a: 'Prices vary by service. Check the Services page for each service with duration and price in ₹.' },
  { q: ['cancel', 'reschedule'], a: 'In your dashboard under Appointments, you can cancel or request to reschedule an appointment.' },
  { q: ['timing', 'hours', 'open'], a: 'We follow the time slots set by the salon. Check available slots when booking.' },
  { q: ['contact', 'address', 'phone'], a: 'Visit the Contact page for our address, phone and email. You can also send a message via the contact form.' },
  { q: ['service', 'hair', 'facial', 'beard', 'spa', 'bridal', 'skin'], a: 'We offer Hair, Beard, Facial, Spa, Bridal and Skin Care services. See the Services page for the full list.' }
];

function getAnswer(text) {
  const lower = (text || '').toLowerCase().trim();
  if (!lower) return 'Type a question (e.g. How do I book? What are your timings?)';
  for (const faq of FAQ) {
    if (faq.q.some(kw => lower.includes(kw))) return faq.a;
  }
  return 'Sorry, I could not find an answer. Try asking about booking, prices, cancellation, timings, or contact details.';
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hi! I\'m TrimTech assistant. Ask me about booking, services, prices or contact.' }]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    const reply = getAnswer(userMsg.text);
    setTimeout(() => setMessages(m => [...m, { from: 'bot', text: reply }]), 400);
  };

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 999 }}>
      {open && (
        <div className="card" style={{ width: '320px', maxWidth: '95vw', height: '380px', display: 'flex', flexDirection: 'column', padding: 0 }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>TrimTech FAQ</strong>
            <button onClick={() => setOpen(false)} style={{ background: 'none', fontSize: '1.2rem' }} aria-label="Close">×</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '0.5rem 0.75rem', borderRadius: '8px', background: m.from === 'user' ? 'var(--accent)' : 'var(--bg-primary)', color: m.from === 'user' ? '#1a1a2e' : 'var(--text-primary)' }}>
                {m.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask something..."
              style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
            <button className="btn btn-primary" onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-primary"
        style={{ width: '56px', height: '56px', borderRadius: '50%', padding: 0, boxShadow: '0 4px 12px var(--shadow)' }}
        title="FAQ Chatbot"
      >
        💬
      </button>
    </div>
  );
}
