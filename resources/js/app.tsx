import { createInertiaApp } from '@inertiajs/react';
import { initializeTheme } from '@/hooks/use-appearance';
import AuthLayout from '@/layouts/auth-layout';
import AppLayout from './layouts/app-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Buddy Script';


createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return AppLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            default:
                return null;
        }
    },
    strictMode: true,
    withApp(app) {
        return app;
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
