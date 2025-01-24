'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

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
import dagre from 'dagre'

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
  isCalculated: boolean
}

type EdgeProps = {
  fromNodeID: string
  toNodeID: string
  animated: boolean
}

interface Props {
  className: string
  graph: GraphProps
  nodes: Array<NodeProps>
  edges: Array<EdgeProps>
}

function toNode(props: NodeProps): Node {
  return {
    type: 'action',
    id: props.id,
    data: { label: props.label, time: props.time, isCalculated: props.isCalculated },
    position: { x: 100, y: 200 },
  }
}

const nodeWidth = 200
const nodeHeight = 50

function createGraph(
  dagreGraph: dagre.graphlib.Graph,
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
    .filter(edge => edge.fromNodeID && edge.toNodeID)
    .map(edge => ({
      id: `edge-${edge.fromNodeID}-${edge.toNodeID}`,
      source: edge.fromNodeID,
      target: edge.toNodeID,
      animated: edge.animated,
    }))

  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  const isHorizontal = args.orientation === 'LR'
  dagreGraph.setGraph({ rankdir: args.orientation })
  dagre.layout(dagreGraph)

  const newNodes: Node[] = initialNodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id)
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
    }

    return newNode
  })

  return { nodes: newNodes, edges }
}

export function ActionGraph({ className, graph, ...rest }: Props) {
  const dagreGraph = useRef(new dagre.graphlib.Graph())
  dagreGraph.current.setDefaultEdgeLabel(() => ({}))

  const initialNodes = useMemo(() => rest.nodes.filter(node => node.id), [rest.nodes])
  const initialEdges = useMemo(
    () => rest.edges.filter(edge => edge.fromNodeID && edge.toNodeID),
    [rest.edges]
  )

  const [nodes, setNodes, _] = useNodesState<Node>([])
  const [edges, setEdges, __] = useEdgesState<Edge>([])

  useEffect(() => {
    const { nodes: recalculatedNodes, edges: recalculatedEdges } = createGraph(dagreGraph.current, {
      orientation: graph.orientation,
      nodes: initialNodes,
      edges: initialEdges,
    })

    setNodes(recalculatedNodes)
    setEdges(recalculatedEdges)
  }, [graph.orientation, initialNodes, initialEdges])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
      >
        <Background bgColor={graph.backgroundColor} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
