import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Badge from '@/Components/Badge';

const actionLabels = {
  seed_data: { label: 'Seed Data', variant: 'default' },
  update_views: { label: 'Update Views', variant: 'info' },
  fyp_submit: { label: 'Submit FYP', variant: 'neon' },
  fyp_approved: { label: 'Approve FYP', variant: 'success' },
  fyp_rejected: { label: 'Reject FYP', variant: 'danger' },
  fyp_bulk_approved: { label: 'Bulk Approve', variant: 'success' },
  fyp_bulk_rejected: { label: 'Bulk Reject', variant: 'danger' },
  leave_submit: { label: 'Submit Izin', variant: 'neon' },
  leave_approved: { label: 'Approve Izin', variant: 'success' },
  leave_rejected: { label: 'Reject Izin', variant: 'danger' },
  attendance_record: { label: 'Record Absensi', variant: 'info' },
};

export default function AuditIndex({ logs, users }) {
  const applyFilter = (key, value) => {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    router.get(route('audit.index') + '?' + params.toString());
  };

  return (
    <AppLayout>
      <Head title="Jejak Audit" />
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Jejak Audit</h1>
          <p className="text-on-surface-variant text-xs sm:text-sm">Riwayat seluruh perubahan data dalam sistem</p>
        </div>

        {/* Filters — mobile stacked */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <select onChange={(e) => applyFilter('user_id', e.target.value)}
            className="bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2.5 text-on-surface text-sm w-full sm:w-auto">
            <option value="">Semua Pengguna</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input type="text" placeholder="Cari aksi..."
            onKeyDown={(e) => e.key === 'Enter' && applyFilter('action', e.target.value)}
            className="bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2.5 text-on-surface text-sm placeholder:text-on-surface-variant/30 w-full sm:w-auto" />
          <div className="flex gap-2 w-full sm:w-auto">
            <input type="date" onChange={(e) => applyFilter('date_from', e.target.value)}
              className="bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2.5 text-on-surface text-sm flex-1 sm:flex-none"
              title="Dari tanggal" />
            <input type="date" onChange={(e) => applyFilter('date_to', e.target.value)}
              className="bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2.5 text-on-surface text-sm flex-1 sm:flex-none"
              title="Sampai tanggal" />
          </div>
        </div>

        {/* ===== MOBILE: Card List ===== */}
        <div className="md:hidden space-y-3">
          {logs.data.length > 0 ? logs.data.map((log) => {
            const action = actionLabels[log.action] || { label: log.action, variant: 'default' };
            return (
              <GlassCard key={log.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[14px] text-primary">person</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{log.user?.name || 'System'}</p>
                      <Badge variant={action.variant} className="text-[10px] mt-0.5">{action.label}</Badge>
                    </div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant whitespace-nowrap shrink-0">
                    {log.created_at ? new Date(log.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                  </span>
                </div>
                {log.new_values && (
                  <p className="text-xs text-on-surface-variant/70 mt-2 truncate">
                    {typeof log.new_values === 'object' ? JSON.stringify(log.new_values).slice(0, 100) : log.new_values}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/20">
                  <span className="text-[10px] text-on-surface-variant/50">
                    {log.created_at ? new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  <span className="text-[10px] text-on-surface-variant/40 font-mono">{log.ip_address}</span>
                </div>
              </GlassCard>
            );
          }) : (
            <GlassCard className="text-center py-12 text-on-surface-variant/50">
              <div className="text-4xl mb-3">🔍</div>
              <p>Belum ada jejak audit</p>
            </GlassCard>
          )}
        </div>

        {/* ===== DESKTOP: Table ===== */}
        <div className="hidden md:block">
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-left text-on-surface-variant">
                    <th className="py-3 px-3">Waktu</th>
                    <th className="py-3 px-3">Pengguna</th>
                    <th className="py-3 px-3">Aksi</th>
                    <th className="py-3 px-3">Detail</th>
                    <th className="py-3 px-3">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.data.map((log) => {
                    const action = actionLabels[log.action] || { label: log.action, variant: 'default' };
                    return (
                      <tr key={log.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/50">
                        <td className="py-3 px-3 text-on-surface-variant text-xs">
                          {log.created_at ? new Date(log.created_at).toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="py-3 px-3 text-on-surface">{log.user?.name || 'System'}</td>
                        <td className="py-3 px-3">
                          <Badge variant={action.variant}>{action.label}</Badge>
                        </td>
                        <td className="py-3 px-3">
                          {log.new_values && (
                            <span className="text-xs text-on-surface-variant/70 max-w-xs truncate block">
                              {typeof log.new_values === 'object' ? JSON.stringify(log.new_values).slice(0, 80) : log.new_values}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-on-surface-variant/50 text-xs font-mono">{log.ip_address}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {logs.data.length === 0 && (
                <div className="text-center py-12 text-on-surface-variant/50">
                  <div className="text-4xl mb-3">🔍</div>
                  <p>Belum ada jejak audit</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Pagination */}
        {logs.last_page > 1 && (
          <div className="flex justify-center gap-2 flex-wrap">
            {logs.links.map((link, idx) => (
              <button key={idx} onClick={() => link.url && router.get(link.url)} disabled={!link.url}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${link.active ? 'bg-primary/10 text-primary font-medium' : link.url ? 'bg-surface-container-low/50 text-on-surface-variant hover:bg-surface-container-high' : 'bg-surface-container-low/50 text-on-surface-variant/30 cursor-not-allowed'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
