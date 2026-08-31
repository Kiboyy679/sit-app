import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatCard from '@/Components/StatCard';
import GlassCard from '@/Components/GlassCard';
import Badge from '@/Components/Badge';

export default function Dashboard({ stats }) {
  return (
    <AppLayout>
      <Head title="Dashboard" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-white/50 text-sm mt-1">Ringkasan periode berjalan</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Konten" value={stats?.content_count || 0} icon="📁" color="neon" />
          <StatCard label="Total Penayangan" value={stats?.total_views || 0} icon="👁️" color="blue" />
          <StatCard label="FYP Disetujui" value={stats?.fyp_approved || 0} icon="✅" color="neon" />
          <StatCard label="Izin Pending" value={stats?.leaves_pending || 0} icon="⏳" color="yellow" />
        </div>

        {/* Recent Content Reports */}
        <GlassCard title="Laporan Konten Terbaru">
          {stats?.recent_content?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_content.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-sm text-white">{item.theme?.name || 'Tanpa Tema'}</div>
                    <div className="text-xs text-white/40">{item.user?.name} &middot; {item.file_count} file</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-[#6bfb9a]">{item.views?.toLocaleString()} views</div>
                    <div className="text-xs text-white/40">{item.report_date}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-sm">Belum ada data</p>
          )}
        </GlassCard>

        {/* Recent FYP */}
        <GlassCard title="Laporan FYP Terbaru">
          {stats?.recent_fyp?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_fyp.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{item.original_url}</div>
                    <div className="text-xs text-white/40">{item.user?.name} &middot; {item.platform}</div>
                  </div>
                  <Badge variant={
                    item.status === 'approved' ? 'success' :
                    item.status === 'rejected' ? 'danger' : 'warning'
                  }>
                    {item.status === 'approved' ? 'Disetujui' :
                     item.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-sm">Belum ada laporan</p>
          )}
        </GlassCard>
      </div>
    </AppLayout>
  );
}
