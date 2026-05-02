/**
 * Simple rule-based FAQ chatbot for TrimTech
 * Mock / rule-based acceptable for the requirement
 */
import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Hi! I\'m African Hair Saloon assistant. Ask me about services, prices or duration 😊' }]);
  const [input, setInput] = useState('');
  const [services, setServices] = useState([]);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/services').then(res => setServices(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAnswer = (text) => {
    const lower = text.toLowerCase().trim();
    if (!lower) return;

    if (['hi', 'hello', 'hey', 'hii'].includes(lower)) {
      return "Hi! I'm African Hair Saloon assistant. Ask me about services, prices or duration 😊";
    }

    const isAskingPrice = lower.includes('price') || lower.includes('cost') || lower.includes('charges');
    const isAskingDuration = lower.includes('duration') || lower.includes('time') || lower.includes('how long');

    const pureMatch = services.find(s => lower.includes(s.name.toLowerCase()));
    let matchedService = pureMatch;

    if (!matchedService) {
      const searchTerms = lower.replace(/(price|cost|charges|duration|time|how long|of|for|what|is|the|tell|me)/g, '').trim();
      if (searchTerms) {
        matchedService = services.find(s => s.name.toLowerCase().includes(searchTerms) || searchTerms.includes(s.name.toLowerCase()));
      }
    }

    if (matchedService) {
      if (isAskingPrice && !isAskingDuration) {
        return `${matchedService.name} costs ₹${matchedService.price}`;
      } else if (isAskingDuration && !isAskingPrice) {
        return `${matchedService.name} takes ${matchedService.duration} minutes`;
      } else {
        return `${matchedService.name} costs ₹${matchedService.price} and takes ${matchedService.duration} minutes`;
      }
    }

    if (lower.includes('book') || lower.includes('booking') || lower.includes('appointment')) {
      return "To book an appointment, please log in and go to your Dashboard, then click 'Book Appointment'. You can select your service, preferred staff, and a convenient time slot!";
    }

    if (lower.includes('service') || lower.includes('available')) {
      const cats = Array.from(new Set(services.map(s => s.category))).join(', ');
      return `We offer a wide variety of services across categories: ${cats}. Just ask me the price of any specific service!`;
    }

    return "Sorry, I couldn't understand. Try asking about service price, duration, available services, or how to book.";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    const reply = getAnswer(userMsg.text);
    if (reply) {
      setTimeout(() => setMessages(m => [...m, { from: 'bot', text: reply }]), 400);
    }
  };

  const handleActionClick = (action) => {
    if (action === 'Book Appointment') {
      navigate('/dashboard/client');
      setOpen(false);
    } else if (action === 'Show Services') {
      const msg = { from: 'user', text: 'Show Services' };
      setMessages(m => [...m, msg]);
      setTimeout(() => setMessages(m => [...m, { from: 'bot', text: 'We have a wide range of services including Haircuts, Facials, Beards and more. Just ask me the price or duration of any service!' }]), 400);
    } else if (action === 'Check Prices') {
      const msg = { from: 'user', text: 'Check Prices' };
      setMessages(m => [...m, msg]);
      setTimeout(() => setMessages(m => [...m, { from: 'bot', text: 'Tell me which service you are looking for?' }]), 400);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1050 }}>
      {open && (
        <div className="card" style={{ width: '320px', maxWidth: 'calc(100vw - 3rem)', height: '420px', maxHeight: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', padding: 0, marginBottom: '1rem' }}>
          <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>African Hair Saloon Assistant</strong>
            <button onClick={() => setOpen(false)} style={{ background: 'none', fontSize: '1.2rem', padding: '0 0.5rem' }} aria-label="Close">×</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.from === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: '0.5rem 0.75rem', borderRadius: '8px', background: m.from === 'user' ? 'var(--accent)' : 'var(--bg-primary)', color: m.from === 'user' ? '#1a1a2e' : 'var(--text-primary)' }}>
                {m.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '0.5rem', display: 'flex', gap: '0.2rem', overflowX: 'auto', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', whiteSpace: 'nowrap' }} onClick={() => handleActionClick('Show Services')}>Show Services</button>
            <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', whiteSpace: 'nowrap' }} onClick={() => handleActionClick('Check Prices')}>Check Prices</button>
            <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', whiteSpace: 'nowrap' }} onClick={() => handleActionClick('Book Appointment')}>Book Appointment</button>
          </div>

          <div style={{ padding: '0.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask me something..."
              style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            />
            <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="btn btn-primary"
        style={{ width: '56px', height: '56px', borderRadius: '50%', padding: 0, boxShadow: '0 4px 12px var(--shadow)', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        title="FAQ Chatbot"
      >
        🤖
      </button>
    </div>
  );
}
