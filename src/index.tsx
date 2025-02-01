import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Archivo CSS principal donde Tailwind está configurado.
import App from './App'; // Importa el componente principal App.
import {AppProvider} from './AppContext'; // Importa el AppProvider
import * as Sentry from "@sentry/react";

// Configura Sentry
Sentry.init({
    dsn: 'https://171d0147fa3c68baed1676a52e4e2605@o4508082612666368.ingest.de.sentry.io/4508082614501456',
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
});

const rootElement = document.getElementById('root');
const handleCompletion = (data: any) => {
    console.log('Data received from wrapper:', data);
}

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <AppProvider>
                <App onComplete={handleCompletion}/>
            </AppProvider>
        </React.StrictMode>
    );
}