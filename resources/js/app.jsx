import './bootstrap';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { App } from '@inertiajs/react';
import React from 'react';

const el = document.getElementById('app');
if (el) {
  const root = createRoot(el);
  root.render(
    <App
      initialPage={JSON.parse(el.dataset.page)}
      resolveComponent={(name) => import(`./Pages/${name}`).then(module => module.default)}
    />
  );
}
