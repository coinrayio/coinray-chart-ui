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

export interface OrderLineProperties extends OverlayProperties {
  price?: number
  bodyBackgroundColor?: string
  bodyTextColor?: string
  bodyBorderColor?: string
  tooltip?: string
  quantity?: number|string
  quantityFont?: string
  quantityColor?: string
  quantityBackgroundColor?: string
  quantityBorderColor?: string
  modifyTooltip?: string
  cancelButtonIconColor?: string
  cancelButtonBackgroundColor?: string
  cancelButtonBorderColor?: string
  lineColor?: string
  lineWidth?: number
  lineStyle?: LineType
  lineLength?: number
}

interface OrderOverlayAttributes {
  setPrice: (price: number) => OrderOverlay
  setText: (text: string) => OrderOverlay
  setBodyBackgroundColor: (color: string) => OrderOverlay
  setBodyTextColor: (color: string) => OrderOverlay
  setBodyBorderColor: (color: string) => OrderOverlay
  setTooltip: (tooltip: string) => OrderOverlay
  setQuantity: (quantity: string) => OrderOverlay
  setQuantityFont: (font: string) => OrderOverlay
  setQuantityColor: (color: string) => OrderOverlay
  setQuantityBackgroundColor: (color: string) => OrderOverlay
  setQuantityBorderColor: (color: string) => OrderOverlay
  setModifyTooltip: (tooltip: string) => OrderOverlay
  setCancelButtonIconColor: (color: string) => OrderOverlay
  setCancelButtonBackgroundColor: (color: string) => OrderOverlay
  setCancelButtonBorderColor: (color: string) => OrderOverlay
  setLineColor: (color: string) => OrderOverlay
  setLineWidth: (width: number) => OrderOverlay
  setLineStyle: (style: LineType) => OrderOverlay
  setLineLength: (length: number) => OrderOverlay
  setLineDashedValue: (dashedValue: number[]) => OrderOverlay
  onMoveStart?: <T>(params: T, callback: (params: T) => void) => void
  onMove?: <T>(params: T, callback: (params: T) => void) => void
  onMoveEnd?: <T>(params: T, callback: (params: T) => void) => void
  onCancel?: <T>(params: T, callback: (params: T) => void) => void
  onModify?: <T>(params: T, callback: (params: T) => void) => void
}

export interface OrderOverlay extends Overlay, OrderOverlayAttributes {}

export interface OrderOverlayCreate extends OverlayTemplate, OrderOverlayAttributes {}