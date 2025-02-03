
import {
  Group,
  Number,
  Style,
  Checkbox,
  Link,
} from "@makeswift/runtime/controls";

import { ActionTime } from './';
import { runtime } from '@/lib/makeswift/runtime'

export const ACTION_TIME_COMPONENT_TYPE = "makeswift-action-time";

runtime.registerComponent(
  ActionTime,
  {
    type: ACTION_TIME_COMPONENT_TYPE,
    label: 'Custom / ActionTime',
    props: {
      className: Style(),
      time: Number({ label: "Time (ms)", suffix: " ms", defaultValue: 2000 }),
      timeRanges: Group({
        label: "Time ranges (ms)",
        props: {
          poor: Number({ label: "Poor", suffix: " ms", defaultValue: 10000 }),
          bad: Number({ label: "Bad", suffix: " ms", defaultValue: 600000 }),
        },
      }),
      animated: Checkbox({ label: "Animated", defaultValue: false }),
      colorizeTime: Checkbox({ label: "Colorize time", defaultValue: false }),
      link: Link({ label: "Link" }),
    },
  }
)
