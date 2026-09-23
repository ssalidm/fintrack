import salifLogoLight from '../../../../assets/brand/salif-logo-light.png'

interface SalifLogoProps {
  readonly compact?: boolean
}

export default function SalifLogo({
  compact = false,
}: SalifLogoProps) {
  if (compact) {
    return (
      <span
        className="
          grid size-10
          place-items-center
          rounded-xl
          bg-white/10
          text-lg font-bold
          text-white
          ring-1 ring-inset ring-white/10
        "
        aria-hidden
      >
        S
      </span>
    )
  }

  return (
    <div className="h-[50px] w-[118px] overflow-hidden">
      <img
        src={salifLogoLight}
        alt="Salif"
        className="h-[156px] w-[156px] max-w-none -translate-x-[19px] -translate-y-[50px]"
      />
    </div>
  )
}
