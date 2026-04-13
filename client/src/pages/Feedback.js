import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Feedback() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Fetch appointment to verify validity and show details
    api.get(`/api/appointments/${appointmentId}`)
      .then(res => {
        setAppointment(res.data);
        if (res.data.isRated) {
          setSubmitted(true);
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load appointment details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/feedback/${appointmentId}`, { rating, feedback });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback');
    }
  };

  if (loading) return <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div className="container" style={{ padding: '3rem', color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div className="container" style={{ maxWidth: '600px', padding: '3rem 1rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h1 style={{ fontFamily: 'Playfair Display', textAlign: 'center', marginBottom: '1rem' }}>Feedback</h1>
        
        {appointment && (
          <div style={{ marginBottom: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p><strong>Service:</strong> {appointment.serviceId?.name}</p>
            <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
            <p><strong>Stylist:</strong> {appointment.employeeId?.name}</p>
          </div>
        )}

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Thank You! 🎉</h2>
            <p>Your feedback has been successfully submitted.</p>
            <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => navigate('/dashboard/client')}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'block' }}>Rate your experience</label>
              <select 
                value={rating} 
                onChange={e => setRating(Number(e.target.value))}
                style={{ fontSize: '1.2rem', padding: '0.5rem' }}
                required
              >
                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label style={{ fontSize: '1.1rem', marginBottom: '0.5rem', display: 'block' }}>Tell us more about your visit</label>
              <textarea 
                value={feedback} 
                onChange={e => setFeedback(e.target.value)} 
                rows={5}
                placeholder="Optional feedback..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)' }}
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem' }}>
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
