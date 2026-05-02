import React from 'react';

export default function About() {
  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '800px' }}>
      <h1 style={{ fontFamily: 'Playfair Display', marginBottom: '1rem' }}>About African Hair Saloon</h1>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Our Salon</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          African Hair Saloon is a modern salon that combines traditional grooming expertise with smart technology. 
          We offer a full range of services from hair and beard to facials, spa, bridal, and skin care—all 
          managed through our automation platform for a seamless experience.
        </p>
      </section>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Vision & Mission</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
          <strong>Vision:</strong> To be the most trusted and tech-enabled salon brand in India, where every 
          visit is personal, professional, and predictable.
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          <strong>Mission:</strong> To deliver exceptional grooming and wellness services with transparency 
          in pricing, punctuality, and hygiene—powered by our salon automation system.
        </p>
      </section>

      <section className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Our Team</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Our team includes experienced stylists, beauticians, and wellness experts trained in the latest 
          techniques. Each team member is assigned to specific services to ensure quality and consistency.
        </p>
        <p style={{ color: 'var(--text-secondary)' }}>
          Log in as Client to book with your preferred professional; Employees get their own dashboard 
          to manage schedules and leave.
        </p>
      </section>
    </div>
  );
}
