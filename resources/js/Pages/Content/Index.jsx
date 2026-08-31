import React, { useState, useCallback } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';

export default function ContentIndex({ reports, themes, period, myCount }) {
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [viewEditId, setViewEditId] = useState(null);
  const [viewValue, setViewValue] = useState('');

  const { data, setData, post, processing, errors, reset } = useForm({
    theme: '',
    description: '',
    files: [],
  });

  const submit = (e) => {
    e.preventDefault();
    setUploadProgress(0);
    post(route('content.store'), {
      forceFormData: true,
      onProgress: (e) => setUploadProgress(Math.round((e.loaded / e.total) * 100)),
      onSuccess: () => { setShowUpload(false); setUploadProgress(null); reset(); },
      onFinish: () => setUploadProgress(null),
    });
  };

  // KNT-11: Draft save via localStorage (auto-save every 5 seconds)
  React.useEffect(() => {
    const saved = localStorage.getItem('sitapp-content-draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.theme) setData('theme', draft.theme);
        if (draft.description) setData('description', draft.description);
      } catch (e) {}
    }
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (data.theme || data.description) {
        localStorage.setItem('sitapp-content-draft', JSON.stringify({ theme: data.theme, description: data.description }));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [data.theme, data.description]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const newFiles = Array.from(e.dataTransfer.files);
    setData('files', [...data.files, ...newFiles].slice(0, 10));
  }, [data.files]);

  const handleFileInput = (e) => {
    const newFiles = Array.from(e.target.files);
    setData('files', [...data.files, ...newFiles].slice(0, 10));
  };

  const removeFile = (index) => {
    setData('files', data.files.filter((_, i) => i !== index));
  };

  const updateViews = (reportId) => {
    if (viewValue === '' || isNaN(viewValue)) return;
    router.put(route('content.updateViews', reportId), { views: parseInt(viewValue) }, {
      preserveScroll: true,
      onSuccess: () => { setViewEditId(null); setViewValue(''); },
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <AppLayout>
      <Head title="Arsip Konten" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Arsip Konten</h1>
            <p className="text-white/50 text-sm">Periode {period} &middot; {myCount} berkas diunggah</p>
          </div>
          <Button onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? 'Tutup' : '+ Unggah Konten'}
          </Button>
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <GlassCard title="Unggah Arsip Konten">
            <form onSubmit={submit} className="space-y-4">
              {/* Theme Input */}
              <div>
                <Input
                  label="Tema *"
                  value={data.theme}
                  onChange={(e) => setData('theme', e.target.value)}
                  error={errors.theme}
                  placeholder="Ketik tema (akan dinormalisasi otomatis)"
                  list="theme-suggestions"
                  required
                />
                <datalist id="theme-suggestions">
                  {themes.map((t) => <option key={t.id} value={t.name} />)}
                </datalist>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-white/60 mb-1">Keterangan (opsional)</label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:ring-2 focus:ring-[#6bfb9a]/50 outline-none h-20 resize-none"
                  placeholder="Deskripsi singkat..."
                />
              </div>

              {/* KNT-04: Drag & Drop Area */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  dragOver
                    ? 'border-[#6bfb9a] bg-[#6bfb9a]/5'
                    : 'border-white/15 hover:border-white/25'
                }`}
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.webp,.mp4,.mov"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div className="text-4xl mb-2">📁</div>
                <p className="text-white/60 text-sm">
                  Seret & lepas berkas di sini, atau <span className="text-[#6bfb9a]">klik untuk memilih</span>
                </p>
                <p className="text-white/30 text-xs mt-1">
                  Maks 10 berkas &middot; Gambar max 5MB, Video max 50MB &middot; jpg, png, webp, mp4, mov
                </p>
              </div>

              {/* Selected Files */}
              {data.files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-white/60">{data.files.length} berkas dipilih:</p>
                  {data.files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-white/50 text-xs">
                          {file.type?.startsWith('video') ? '🎬' : '🖼️'}
                        </span>
                        <span className="text-sm text-white truncate">{file.name}</span>
                        <span className="text-xs text-white/40">{formatSize(file.size)}</span>
                      </div>
                      <button type="button" onClick={() => removeFile(idx)} className="text-red-400/60 hover:text-red-400 text-sm ml-2">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* KNT-04: Upload Progress */}
              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-white/50">
                    <span>Mengunggah...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-[#6bfb9a] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {errors.files && <p className="text-sm text-red-400">{errors.files}</p>}

              <div className="flex gap-2">
                <Button type="submit" disabled={processing || data.files.length === 0}>
                  {processing ? 'Mengunggah...' : 'Kirim'}
                </Button>
                <Button variant="ghost" onClick={() => { setShowUpload(false); reset(); }}>Batal</Button>
              </div>
            </form>
          </GlassCard>
        )}

        {/* Content Grid */}
        {reports.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reports.data.map((report) => (
              <GlassCard key={report.id} className="overflow-hidden">
                {/* Thumbnail Grid */}
                <div className="grid grid-cols-2 gap-1 mb-3 -mx-6 -mt-6">
                  {report.media?.slice(0, 4).map((media, idx) => (
                    <div key={media.id} className="aspect-square bg-white/5 flex items-center justify-center text-2xl">
                      {media.file_type === 'mp4' || media.file_type === 'mov' ? '🎬' : '🖼️'}
                    </div>
                  ))}
                  {(!report.media || report.media.length === 0) && (
                    <div className="col-span-2 aspect-video bg-white/5 flex items-center justify-center text-white/20 text-sm">
                      Tidak ada berkas
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="neon">{report.theme?.name || 'Tanpa Tema'}</Badge>
                    <span className="text-xs text-white/40">{report.report_date}</span>
                  </div>
                  <div className="text-xs text-white/50">{report.user?.name} &middot; {report.file_count} file</div>

                  {/* KNT-06: Views Update */}
                  <div className="flex items-center gap-2">
                    {viewEditId === report.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={viewValue}
                          onChange={(e) => setViewValue(e.target.value)}
                          className="w-20 bg-white/5 border border-white/15 rounded px-2 py-1 text-sm text-white"
                          min="0"
                          autoFocus
                        />
                        <button onClick={() => updateViews(report.id)} className="text-[#6bfb9a] text-xs">✓</button>
                        <button onClick={() => { setViewEditId(null); setViewValue(''); }} className="text-white/40 text-xs">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setViewEditId(report.id); setViewValue(report.views || 0); }}
                        className="text-sm text-white/70 hover:text-[#6bfb9a] transition-colors"
                      >
                        👁️ {(report.views || 0).toLocaleString()} views
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard>
            <div className="text-center py-12 text-white/30">
              <div className="text-4xl mb-3">📭</div>
              <p>Belum ada arsip konten untuk periode ini</p>
            </div>
          </GlassCard>
        )}

        {/* Pagination */}
        {reports.last_page > 1 && (
          <div className="flex justify-center gap-2">
            {reports.links.map((link, idx) => (
              <button
                key={idx}
                onClick={() => link.url && router.get(link.url)}
                disabled={!link.url}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  link.active
                    ? 'bg-[#6bfb9a]/20 text-[#6bfb9a] font-medium'
                    : link.url
                    ? 'bg-white/5 text-white/60 hover:bg-white/10'
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
