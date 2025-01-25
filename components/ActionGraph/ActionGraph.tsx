'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

import { layout } from '@dagrejs/dagre'
import { Graph } from '@dagrejs/graphlib'
import {
  Background,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  Edge,
  Node,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { ActionNode, NodeData } from './ActionNode'

const nodeTypes = {
  action: ActionNode,
}

type GraphProps = {
  backgroundColor: string
  orientation: string
}

type NodeProps = {
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

type EdgeProps = {
  fromNodeID: string
  toNodeID: string
  animated: boolean
}

interface Props {
  className: string
  height: number
  graph: GraphProps
  nodes: Array<NodeProps>
  edges: Array<EdgeProps>
}

function toNode(props: NodeProps): Node {
  return {
    type: 'action',
    id: props.id,
    data: {
      label: props.label,
      time: props.time,
      timeRanges: props.timeRanges,
      colorizeTime: props.colorizeTime,
      isCalculated: props.isCalculated,
    },
    position: { x: 100, y: 200 },
  }
}

const nodeWidth = 200
const nodeHeight = 50

function calculateGraph(
  dagreGraph: Graph,
  args: {
    orientation: string
    nodes: NodeProps[]
    edges: EdgeProps[]
  }
): {
  nodes: Node[]
  edges: Edge[]
} {
  const initialNodes = args.nodes.map(toNode)

  initialNodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  const edges: Edge[] = args.edges
    .filter(
      edge =>
        edge.fromNodeID &&
        edge.toNodeID &&
        dagreGraph.node(edge.fromNodeID) &&
        dagreGraph.node(edge.toNodeID)
    )
    .map(edge => ({
      id: `edge-${edge.fromNodeID}-${edge.toNodeID}`,
      source: edge.fromNodeID,
      target: edge.toNodeID,
      animated: edge.animated,
    }))

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  function getParentsTiming(nodeID: string): number {
    const node = args.nodes.find(node => node.id === nodeID)
    if (node == null) return 0

    const parents = dagreGraph.predecessors(nodeID)
    if (parents == null || parents.length === 0) {
      return node.time
    }

    const parentTimings = parents.map(parent => getParentsTiming(parent))
    const maxParentTiming = Math.max(...parentTimings)
    return node.isCalculated ? maxParentTiming : maxParentTiming + node.time
  }

  const calculatedTiming = dagreGraph.nodes().reduce((acc, nodeID) => {
    const node = args.nodes.find(node => node.id === nodeID)
    if (node == null || !node.isCalculated) return acc

    const timing = getParentsTiming(nodeID)
    acc.set(nodeID, timing)
    return acc
  }, new Map<string, number>())

  const isHorizontal = args.orientation === 'LR'
  dagreGraph.setGraph({ rankdir: args.orientation })

  // @ts-ignore: types mismatch
  layout(dagreGraph)

  const calculatedNodes: Node[] = initialNodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const timing = calculatedTiming.get(node.id) ?? node.data.time ?? 0
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
      data: { ...node.data, time: timing },
    }

    return newNode
  })

  return { nodes: calculatedNodes, edges }
}

export function ActionGraph({ className, height, graph, ...rest }: Props) {
  const dagreGraph = useRef(new Graph())
  dagreGraph.current.setDefaultEdgeLabel(() => ({}))

  const initialNodes = useMemo(() => rest.nodes.filter(node => node.id), [rest.nodes])
  const initialEdges = useMemo(
    () => rest.edges.filter(edge => edge.fromNodeID && edge.toNodeID),
    [rest.edges]
  )

  const [nodes, setNodes, _] = useNodesState<Node>([])
  const [edges, setEdges, __] = useEdgesState<Edge>([])

  useEffect(() => {
    const { nodes: recalculatedNodes, edges: recalculatedEdges } = calculateGraph(
      dagreGraph.current,
      {
        orientation: graph.orientation,
        nodes: initialNodes,
        edges: initialEdges,
      }
    )

    setNodes(recalculatedNodes)
    setEdges(recalculatedEdges)
  }, [graph.orientation, initialNodes, initialEdges])

  return (
    <div className={className}>
      <ReactFlow
        className={`min-h-[${height}px]`}
        nodes={nodes}
        edges={edges}
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <Background bgColor={graph.backgroundColor} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
