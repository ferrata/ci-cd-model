import clsx from 'clsx'

type Props = {
  className?: string
  time: number
  timeRanges: {
    poor: number
    bad: number
  }
  animated: boolean
  colorizeTime: boolean
}

function durationToHumanReadable(duration: number) {
  const minutes = Math.floor(duration / 1000 / 60)
  const seconds = Math.floor(duration / 1000) % 60
  return `${minutes}m ${seconds}s`
}

function nodeStyle({ time, timeRanges, animated, colorizeTime }: Props): string {
  if (!colorizeTime) {
    return 'bg-slate-100 text-slate-400'
  }

  const redAlertAt = timeRanges.bad
  const yellowAlertAt = timeRanges.poor

  if (time >= yellowAlertAt && time < redAlertAt) {
    return 'bg-yellow-100 text-yellow-600'
  } else if (time >= redAlertAt) {
    return 'bg-red-100 text-red-500'
  } else {
    return 'bg-green-100 text-green-600'
  }
}

export function TimeLabel(props: Props) {
  return (
    <span
      className={clsx(
        props.className,
        'h-6 text-nowrap rounded-full p-1 px-2 text-center',
        nodeStyle(props),
        props.animated && 'animate-fadeIn'
      )}
    >
      {durationToHumanReadable(props.time)}
    </span>
  )
}
