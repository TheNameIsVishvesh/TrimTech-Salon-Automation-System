import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { formatCurrency } from '../../../utils/format';

const STEPS = ['Category', 'Service', 'Employee', 'Date & Slot', 'Products', 'Summary', 'Payment'];

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
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    api.get('/api/products').then(res => setAvailableProducts(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (selected.category) {
      api.get(`/api/services?category=${selected.category}`).then(res => setServices(res.data));
    } else setServices([]);
  }, [selected.category]);

  useEffect(() => {
    api.get('/api/users?role=employee').then(res => setEmployees(res.data));
  }, []);

  useEffect(() => {
    if (selected.employee && selected.date && selected.service) {
      setSlotsLoading(true);
      api.get(`/api/appointments/available-slots?date=${selected.date}&employeeId=${selected.employee._id}&serviceId=${selected.service._id}`)
        .then(res => {
          setSlots(res.data);
          setSlotsLoading(false);
        })
        .catch(() => setSlotsLoading(false));
    } else {
      setSlots([]);
      setSlotsLoading(false);
    }
  }, [selected.employee, selected.date, selected.service]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/appointments', {
        employeeId: selected.employee._id,
        serviceId: selected.service._id,
        date: selected.date,
        startTime: selected.slot.startTime,
        paymentMethod: paymentMethod, // 'Cash'
        products: cart.map(p => ({ productId: p._id, name: p.name, price: (p.price != null ? p.price : (p.mrp - (p.discount || 0))), quantity: p.quantity }))
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
        <p>Payment Mode: {booked.paymentMethod}</p>
        <p style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Payment will be collected at the salon.</p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => { setBooked(null); setStep(0); setSelected({ category: '', service: null, employee: null, date: '', slot: null }); setPaymentMethod('Cash'); setCart([]); }}>
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
              <button key={emp._id} className="card" style={{ textAlign: 'left', background: selected.employee?._id === emp._id ? 'var(--accent)' : 'var(--bg-card)', color: selected.employee?._id === emp._id ? '#1a1a2e' : 'var(--text-primary)' }} onClick={() => { setSelected({ ...selected, employee: emp }); setStep(3); }}>
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
                {slotsLoading ? (
                  <p style={{ color: 'var(--text-secondary)' }}>Loading slots...</p>
                ) : slots.length === 0 ? (
                  <p style={{ color: 'var(--error)' }}>No available time slots on this date.</p>
                ) : (
                  slots.map(s => (
                    <button key={s._id} className={selected.slot?._id === s._id ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setSelected({ ...selected, slot: s })}>
                      {s.startTime}
                    </button>
                  ))
                )}
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
          <h3 style={{ marginBottom: '1rem' }}>Add Products (Optional)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {availableProducts.map(p => {
              const cartItem = cart.find(c => c._id === p._id);
              return (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', flexShrink: 0, overflow: 'hidden', borderRadius: '4px' }}>
                      <img 
                        src={p.imageUrl || `/images/products/${encodeURIComponent(p.name + ' Image.jpg')}`} 
                        onError={(e) => { 
                          if (!e.target.dataset.fallback) {
                            e.target.dataset.fallback = 'jpg';
                            e.target.src = `/images/products/${encodeURIComponent(p.name + ' Image.jpg')}`;
                          } else if (e.target.dataset.fallback === 'jpg') {
                            e.target.dataset.fallback = 'png';
                            e.target.src = `/images/products/${encodeURIComponent(p.name + ' Image.png')}`;
                          } else if (e.target.dataset.fallback === 'png') {
                            e.target.dataset.fallback = 'category';
                            e.target.src = `/images/products/${encodeURIComponent((p.category || 'grooming').toLowerCase().replace(' ', '-') + '.jpg')}`;
                          } else if (e.target.dataset.fallback === 'category') {
                            e.target.dataset.fallback = 'default';
                            e.target.src = '/images/default-product.png'; 
                          } else {
                            e.target.onError = null;
                          }
                        }}
                        alt={p.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    </div>
                    <div>
                      <h4 style={{ margin: 0 }}>{p.name}</h4>
                      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{formatCurrency(p.price != null ? p.price : (p.mrp - (p.discount || 0)))}</p>
                    </div>
                  </div>
                  {cartItem ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem' }} onClick={() => {
                        if (cartItem.quantity === 1) setCart(cart.filter(c => c._id !== p._id));
                        else setCart(cart.map(c => c._id === p._id ? { ...c, quantity: c.quantity - 1 } : c));
                      }}>-</button>
                      <span>{cartItem.quantity}</span>
                      <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem' }} onClick={() => {
                        setCart(cart.map(c => c._id === p._id ? { ...c, quantity: c.quantity + 1 } : c));
                      }}>+</button>
                      <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', color: 'red' }} onClick={() => {
                        setCart(cart.filter(c => c._id !== p._id));
                      }}>Remove</button>
                    </div>
                  ) : (
                    <button className="btn btn-primary" onClick={() => setCart([...cart, { ...p, quantity: 1 }])}>Add</button>
                  )}
                </div>
              );
            })}
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setStep(5)}>Next: Summary</button>
        </div>
      )}

      {step === 5 && (
        <div className="card">
          <button className="btn btn-outline" style={{ marginBottom: '1rem' }} onClick={() => setStep(4)}>← Back</button>
          <h3 style={{ marginBottom: '0.75rem' }}>Booking Summary</h3>
          <p><strong>Service:</strong> {selected.service?.name}</p>
          <p><strong>Employee:</strong> {selected.employee?.name}</p>
          <p><strong>Date:</strong> {selected.date} · <strong>Time:</strong> {selected.slot?.startTime}</p>
          {cart.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <strong>Products Added:</strong>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                {cart.map(p => (
                  <li key={p._id}>{p.name} (x{p.quantity}) - {formatCurrency((p.price != null ? p.price : (p.mrp - (p.discount || 0))) * p.quantity)}</li>
                ))}
              </ul>
            </div>
          )}
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setStep(6)}>
            Proceed to Payment
          </button>
        </div>
      )}

      {step === 6 && (
        <div className="card">
          <button className="btn btn-outline" style={{ marginBottom: '1rem' }} onClick={() => setStep(5)}>← Back</button>
          <h3 style={{ marginBottom: '1rem' }}>Invoice & Payment</h3>

          <div style={{ background: 'var(--bg-default)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>{selected.service?.name}</span>
              <span>{formatCurrency(selected.service?.price)}</span>
            </div>
            {cart.map(p => (
              <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>{p.name} (x{p.quantity})</span>
                <span>{formatCurrency((p.price != null ? p.price : (p.mrp - (p.discount || 0))) * p.quantity)}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              <span>GST (18%)</span>
              <span>{formatCurrency(Math.round(((selected.service?.price || 0) + cart.reduce((acc, p) => acc + (p.price != null ? p.price : (p.mrp - (p.discount || 0))) * p.quantity, 0)) * 0.18))}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              <span>Discount</span>
              <span>{formatCurrency(0)}</span>
            </div>
            <hr style={{ margin: '0.5rem 0', borderColor: 'var(--border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <span>Final Payable Amount</span>
              <span>{formatCurrency(Math.round(((selected.service?.price || 0) + cart.reduce((acc, p) => acc + (p.price != null ? p.price : (p.mrp - (p.discount || 0))) * p.quantity, 0)) * 1.18))}</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>Payment Method: Pay at Salon</h4>
          </div>

          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-default)', borderRadius: '8px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>You can pay at the salon during your visit.</p>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading} onClick={handleConfirm}>
            {loading ? 'Processing...' : `Confirm Booking ${formatCurrency(Math.round(((selected.service?.price || 0) + cart.reduce((acc, p) => acc + (p.price != null ? p.price : (p.mrp - (p.discount || 0))) * p.quantity, 0)) * 1.18))}`}
          </button>
        </div>
      )}
    </>
  );
}
