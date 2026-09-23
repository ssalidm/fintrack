interface AuthHeaderProps {
  readonly title: string
  readonly description?: string
  readonly titleId?: string
}

export default function AuthHeader({
  title,
  description,
  titleId,
}: AuthHeaderProps) {
  return (
    <header>
      <h1
        id={titleId}
        className="
          text-2xl
          font-semibold
          leading-tight
          tracking-[-0.025em]
          text-[#092f28]
        "
      >
        {title}
      </h1>

      {description && (
        <p className="mt-2 text-[13px] leading-5 text-[#6f7d76]">
          {description}
        </p>
      )}
    </header>
  )
}