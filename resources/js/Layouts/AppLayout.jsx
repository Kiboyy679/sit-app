import React from 'react';
import Sidebar from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
import BottomNav from '@/Components/BottomNav';
import FlashMessage from '@/Components/FlashMessage';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <a href="#main-content" className="skip-link">Langsung ke konten</a>
      <FlashMessage />
      <Sidebar />
      <TopBar />
      <main id="main-content" className="lg:ml-64 pt-16 pb-20 lg:pb-8 p-6" role="main">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
