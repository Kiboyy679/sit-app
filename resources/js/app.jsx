import './bootstrap';
import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { route } from 'ziggy-js';
import { Ziggy } from './ziggy';

window.route = (name, params) => route(name, params, false, Ziggy);

// Load Google Fonts
if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap';
    document.head.appendChild(link);
}
if (!document.querySelector('link[href*="material-symbols"]')) {
    const link2 = document.createElement('link');
    link2.rel = 'stylesheet';
    link2.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    document.head.appendChild(link2);
}

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
        return pages[`./Pages/${name}.jsx`].default;
    },
    setup({ el, props, App }) {
        // Fix Inertia URL resolution for tunnels (Slim, Ngrok, etc.)
        // When APP_URL is empty, server sends relative URLs like "/login"
        // Inertia JS needs the full URL with origin to make AJAX requests
        if (props.url && !props.url.startsWith('http')) {
            props.url = window.location.origin + props.url;
        }
        createRoot(el).render(<App {...props} />);
    },
});
