import {
  ChartNoAxesCombined,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'

const features = [
  {
    icon: WalletCards,
    title: 'Everything in one place',
    description:
      'Track your accounts, spending, budgets and goals together.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'See your money clearly',
    description:
      'Understand where your money goes and what needs your attention.',
  },
  {
    icon: ShieldCheck,
    title: 'Built with privacy in mind',
    description:
      'Your financial information stays protected and under your control.',
  },
]

export default function AuthIntro() {
  return (
    <div className="flex h-full flex-col px-12 py-12 xl:px-14">
      <div>
        <h2 className="max-w-md text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.04em] text-ink">
          Welcome to Salif
        </h2>

        <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
          A clearer way to understand and manage your money.
        </p>
      </div>

      <div className="mt-12 space-y-7">
        {features.map(
          ({
            icon: Icon,
            title,
            description,
          }) => (
            <div
              key={title}
              className="flex items-start gap-4"
            >
              <span className="grid size-8 shrink-0 place-items-center text-accent">
                <Icon
                  size={21}
                  strokeWidth={1.7}
                  aria-hidden
                />
              </span>

              <div>
                <h3 className="text-sm font-semibold text-ink">
                  {title}
                </h3>

                <p className="mt-1 max-w-[290px] text-[13px] leading-5 text-muted">
                  {description}
                </p>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  )
}