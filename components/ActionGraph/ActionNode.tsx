import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import clsx from 'clsx'

export type NodeData = {
  id: string
  label: string
  time: number
  isCalculated: boolean
}

function durationToHumanReadable(duration: number) {
  const minutes = Math.floor(duration / 1000 / 60)
  const seconds = Math.floor(duration / 1000) % 60
  return `${minutes}m ${seconds}s`
}

const redAlertAt = 5000
const yellowAlertAt = 2000

function nodeStyle(time: number, isCalculated: boolean): string {
  if (!isCalculated) {
    return 'bg-slate-100 text-slate-400'
  }

  if (time >= yellowAlertAt && time < redAlertAt) {
    return 'bg-yellow-200 text-yellow-900'
  } else if (time >= redAlertAt) {
    return 'bg-red-100 text-red-500'
  } else {
    return 'bg-green-100 text-green-600'
  }
}

export function ActionNode({ data, sourcePosition, targetPosition }: NodeProps<Node<NodeData>>) {
  return (
    <div className="flex w-48 flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs shadow-lg">
      <div className="my-2 flex h-3 w-full flex-row items-center justify-between gap-1 px-2 text-xs">
        <span className={clsx('flex-grow', data.time > 0 ? '' : 'text-center')}>{data.label}</span>

        {data.time > 0 && (
          <span className={clsx('rounded-full p-1 px-2', nodeStyle(data.time, data.isCalculated))}>
            {durationToHumanReadable(data.time)}
          </span>
        )}
      </div>

      <Handle
        type="target"
        position={targetPosition ?? Position.Top}
        className="w-16 bg-slate-500"
      />
      <Handle
        type="source"
        position={sourcePosition ?? Position.Bottom}
        className="w-16 bg-slate-500"
      />
    </div>
  )
}
