'use client';

import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => (
  <Toaster
    position="bottom-right"
    
    toastOptions={{
      style: {
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
      },
    }}
  />
);
