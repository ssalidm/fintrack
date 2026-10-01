import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import '@fontsource-variable/manrope'

import { queryClient } from './api/queryClient.ts'
import { router } from './app/router.tsx'
import AuthProvider from './features/auth/context/AuthProvider.tsx'
import ThemeProvider from './features/theme/context/ThemeProvider.tsx'
import { initializeTheme } from './features/theme/themePreference.ts'
import './index.css'
import './features/theme/theme.css'

initializeTheme()

createRoot(
  document.getElementById('root')!,
).render(
  <StrictMode>
    <QueryClientProvider
      client={queryClient}
    >
      <ThemeProvider>
        <AuthProvider>
          <Suspense
            fallback={
              <main className="grid min-h-screen place-items-center bg-app">
                <div className="text-center">
                  <div
                    className="mx-auto size-8 animate-spin rounded-full border-4 border-line border-t-primary"
                    aria-hidden
                  />

                  <p className="mt-4 text-sm text-muted">
                    Loading Salif…
                  </p>
                </div>
              </main>
            }
          >
            <RouterProvider
              router={router}
            />
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
