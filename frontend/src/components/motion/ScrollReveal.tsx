import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  const [isVisible, setIsVisible] = useState(() =>
    window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches,
  )

  useEffect(() => {
    const element = elementRef.current

    if (!element) {
      return
    }

    if (
      window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
    ) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return
        }

        setIsVisible(true)
        observer.unobserve(entry.target)
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={elementRef}
      data-visible={isVisible}
      className={`home-scroll-reveal ${className}`}
      style={
        {
          '--home-reveal-delay': `${delay}ms`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}