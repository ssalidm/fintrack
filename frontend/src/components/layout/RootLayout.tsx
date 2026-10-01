import { Outlet } from 'react-router'

import ScrollToTop from '@/components/navigation/ScrollToTop'

export default function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  )
}