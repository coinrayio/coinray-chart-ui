/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Coordinate, LineStyle, LineType, TextStyle, utils } from 'klinecharts'
import { OrderLineProperties, OrderOverlay, OrderOverlayCreate } from '../../types/overlayTypes'
import { buyStyle } from '../../store/overlayStyle/positionStyleStore'
import { getPrecision } from '../../helpers'
// import { useOverlaySettings } from '../../../store/overlaySettingStore'

const OrderLine = (): OrderOverlayCreate => {
  let properties: OrderLineProperties = {
    price: undefined,
    text: undefined,
    bodyBackgroundColor: undefined,
    bodyBorderColor: undefined,
    bodyTextColor: undefined,
    tooltip: undefined,
    quantity: undefined,
    quantityFont: undefined,
    quantityColor: undefined,
    quantityBackgroundColor: undefined,
    quantityBorderColor: undefined,
    modifyTooltip: undefined,
    cancelButtonIconColor: undefined,
    cancelButtonBackgroundColor: undefined,
    cancelButtonBorderColor: undefined,
    lineColor: undefined,
    lineWidth: undefined,
    lineStyle: undefined,
    lineLength: undefined,
    lineDashedValue: undefined
  }

  const lineStyle = (): LineStyle => {
    return {
      style: properties.lineStyle ?? buyStyle().lineStyle.style,
      size: properties.lineWidth ?? buyStyle().lineStyle.size,
      color: properties.lineColor ?? buyStyle().lineStyle.color,
      dashedValue: properties.lineDashedValue ?? buyStyle().lineStyle.dashedValue
    }
  }

  const labelStyle = (): TextStyle => {
    return {
      style: 'fill',
      size: 12,
      weight: 'normal',
      family: properties.quantityFont ?? buyStyle().labelStyle.family,
      color: properties.quantityColor ?? buyStyle().labelStyle.color,
      backgroundColor: properties.quantityBackgroundColor ?? buyStyle().labelStyle.backgroundColor,
      borderColor: properties.quantityBorderColor ?? buyStyle().labelStyle.borderColor,
      borderStyle: 'solid' as const,
      borderSize: 1,
      borderDashedValue: [1, 1],
      borderRadius: 3,
      paddingLeft: 5,
      paddingRight: 5,
      paddingTop: 5,
      paddingBottom: 5
  }}

  return {
    name: 'orderLine',
    totalStep: 2,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: true,
    createPointFigures: ({chart, yAxis, overlay, coordinates, bounding }) => {
      console.info('Position Line price is set to: ', properties.price)
      const precision = getPrecision(chart, overlay, yAxis)
      // let text = useOrder().calcPL(overlay.points[0].value!, precision.price, true)
      // useOrder().updatePipsAndPL(overlay, text)
      if (properties.price !== undefined) {
        console.info('calculated y coordinate is: ', (chart.convertToPixel({ timestamp: chart.getDataList().at(chart.getDataList().length -1)?.timestamp, value: properties.price }) as Partial<Coordinate> ).y)
      }
      return [
        {
          type: 'line',
          attrs: {
            coordinates: [
              {
                x: 0,
                y: properties.price ? (chart.convertToPixel({ timestamp: chart.getDataList().at(chart.getDataList().length -1)?.timestamp, value: properties.price }) as Partial<Coordinate> ).y : coordinates[0].y
              },
              {
                x: bounding.width,
                y: properties.price ? (chart.convertToPixel({ timestamp: chart.getDataList().at(chart.getDataList().length -1)?.timestamp, value: properties.price }) as Partial<Coordinate> ).y : coordinates[0].y
              }
            ]
          },
          styles: lineStyle(),
          ignoreEvent: true
        },
        {
          key: 'label',
          type: 'text',
          attrs: {
            x: bounding.width,
            y:properties.price ? (chart.convertToPixel({ timestamp: chart.getDataList().at(chart.getDataList().length -1)?.timestamp, value: properties.price }) as Partial<Coordinate> ).y : coordinates[0].y,
            text: properties.text ?? 'Position Line',
            align: 'right',
            baseline: 'middle'
          },
          styles: labelStyle()
        }
      ]
    },
    createYAxisFigures: ({ chart, overlay, coordinates, bounding, yAxis }) => {
      const precision = getPrecision(chart, overlay, yAxis)
      console.info('overlay extend dat is: ', overlay.extendData)
      const isFromZero = yAxis?.isFromZero() ?? false
      let textAlign: CanvasTextAlign
      let x: number
      if (isFromZero) {
        textAlign = 'left'
        x = 0
      } else {
        textAlign = 'right'
        x = bounding.width
      }
      let text: string|null|undefined
      if (properties.price !== undefined) {
        overlay.points[0].value = properties.price
      }

      if (utils.isValid(overlay.extendData)) {
        if (!utils.isFunction(overlay.extendData)) {
          text = (overlay.extendData ?? '') as string
        } else {
          text = overlay.extendData(overlay) as string
        }
      }
      if (!utils.isValid(text) && overlay.points[0].value !== undefined) {
        text = utils.formatPrecision(overlay.points[0].value, precision.price)
      }

      // let width = utils.calcTextWidth((text as string))
      // const height = width/(text as string).length * 3
      // width = width + height * 2
      return {
        type: 'text',
        attrs: {
          x, 
          y: properties.price ? (chart.convertToPixel({ timestamp: chart.getDataList().at(chart.getDataList().length -1)?.timestamp, value: properties.price }) as Partial<Coordinate> ).y : coordinates[0].y,
          text: text ?? '',
          align: textAlign, baseline:
          'middle'
        },
        styles: labelStyle()
      }
    },
    onRightClick: (event): boolean => {
      // useOverlaySettings().singlePopup(event, 'buy')
      return true
    },
    // onClick: (event): boolean => {
    //   event.figure?.
    //   return true
    // }
    setPrice(price: number) {
      console.info('setPrice called with price: ', price)
      properties.price = price
      return this as OrderOverlay
    },
    setText(text: string) {
      console.info('setText called with text: ', text)
      properties.text = text
      return this as OrderOverlay
    },
    setBodyBackgroundColor(color: string) {
      properties.bodyBackgroundColor = color
      return this as OrderOverlay
    },
    setBodyBorderColor(color: string) {
      properties.bodyBorderColor = color
      return this as OrderOverlay
    },
    setBodyTextColor(color: string) {
      properties.bodyTextColor = color
      return this as OrderOverlay
    },
    setTooltip(tooltip: string) {
      properties.tooltip = tooltip
      return this as OrderOverlay
    },
    setQuantity(quantity: number|string) {
      properties.quantity = quantity
      return this as OrderOverlay
    },
    setQuantityFont(font: string) {
      properties.quantityFont = font
      return this as OrderOverlay
    },
    setQuantityColor(color: string) {
      properties.quantityColor = color
      return this as OrderOverlay
    },
    setQuantityBackgroundColor(color: string) {
      properties.quantityBackgroundColor = color
      return this as OrderOverlay
    },
    setQuantityBorderColor(color: string) {
      properties.quantityBorderColor = color
      return this as OrderOverlay
    },
    setModifyTooltip(tooltip: string) {
      properties.modifyTooltip = tooltip
      return this as OrderOverlay
    },
    setCancelButtonIconColor(color: string) {
      properties.cancelButtonIconColor = color
      return this as OrderOverlay
    },
    setCancelButtonBackgroundColor(color: string) {
      properties.cancelButtonBackgroundColor = color
      return this as OrderOverlay
    },
    setCancelButtonBorderColor(color: string) {
      properties.cancelButtonBorderColor = color
      return this as OrderOverlay
    },
    setLineColor(color: string) {
      properties.lineColor = color
      return this as OrderOverlay
    },
    setLineWidth(width: number) {
      properties.lineWidth = width
      return this as OrderOverlay
    },
    setLineStyle(style: LineType) {
      properties.lineStyle = style
      return this as OrderOverlay
    },
    setLineLength(length: number) {
      properties.lineLength = length
      return this as OrderOverlay
    },
    setLineDashedValue(dashedValue: number[]) {
      properties.lineDashedValue = dashedValue
      return this as OrderOverlay
    }
  }
}

export default OrderLine