import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { formatCurrency } from '../../../utils/format';

const STEPS = ['Category', 'Service', 'Employee', 'Date & Slot', 'Confirm & Pay'];

export default function BookAppointment() {
  const [step, setStep] = useState(0);
  const [categories] = useState(['Hair', 'Beard', 'Facial', 'Spa', 'Bridal', 'Skin Care']);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState({
    category: '',
    service: null,
    employee: null,
    date: '',
    slot: null
  });
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(null);

  useEffect(() => {
    if (selected.category) {
      api.get(`/api/services?category=${selected.category}`).then(res => setServices(res.data));
    } else setServices([]);
  }, [selected.category]);

  useEffect(() => {
    api.get('/api/users?role=employee').then(res => setEmployees(res.data));
  }, []);

  useEffect(() => {
    if (selected.employee && selected.date) {
      api.get(`/api/appointments/available-slots?date=${selected.date}&employeeId=${selected.employee._id}`)
        .then(res => setSlots(res.data));
    } else setSlots([]);
  }, [selected.employee, selected.date]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/appointments', {
        employeeId: selected.employee._id,
        serviceId: selected.service._id,
        date: selected.date,
        slotStart: selected.slot.startTime,
        slotEnd: selected.slot.endTime
      });
      setBooked(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (booked) {
    return (
      <div className="card" style={{ maxWidth: '500px' }}>
        <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Booking confirmed</h2>
        <p>Invoice: <strong>{booked.invoiceNumber}</strong></p>
        <p>{booked.serviceId?.name} · {booked.employeeId?.name}</p>
        <p>Date: {selected.date} · {selected.slot?.startTime}</p>
        <p>Total: {formatCurrency(booked.totalAmount)} (GST included)</p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => { setBooked(null); setStep(0); setSelected({ category: '', service: null, employee: null, date: '', slot: null }); }}>
          Book another
        </button>
      </div>
    );
  }

  return (
    <>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '1rem' }}>Book Appointment</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {STEPS.map((s, i) => (
          <span key={s} style={{ padding: '0.35rem 0.75rem', borderRadius: '8px', background: i === step ? 'var(--accent)' : 'var(--bg-card)', color: i === step ? '#1a1a2e' : 'var(--text-secondary)', fontSize: '0.9rem' }}>{s}</span>
        ))}
      </div>

      {step === 0 && (
        <div className="card">
          <p style={{ marginBottom: '1rem' }}>Select category</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categories.map(c => (
              <button key={c} className={selected.category === c ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => { setSelected({ ...selected, category: c }); setStep(1); }}>{c}</button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card">
          <button className="btn btn-outline" style={{ marginBottom: '1rem' }} onClick={() => setStep(0)}>← Back</button>
          <p style={{ marginBottom: '1rem' }}>Select service</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {services.map(s => (
              <button key={s._id} className="card" style={{ textAlign: 'left', background: selected.service?._id === s._id ? 'var(--accent)' : 'var(--bg-card)', color: selected.service?._id === s._id ? '#1a1a2e' : 'inherit' }} onClick={() => { setSelected({ ...selected, service: s }); setStep(2); }}>
                {s.name} · {formatCurrency(s.price)} · {s.duration} min
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <button className="btn btn-outline" style={{ marginBottom: '1rem' }} onClick={() => setStep(1)}>← Back</button>
          <p style={{ marginBottom: '1rem' }}>Select employee</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {employees.filter(e => !e.assignedServiceIds?.length || e.assignedServiceIds.some(s => (s._id || s) === selected.service?._id)).length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No employees assigned to this service; showing all.</p>}
            {employees.map(emp => (
              <button key={emp._id} className="card" style={{ textAlign: 'left', background: selected.employee?._id === emp._id ? 'var(--accent)' : 'var(--bg-card)' }} onClick={() => { setSelected({ ...selected, employee: emp }); setStep(3); }}>
                {emp.name} {emp.employeeId && `(${emp.employeeId})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <button className="btn btn-outline" style={{ marginBottom: '1rem' }} onClick={() => setStep(2)}>← Back</button>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={selected.date} onChange={e => setSelected({ ...selected, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
          </div>
          {selected.date && (
            <>
              <p style={{ marginBottom: '0.5rem' }}>Time slot</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {slots.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Loading slots...</p>}
                {slots.map(s => (
                  <button key={s._id} className={selected.slot?._id === s._id ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setSelected({ ...selected, slot: s })}>
                    {s.startTime}
                  </button>
                ))}
              </div>
              {selected.slot && (
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setStep(4)}>Next: Confirm</button>
              )}
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <button className="btn btn-outline" style={{ marginBottom: '1rem' }} onClick={() => setStep(3)}>← Back</button>
          <h3 style={{ marginBottom: '0.75rem' }}>Summary</h3>
          <p><strong>Service:</strong> {selected.service?.name} · {formatCurrency(selected.service?.price)}</p>
          <p><strong>Employee:</strong> {selected.employee?.name}</p>
          <p><strong>Date:</strong> {selected.date} · <strong>Time:</strong> {selected.slot?.startTime}</p>
          <p><strong>Total (incl. 18% GST):</strong> {formatCurrency(selected.service ? Math.round(selected.service.price * 1.18) : 0)}</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading} onClick={handleConfirm}>
            {loading ? 'Booking...' : 'Confirm & Pay (simulated)'}
          </button>
        </div>
      )}
    </>
  );
}
