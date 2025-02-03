'use client'

import Link from 'next/link'
import React from 'react'

import '@xyflow/react/dist/style.css'
import clsx from 'clsx'

import { TimeLabel } from '../time-label'

type Props = {
  className: string
  time: number
  timeRanges: {
    poor: number
    bad: number
  }
  animated: boolean
  colorizeTime: boolean
  link: {
    href: string
    target?: '_blank' | '_self'
  }
}

export function ActionTime({ className, time, timeRanges, animated, colorizeTime, link }: Props) {
  return (
    <div className={clsx(className, 'flex flex-col items-center justify-center')}>
      <Link href={link.href} target={link.target}>
        <TimeLabel
          className="h-9 px-3 text-base"
          animated={animated}
          colorizeTime={colorizeTime}
          timeRanges={timeRanges}
          time={time}
        />
      </Link>
    </div>
  )
}
