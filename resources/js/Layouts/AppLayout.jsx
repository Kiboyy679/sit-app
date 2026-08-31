import React from 'react';
import Sidebar from '@/Components/Sidebar';
import TopBar from '@/Components/TopBar';
import BottomNav from '@/Components/BottomNav';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#131313]">
      <Sidebar />
      <TopBar />
      <main className="lg:ml-64 pt-16 pb-20 lg:pb-8 p-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
