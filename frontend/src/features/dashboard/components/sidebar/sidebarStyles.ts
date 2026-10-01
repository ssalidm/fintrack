export const sidebarItemBase = [
  'relative flex w-full items-center',
  'rounded-tr-full rounded-br-full px-3.5 py-2.5',
  'text-sm font-medium',
  'transition-colors duration-150',
].join(' ')

export function sidebarItemClass(
  isActive: boolean,
  isCollapsed: boolean,
) {
  return [
    sidebarItemBase,

    isCollapsed
      ? 'justify-center px-0'
      : 'gap-3',

    isActive
      ? [
          'bg-white/10',
          'text-white',
          'ring-1 ring-inset ring-white/10',
          'before:absolute',
          'before:left-0',
          'before:top-1/2',
          'before:h-10',
          'before:w-1',
          'before:-translate-y-1/2',
          'before:bg-[#bcd9c5]',
          'shadow-sm'
        ].join(' ')
      : [
          'text-[#c5d8d0]',
          'hover:bg-white/[0.06]',
          'hover:text-white',
        ].join(' '),
  ].join(' ')
}