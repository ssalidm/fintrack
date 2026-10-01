import {
  useEffect,
  useState,
} from 'react'

const storageKey =
  'salif.dashboard.sidebarCollapsed'

export default function useSidebarPreference() {
  const [
    isCollapsed,
    setIsCollapsed,
  ] = useState(() => {
    if (
      typeof window === 'undefined'
    ) {
      return false
    }

    return (
      window.localStorage.getItem(
        storageKey,
      ) === 'true'
    )
  })

  useEffect(() => {
    window.localStorage.setItem(
      storageKey,
      String(isCollapsed),
    )
  }, [isCollapsed])

  return {
    isCollapsed,
    toggle: () =>
      setIsCollapsed(
        (current) => !current,
      ),
  }
}
