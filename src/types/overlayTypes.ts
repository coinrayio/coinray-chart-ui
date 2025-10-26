import { LineType, Overlay, OverlayTemplate, StateLineStyle } from "klinecharts"

export interface OverlayProperties {
  text?: string
  color?: string
  lineWidth?: number
  lineStyle?: LineType
  lineLength?: number
  lineDashedValue?: number[]
  tooltip?: string
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
}

export interface OrderLineProperties {
  price?: number
  text?: string
  quantity?: number|string
  modifyTooltip?: string
  tooltip?: string

  lineColor?: string
  lineWidth?: number
  lineStyle?: LineType
  lineDashedValue?: number[]

  bodySize?: number
  bodyWeight?: number | string
  bodyFont?: string
  bodyBackgroundColor?: string
  bodyBorderColor?: string
  bodyTextColor?: string
  bodyPaddingLeft?: number
  bodyPaddingRight?: number
  bodyPaddingTop?: number
  bodyPaddingBottom?: number
  isBodyVisible: boolean

  quantitySize?: number
  quantityWeight?: number | string
  quantityFont?: string
  quantityColor?: string
  quantityBackgroundColor?: string
  quantityBorderColor?: string
  quantityPaddingLeft?: number
  quantityPaddingRight?: number
  quantityPaddingTop?: number
  quantityPaddingBottom?: number
  isQuantityVisible: boolean

  cancelButtonSize?: number
  cancelButtonWeight?: number | string
  cancelButtonIconColor?: string
  cancelButtonBackgroundColor?: string
  cancelButtonBorderColor?: string
  cancelButtonPaddingLeft?: number
  cancelButtonPaddingRight?: number
  cancelButtonPaddingTop?: number
  cancelButtonPaddingBottom?: number
  isCancelButtonVisible: boolean

  borderStyle?: LineType,
  borderSize?: number,
  borderDashedValue?: number[],
  borderRadius?: number
}

interface OrderOverlayAttributes {
  setPrice: (price: number) => OrderOverlay
  setText: (text: string) => OrderOverlay
  setQuantity: (quantity: string) => OrderOverlay
  setModifyTooltip: (tooltip: string) => OrderOverlay
  setTooltip: (tooltip: string) => OrderOverlay

  setLineColor: (color: string) => OrderOverlay
  setLineWidth: (width: number) => OrderOverlay
  setLineStyle: (style: LineType) => OrderOverlay
  setLineLength: (length: number) => OrderOverlay
  setLineDashedValue: (dashedValue: number[]) => OrderOverlay

  setBodyFont: (font: string) => OrderOverlay
  setBodyTextColor: (color: string) => OrderOverlay
  setBodyBackgroundColor: (color: string) => OrderOverlay
  setBodyBorderColor: (color: string) => OrderOverlay

  setQuantityFont: (font: string) => OrderOverlay
  setQuantityColor: (color: string) => OrderOverlay
  setQuantityBackgroundColor: (color: string) => OrderOverlay
  setQuantityBorderColor: (color: string) => OrderOverlay

  setCancelButtonIconColor: (color: string) => OrderOverlay
  setCancelButtonBackgroundColor: (color: string) => OrderOverlay
  setCancelButtonBorderColor: (color: string) => OrderOverlay

  setBorderStyle: (style: LineType) => OrderOverlay
  setBorderSize: (size: number) => OrderOverlay
  setBorderDashedValue: (dashedValue: number[]) => OrderOverlay
  setBorderRadius: (radius: number) => OrderOverlay

  onMoveStart?: <T>(params: T, callback: (params: T) => void) => void
  onMove?: <T>(params: T, callback: (params: T) => void) => void
  onMoveEnd?: <T>(params: T, callback: (params: T) => void) => void
  onCancel?: <T>(params: T, callback: (params: T) => void) => void
  onModify?: <T>(params: T, callback: (params: T) => void) => void
}

export interface OrderOverlay extends Overlay, OrderOverlayAttributes {}

export interface OrderOverlayCreate extends OverlayTemplate, OrderOverlayAttributes {}