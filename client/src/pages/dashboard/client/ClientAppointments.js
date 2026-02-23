import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { formatCurrency, formatDate, formatTime12h } from '../../../utils/format';
import { useSocket } from '../../../hooks/useSocket';

export default function ClientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  useSocket('appointment-update', () => fetchAppointments());

  function fetchAppointments() {
    api.get('/api/appointments').then(res => setAppointments(res.data));
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.patch(`/api/appointments/${id}`, { status: 'cancelled' });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleFeedback = async (id) => {
    try {
      await api.patch(`/api/appointments/${id}`, { rating, feedback });
      setEditingFeedback(null);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Appointments</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>History, cancel, reschedule, and feedback</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {appointments.map(apt => (
          <div key={apt._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <strong>{apt.serviceId?.name}</strong> · {formatDate(apt.date)} {formatTime12h(apt.slotStart)}
                <br />
                <small style={{ color: 'var(--text-secondary)' }}>with {apt.employeeId?.name} · Invoice {apt.invoiceNumber} · {apt.status}</small>
              </div>
              <span>{formatCurrency(apt.totalAmount)}</span>
            </div>
            {apt.status === 'completed' && !apt.rating && (
              <div style={{ marginTop: '1rem' }}>
                {editingFeedback !== apt._id ? (
                  <button className="btn btn-outline" style={{ fontSize: '0.9rem' }} onClick={() => setEditingFeedback(apt._id)}>Add rating & feedback</button>
                ) : (
                  <div>
                    <div className="form-group">
                      <label>Rating (1-5)</label>
                      <select value={rating} onChange={e => setRating(Number(e.target.value))}>
                        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Feedback</label>
                      <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={2} />
                    </div>
                    <button className="btn btn-primary" onClick={() => handleFeedback(apt._id)}>Submit</button>
                    <button className="btn btn-outline" style={{ marginLeft: '0.5rem' }} onClick={() => setEditingFeedback(null)}>Cancel</button>
                  </div>
                )}
              </div>
            )}
            {apt.status === 'scheduled' || apt.status === 'confirmed' ? (
              <button className="btn btn-outline" style={{ marginTop: '0.75rem', fontSize: '0.9rem' }} onClick={() => handleCancel(apt._id)}>Cancel appointment</button>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
