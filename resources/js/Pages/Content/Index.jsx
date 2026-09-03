import React, { useState, useCallback, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import GlassCard from '@/Components/GlassCard';
import Button from '@/Components/Button';
import Input from '@/Components/Input';
import Badge from '@/Components/Badge';

// Helper: generate consistent color from string hash
function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

export default function ContentIndex({ reports, themes, period, myCount }) {
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [viewEditId, setViewEditId] = useState(null);
  const [viewValue, setViewValue] = useState('');

  // Helper: get placeholder color from hash
  const getPlaceholderColor = useCallback((filePath, fileType) => {
    return hashColor(filePath || fileType || 'default');
  }, []);

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Arsip Konten</h1>
            <p className="text-on-surface-variant text-xs sm:text-sm">Periode {period} &middot; {myCount} berkas diunggah</p>
          </div>
          <Button onClick={() => setShowUpload(!showUpload)} className="w-full sm:w-auto">
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
                <label className="block text-sm text-on-surface-variant mb-1">Keterangan (opsional)</label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  className="w-full bg-surface-container-low/50 border border-outline-variant/50 rounded-lg px-3 py-2 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-2 focus:ring-primary/50 outline-none h-20 resize-none"
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
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant/50 hover:border-outline-variant'
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
                <p className="text-on-surface-variant text-sm">
                  Seret & lepas berkas di sini, atau <span className="text-primary">klik untuk memilih</span>
                </p>
                <p className="text-on-surface-variant/50 text-xs mt-1">
                  Maks 10 berkas &middot; Gambar max 5MB, Video max 50MB &middot; jpg, png, webp, mp4, mov
                </p>
              </div>

              {/* Selected Files */}
              {data.files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-on-surface-variant">{data.files.length} berkas dipilih:</p>
                  {data.files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-surface-container-low/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-on-surface-variant text-xs">
                          {file.type?.startsWith('video') ? '🎬' : '🖼️'}
                        </span>
                        <span className="text-sm text-on-surface truncate">{file.name}</span>
                        <span className="text-xs text-on-surface-variant/70">{formatSize(file.size)}</span>
                      </div>
                      <button type="button" onClick={() => removeFile(idx)} className="text-error/60 hover:text-error text-sm ml-2">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* KNT-04: Upload Progress */}
              {uploadProgress !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>Mengunggah...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {errors.files && <p className="text-sm text-error">{errors.files}</p>}

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-full">
           {reports.data.map((report) => (
             <GlassCard key={report.id} className="overflow-hidden">
               {/* Thumbnail Grid - Real images with colored placeholders */}
                 <div className="grid grid-cols-2 gap-1 mb-3 mx-auto max-w-full overflow-hidden">
                   {report.media?.slice(0, 4).map((media, idx) => (
                     <div key={media.id} className="aspect-square relative overflow-hidden">
                       {media.thumbnail_path ? (
                         <img
                           src={`/storage/${media.thumbnail_path}`}
                           alt={`Thumbnail ${idx + 1}`}
                           className="w-full h-full object-cover"
                           loading="lazy"
                           onError={(e) => { e.target.src = ''; e.target.style.display = 'none'; e.target.nextElementSibling?.style.display = 'flex'; }}
                         />
                       ) : null}
                       {media.file_path && !media.thumbnail_path ? (
                         <img
                           src={`/storage/${media.file_path}`}
                           alt={`Media ${idx + 1}`}
                           className="w-full h-full object-cover"
                           loading="lazy"
                           onError={(e) => { e.target.src = ''; e.target.style.display = 'none'; e.target.nextElementSibling?.style.display = 'flex'; }}
                         />
                       ) : null}
                       <div
                        className="w-full h-full flex items-center justify-center text-2xl"
                        style={{ background: getPlaceholderColor(media.thumbnail_path || media.file_path, media.file_type) }}
                      >
                        {media.file_type === 'mp4' || media.file_type === 'mov' ? '🎬' : '🖼️'}
                      </div>
                       {media.file_type === 'mp4' || media.file_type === 'mov' ? (
                         <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">🎬</span>
                       ) : null}
                     </div>
                   ))}
                   {(!report.media || report.media.length === 0) && (
                     <div className="col-span-2 aspect-video bg-surface-container-low/50 flex items-center justify-center text-on-surface-variant/30 text-sm">
                       Tidak ada berkas
                     </div>
                   )}
                 </div>

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="neon">{report.theme?.name || 'Tanpa Tema'}</Badge>
                    <span className="text-xs text-on-surface-variant/70">{report.report_date}</span>
                  </div>
                  <div className="text-xs text-on-surface-variant">{report.user?.name} &middot; {report.file_count} file</div>

                  {/* KNT-06: Views Update */}
                  <div className="flex items-center gap-2">
                    {viewEditId === report.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={viewValue}
                          onChange={(e) => setViewValue(e.target.value)}
                          className="w-20 bg-surface-container-low/50 border border-outline-variant/50 rounded px-2 py-1 text-sm text-on-surface"
                          min="0"
                          autoFocus
                        />
                        <button onClick={() => updateViews(report.id)} className="text-primary text-xs">✓</button>
                        <button onClick={() => { setViewEditId(null); setViewValue(''); }} className="text-on-surface-variant/70 text-xs">✕</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setViewEditId(report.id); setViewValue(report.views || 0); }}
                        className="text-sm text-on-surface-variant hover:text-primary transition-colors"
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
            <div className="text-center py-12 text-on-surface-variant/50">
              <div className="text-4xl mb-3">📭</div>
              <p>Belum ada arsip konten untuk periode ini</p>
            </div>
          </GlassCard>
        )}

        {/* Pagination */}
        {reports.last_page > 1 && (
          <div className="flex justify-center gap-1 sm:gap-2 flex-wrap">
            {reports.links.map((link, idx) => (
              <button
                key={idx}
                onClick={() => link.url && router.get(link.url)}
                disabled={!link.url}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all ${
                  link.active
                    ? 'bg-primary/10 text-primary font-medium'
                    : link.url
                    ? 'bg-surface-container-low/50 text-on-surface-variant hover:bg-surface-container-high'
                    : 'bg-surface-container-low/50 text-on-surface-variant/30 cursor-not-allowed'
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
