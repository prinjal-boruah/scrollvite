// File: frontend/app/providers.tsx

"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from 'react-hot-toast';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GoogleOAuthProvider clientId="425155079942-a82q3nlgnpu7ulghp7dqp98effirdi2l.apps.googleusercontent.com">
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#2C2416',
            borderRadius: '12px',
            border: '1px solid #D4AF37',
            padding: '16px',
            boxShadow: '0 4px 12px rgba(212, 175, 55, 0.15)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#D4AF37',
              secondary: '#ffffff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#2C2416',
              border: '1px solid #ef4444',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#D4AF37',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </GoogleOAuthProvider>
  );
}