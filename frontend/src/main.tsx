import {StrictMode} from 'react'
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
        <RouterProvider router={router}/>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
