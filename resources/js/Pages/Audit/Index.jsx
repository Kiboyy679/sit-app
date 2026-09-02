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
          <h1 className="text-2xl font-bold text-on-surface">Jejak Audit</h1>
          <p className="text-on-surface-variant text-sm">Riwayat seluruh perubahan data dalam sistem</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select onChange={(e) => applyFilter('user_id', e.target.value)}
            className="bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface text-sm">
            <option value="">Semua Pengguna</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input type="text" placeholder="Cari aksi..."
            onKeyDown={(e) => e.key === 'Enter' && applyFilter('action', e.target.value)}
            className="bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface text-sm placeholder:text-on-surface-variant/30"
          />
          <input type="date" onChange={(e) => applyFilter('date_from', e.target.value)}
            className="bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface text-sm"
            title="Dari tanggal"
          />
          <input type="date" onChange={(e) => applyFilter('date_to', e.target.value)}
            className="bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface text-sm"
            title="Sampai tanggal"
          />
        </div>

        {/* Log Table */}
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

        {/* Pagination */}
        {logs.last_page > 1 && (
          <div className="flex justify-center gap-2">
            {logs.links.map((link, idx) => (
              <button key={idx} onClick={() => link.url && router.get(link.url)} disabled={!link.url}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  link.active ? 'bg-primary/10 text-primary font-medium'
                  : link.url ? 'bg-surface-container-low/50 text-on-surface-variant hover:bg-surface-container-high'
                  : 'bg-surface-container-low/50 text-on-surface-variant/30 cursor-not-allowed'
                }`} dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
