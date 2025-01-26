import { lazy } from 'react'

import {
  Group,
  List,
  Number,
  Style,
  Color,
  TextInput,
  Select,
  Checkbox,
} from "@makeswift/runtime/controls";

import { ActionGraph } from './';
import { runtime } from '@/lib/makeswift/runtime'

export const ACTION_GRAPH_COMPONENT_TYPE = "makeswift-action-graph";

const graph = Group({
  label: "Graph",
  preferredLayout: Group.Layout.Popover,
  props: {
    backgroundColor: Color({ label: "Background color", defaultValue: "#fcfcfc" }),
    orientation: Select({
      label: "Orientation",
      options: [
        { value: "LR", label: "Left to right" },
        { value: "TB", label: "Top to bottom" },
      ],
      defaultValue: "TB",
    }),
  },
});

const nodes = List({
  label: "Nodes",
  type: Group({
    label: "Node",
    props: {
      id: TextInput({ label: "ID", defaultValue: "" }),
      label: TextInput({ label: "Text", defaultValue: "" }),
      isCalculated: Checkbox({ label: "Calculated", defaultValue: false }),
      colorizeTime: Checkbox({ label: "Colorize time", defaultValue: false }),
      time: Number({ label: "Time (ms)", suffix: " ms", defaultValue: 2000 }),
      timeRanges: Group({
        label: "Time ranges (ms)",
        props: {
          poor: Number({ label: "Poor", suffix: " ms", defaultValue: 10000 }),
          bad: Number({ label: "Bad", suffix: " ms", defaultValue: 600000 }),
        },
      }),
    },
  }),
  getItemLabel: (item) => item?.label ?? 'Untitled',
});

const edges = List({
  label: "Edges",
  type: Group({
    label: "Edge",
    props: {
      fromNodeID: TextInput({ label: "From node ID", defaultValue: "" }),
      toNodeID: TextInput({ label: "To node ID", defaultValue: "" }),
      animated: Checkbox({ label: "Animated", defaultValue: true }),
    },
  }),
  getItemLabel: (item) => `${item?.fromNodeID ?? 'empty'} -> ${item?.toNodeID ?? 'empty'}`,
});

runtime.registerComponent(
  ActionGraph,
  {
    type: ACTION_GRAPH_COMPONENT_TYPE,
    label: 'Custom / ActionGraph',
    props: {
      className: Style(),
      height: Number({ label: "Height", defaultValue: 700 }),
      graph,
      nodes,
      edges,
    },
  }
)
