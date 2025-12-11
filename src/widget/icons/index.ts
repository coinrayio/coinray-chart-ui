import { fill } from 'lodash'
import alert from './alert'
import arrowRight from './arrowRight'
import copy from './copy'
import drag from './drag'
import edit from './edit'
import hide from './hide'
import layerStack from './layerStack'
import line from './line'
import lineDashed from './lineDashed'
import lineDotted from './lineDotted'
import locked from './locked'
import more from './more'
import settings from './settings'
import show from './show'
import templates from './templates'
import text from './text'
import trash from './trash'
import unlocked from './unlocked'

export const mapping = {
  alert,
  arrowRight,
  copy,
  drag,
  edit,
  fill,
  hide,
  layerStack,
  line,
  lineDashed,
  lineDotted,
  locked,
  unlocked,
  more,
  settings,
  show,
  templates,
  text,
  trash
}

interface IconProps {
  class?: string
  name: string
}

// @ts-expect-error
export const Icon: Component<IconProps> = props => mapping[props.name](props.class)