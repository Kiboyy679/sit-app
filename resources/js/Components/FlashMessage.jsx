import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function FlashMessage() {
  const { flash } = usePage().props;
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success');

  useEffect(() => {
    if (flash?.success) {
      setMessage(flash.success);
      setType('success');
      setVisible(true);
      setTimeout(() => setVisible(false), 3000);
    } else if (flash?.error) {
      setMessage(flash.error);
      setType('error');
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
    }
  }, [flash]);

  if (!visible) return null;

  return (
    <div className={`fixed top-20 right-6 z-[60] px-4 py-3 rounded-lg shadow-lg backdrop-blur-xl border transition-all duration-300 ${
      type === 'success'
        ? 'bg-green-500/20 border-green-500/30 text-green-400'
        : 'bg-red-500/20 border-red-500/30 text-red-400'
    }`}>
      <div className="flex items-center gap-2 text-sm">
        <span>{type === 'success' ? '✓' : '✕'}</span>
        {message}
      </div>
    </div>
  );
}
