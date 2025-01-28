import { Group, List, Slot, Style, TextInput } from '@makeswift/runtime/controls'

import { runtime } from '@/lib/makeswift/runtime'

import { Accordions } from './'

export const ACCORDION_COMPONENT_TYPE = "makeswift-action-graph";

const accordions = List({
  label: "Accordions",
  type: Group({
    label: "Accordion",
    props: {
      label: TextInput({ label: "Title", defaultValue: "" }),
      title: Slot(),
      body: Slot(),
    },
  }),
  getItemLabel: (item) => item?.label ?? 'Untitled',
})

runtime.registerComponent(
  Accordions,
  {
    type: 'accordions',
    label: 'Custom / Accordions',
    props: {
      className: Style(),
      accordions
    }
  }
)
