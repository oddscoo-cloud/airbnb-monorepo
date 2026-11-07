import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppLoading } from './components/AppLoading/AppLoading'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { LanguageProvider } from './i18n'

// Монтирование дерева React в HTML-контейнер #root.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Контекст Google OAuth для дочерних компонентов. */}
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'missing-google-client-id'}>
      <LanguageProvider>
        <Suspense fallback={<AppLoading />}>
          <App />
        </Suspense>
      </LanguageProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
