import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';

export default function PublicLayout() {
  return (
    <>
      <Header />
      <main style={{ minHeight: 'calc(100vh - 140px)' }}>
        <Outlet />
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
