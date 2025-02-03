import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import clsx from 'clsx'

import { TimeLabel } from '../time-label'

export type NodeData = {
  id: string
  label: string
  time: number
  timeRanges: {
    poor: number
    bad: number
  }
  colorizeTime: boolean
  isCalculated: boolean
}

export function ActionNode({ data, sourcePosition, targetPosition }: NodeProps<Node<NodeData>>) {
  const isStartNode = data.time === 0 && data.isCalculated === false
  const isEndNode = data.isCalculated === true

  return (
    <div
      className={clsx(
        'flex w-48 flex-col items-center justify-center rounded-lg border p-2 text-xs shadow-lg',
        isStartNode && 'border-violet-200 bg-violet-50',
        isEndNode && 'border-slate-300 bg-slate-100',
        !isStartNode && !isEndNode && 'border-slate-200 bg-slate-50'
      )}
    >
      <div className="my-2 flex h-3 w-full flex-row items-center justify-between gap-1 px-2 text-xs">
        <span className={clsx('flex-grow', data.time > 0 ? '' : 'text-center')}>{data.label}</span>

        {data.time > 0 && (
          <TimeLabel
            animated={data.isCalculated}
            colorizeTime={data.colorizeTime || data.isCalculated}
            timeRanges={data.timeRanges}
            time={data.time}
          />
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
