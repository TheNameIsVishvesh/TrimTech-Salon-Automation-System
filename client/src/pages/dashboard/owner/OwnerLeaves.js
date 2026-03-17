import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { formatDate } from '../../../utils/format';

export default function OwnerLeaves() {
    const [leaves, setLeaves] = useState([]);
    const [updating, setUpdating] = useState(false);
    const [comments, setComments] = useState({});

    const fetchLeaves = () => {
        api.get('/api/leaves').then(res => setLeaves(res.data));
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleUpdate = async (id, status) => {
        setUpdating(true);
        try {
            await api.patch(`/api/leaves/${id}/status`, {
                status,
                ownerComment: comments[id] || ''
            });
            fetchLeaves();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update leave request');
        } finally {
            setUpdating(false);
        }
    };

    const handleCommentChange = (id, value) => {
        setComments(prev => ({ ...prev, [id]: value }));
    };

    return (
        <>
            <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '0.5rem' }}>Leave Management</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Approve or reject employee leave requests</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {leaves.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No leave requests found.</p>}
                {leaves.map(req => (
                    <div key={req._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <strong>{req.employeeId?.name}</strong> · {req.employeeId?.employeeId}
                                <br />
                                From: {formatDate(req.startDate)} to {formatDate(req.endDate)}
                                <br />
                                <small style={{ color: 'var(--text-secondary)' }}>Reason: {req.reason}</small>
                                {req.status !== 'pending' && req.ownerComment && (
                                    <div><small style={{ color: 'var(--text-secondary)' }}>Comment: {req.ownerComment}</small></div>
                                )}
                            </div>

                            {req.status === 'pending' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Add optional comment..."
                                        className="form-group"
                                        style={{ padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--bg-card)', color: 'var(--text)' }}
                                        value={comments[req._id] || ''}
                                        onChange={(e) => handleCommentChange(req._id, e.target.value)}
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                            disabled={updating}
                                            onClick={() => handleUpdate(req._id, 'approved')}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            style={{ color: 'var(--error)', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                            disabled={updating}
                                            onClick={() => handleUpdate(req._id, 'rejected')}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ alignSelf: 'center' }}>
                                    <span style={{
                                        color: req.status === 'approved' ? 'var(--success)' : 'var(--error)',
                                        fontWeight: 'bold',
                                        padding: '0.4rem 0.8rem',
                                        borderRadius: '8px',
                                        background: 'var(--bg-default)'
                                    }}>
                                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
