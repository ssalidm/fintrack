import {StrictMode, Suspense} from 'react'
import {createRoot} from 'react-dom/client'
import {RouterProvider} from "react-router";
import {router} from "./app/router.tsx";
import './index.css'
import AuthProvider from "./features/auth/context/AuthProvider.tsx";
import {QueryClientProvider} from "@tanstack/react-query";
import {queryClient} from "./api/queryClient.ts";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense
          fallback={
            <main className="grid min-h-screen place-items-center bg-[#f7f5ef]">
              <div className="text-center">
                <div
                  className="mx-auto size-8 animate-spin rounded-full border-4 border-[#d8d6ce] border-t-[#174f43]"
                  aria-hidden
                />

                <p className="mt-4 text-sm text-[#657972]">
                  Loading Salif…
                </p>
              </div>
            </main>
          }
        >
          <RouterProvider router={router}/>
        </Suspense>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
