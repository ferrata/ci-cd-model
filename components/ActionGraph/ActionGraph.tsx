'use client'

import React, { useEffect, useMemo, useRef } from 'react'

import { layout } from '@dagrejs/dagre'
import { Graph } from '@dagrejs/graphlib'
import {
  Background,
  Controls,
  Edge,
  EdgeMarker,
  MarkerType,
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
  autoLayout: boolean
  markerEnd: 'arrow' | 'arrowclosed' | 'none'
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

function toEdge(props: EdgeProps): Edge {
  const markerEnd: EdgeMarker | undefined =
    props.markerEnd === 'none'
      ? undefined
      : {
          type: props.markerEnd as MarkerType,
          width: 25,
          height: 25,
        }

  return {
    id: `edge-${props.fromNodeID}-${props.toNodeID}`,
    source: props.fromNodeID,
    target: props.toNodeID,
    animated: props.animated,
    markerEnd: markerEnd,
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

  const initialEdges: EdgeProps[] = args.edges.filter(
    edge =>
      edge.fromNodeID &&
      edge.toNodeID &&
      dagreGraph.node(edge.fromNodeID) &&
      dagreGraph.node(edge.toNodeID)
  )

  const edges: Edge[] = initialEdges.filter(edge => edge.autoLayout).map(toEdge)

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

  let lastFreeNodeY = 25

  const calculatedNodes: Node[] = initialNodes.map(node => {
    const edges = dagreGraph.nodeEdges(node.id) ?? []

    const nodeWithPosition = dagreGraph.node(node.id)
    const timing = calculatedTiming.get(node.id) ?? node.data.time ?? 0
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position:
        edges.length > 0
          ? { x: nodeWithPosition.x, y: nodeWithPosition.y }
          : { x: -200, y: lastFreeNodeY },
      data: { ...node.data, time: timing },
    }

    lastFreeNodeY += edges.length === 0 ? 100 : 0

    return newNode
  })

  const calculatedEdges: Edge[] = [
    ...edges,
    ...initialEdges.filter(edge => !edge.autoLayout).map(toEdge),
  ]

  return { nodes: calculatedNodes, edges: calculatedEdges }
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
    <div className={className} style={{ height }}>
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
        <Background bgColor={graph.backgroundColor} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
