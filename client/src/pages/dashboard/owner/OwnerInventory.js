import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { formatCurrency } from '../../../utils/format';

export default function OwnerInventory() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Hair care', mrp: 0, discount: 0, stock: 0, lowStockThreshold: 5 });

  useEffect(() => {
    api.get('/api/products').then(res => setProducts(res.data));
    api.get('/api/products?lowStock=true').then(res => setLowStock(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.patch('/api/products/' + editing._id, form);
      } else {
        await api.post('/api/products', form);
      }
      setEditing(null);
      setForm({ name: '', category: 'Hair care', mrp: 0, discount: 0, stock: 0, lowStockThreshold: 5 });
      api.get('/api/products').then(res => setProducts(res.data));
      api.get('/api/products?lowStock=true').then(res => setLowStock(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete('/api/products/' + id);
      api.get('/api/products').then(res => setProducts(res.data));
      api.get('/api/products?lowStock=true').then(res => setLowStock(res.data));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Inventory</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Products, consumables, stock and low stock alerts</p>

      {lowStock.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--warning)' }}>
          <h3 style={{ color: 'var(--warning)', marginBottom: '0.5rem' }}>Low stock alert</h3>
          <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
            {lowStock.map(p => (
              <li key={p._id}>{p.name} - Stock: {p.stock} (threshold: {p.lowStockThreshold})</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card" style={{ marginBottom: '1.5rem', maxWidth: '480px' }}>
        <h3 style={{ marginBottom: '1rem' }}>{editing ? 'Edit product' : 'Add product'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="Hair care">Hair care</option>
              <option value="Skin care">Skin care</option>
              <option value="Grooming">Grooming</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>MRP (Rs)</label>
              <input type="number" min={0} value={form.mrp} onChange={e => setForm({ ...form, mrp: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Discount (Rs)</label>
              <input type="number" min={0} value={form.discount} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" min={0} value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Low stock threshold</label>
              <input type="number" min={0} value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Image URL (Optional)</label>
              <input type="text" value={form.imageUrl || ''} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder={`/images/products/${form.category.toLowerCase().replace(' ', '-')}.jpg`} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button>
          {editing && <button type="button" className="btn btn-outline" style={{ marginLeft: '0.5rem' }} onClick={() => { setEditing(null); setForm({ name: '', category: 'Hair care', mrp: 0, discount: 0, stock: 0, lowStockThreshold: 5 }); }}>Cancel</button>}
        </form>
      </div>

      <h3 style={{ marginBottom: '0.75rem' }}>All products</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {products.map(p => (
          <div key={p._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <strong>{p.name}</strong> - {p.category} - MRP {formatCurrency(p.mrp)} - Discount {formatCurrency(p.discount)} - Stock: {p.stock}
            </div>
            <div>
              <button className="btn btn-outline" style={{ fontSize: '0.85rem', marginRight: '0.5rem' }} onClick={() => { setEditing(p); setForm({ name: p.name, category: p.category, mrp: p.mrp, discount: p.discount, stock: p.stock, lowStockThreshold: p.lowStockThreshold || 5 }); }}>Edit</button>
              <button className="btn btn-outline" style={{ fontSize: '0.85rem', color: 'var(--error)' }} onClick={() => handleDelete(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
