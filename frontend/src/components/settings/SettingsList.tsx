import {
  Children,
  type ReactNode,
} from 'react'

interface SettingsListProps {
  readonly children: ReactNode
  readonly className?: string
  readonly topBorder?: boolean
}

export default function SettingsList({
  children,
  className = '',
  topBorder = true,
}: SettingsListProps) {
  const items =
    Children.toArray(children)

  return (
    <div
      className={`
        ${topBorder
          ? 'border-t border-line/40'
          : ''}
        ${className}
      `}
    >
      {items.map(
        (child, index) => {
          const isLast =
            index === items.length - 1

          return (
            <div
              key={index}
              className={`
          ${index === 0
                  ? ''
                  : 'border-t border-line/40'
                }
          ${isLast
                  ? '[&>*]:pb-0'
                  : ''
                }
        `}
            >
              {child}
            </div>
          )
        },
      )}
    </div>
  )
}