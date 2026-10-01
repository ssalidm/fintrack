import { useEffect } from 'react'
import { useLocation } from 'react-router'

export default function ScrollToTop() {
  const {
    pathname,
    hash,
  } = useLocation()

  useEffect(() => {
    if (hash) {
      const element =
        document.getElementById(
          hash.slice(1),
        )

      if (element) {
        requestAnimationFrame(() => {
          element.scrollIntoView()
        })
      }

      return
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
  }, [pathname, hash])

  return null
}