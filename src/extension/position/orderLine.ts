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
    isBodyVisible: true,
    isCancelButtonVisible: true,
    isQuantityVisible: true,
  }

  const lineStyle = (): LineStyle => {
    return {
      style: properties.lineStyle ?? buyStyle().lineStyle.style,
      size: properties.lineWidth ?? buyStyle().lineStyle.size,
      color: properties.lineColor ?? buyStyle().lineStyle.color,
      dashedValue: properties.lineDashedValue ?? buyStyle().lineStyle.dashedValue
    }
  }

  const labelStyle = (type: 'body'|'quantity'|'cancel-button'): TextStyle => {
    return {
      style: 'fill',
      size: (type == 'body' ? properties.bodySize : type == 'quantity' ? properties.quantitySize : properties.cancelButtonSize) ?? properties.bodySize ?? buyStyle().labelStyle.size,
      weight: (type == 'body' ? properties.bodyWeight : type == 'quantity' ? properties.quantityWeight : properties.cancelButtonWeight) ?? properties.bodyWeight ?? buyStyle().labelStyle.weight,
      family: (type == 'body' ? properties.bodyFont : type == 'quantity' ? properties.quantityFont : properties.bodyFont) ?? properties.bodyFont ?? buyStyle().labelStyle.family,
      color: (type == 'body' ? properties.bodyTextColor : type == 'quantity' ? properties.quantityColor : properties.cancelButtonIconColor) ?? properties.bodyTextColor ?? buyStyle().labelStyle.color,
      backgroundColor: (type == 'body' ? properties.bodyBackgroundColor : type == 'quantity' ? properties.quantityBackgroundColor : properties.cancelButtonBackgroundColor) ?? properties.bodyBackgroundColor ?? buyStyle().labelStyle.backgroundColor,
      borderColor: (type == 'body' ? properties.bodyBorderColor : type == 'quantity' ? properties.quantityBorderColor : properties.cancelButtonBorderColor) ?? properties.bodyBorderColor ?? buyStyle().labelStyle.borderColor,
      borderStyle: properties.borderStyle ?? buyStyle().labelStyle.borderStyle,
      borderSize: properties.borderSize ?? buyStyle().labelStyle.borderSize,
      borderDashedValue: properties.borderDashedValue ?? buyStyle().labelStyle.borderDashedValue,
      borderRadius: properties.borderRadius ?? buyStyle().labelStyle.borderRadius,
      paddingLeft: (type == 'body' ? properties.bodyPaddingLeft : type == 'quantity' ? properties.quantityPaddingLeft : properties.cancelButtonPaddingLeft) ?? properties.bodyPaddingLeft ?? buyStyle().labelStyle.paddingLeft,
      paddingRight: (type == 'body' ? properties.bodyPaddingRight : type == 'quantity' ? properties.quantityPaddingRight : properties.cancelButtonPaddingRight) ?? properties.bodyPaddingRight ?? buyStyle().labelStyle.paddingRight,
      paddingTop: (type == 'body' ? properties.bodyPaddingTop : type == 'quantity' ? properties.quantityPaddingTop : properties.cancelButtonPaddingTop) ?? properties.bodyPaddingTop ?? buyStyle().labelStyle.paddingTop,
      paddingBottom: (type == 'body' ? properties.bodyPaddingBottom : type == 'quantity' ? properties.quantityPaddingBottom : properties.cancelButtonPaddingBottom) ?? properties.bodyPaddingBottom ?? buyStyle().labelStyle.paddingBottom
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
        // {
        //   key: 'body',
        //   type: 'rect',
        //   attrs: {
        //     x: bounding.width - 90,
        //     y:(properties.price ? (chart.convertToPixel({ timestamp: chart.getDataList().at(chart.getDataList().length -1)?.timestamp, value: properties.price }) as Partial<Coordinate> ).y! : coordinates[0].y) - 10,
        //     width: 70,
        //     height: 20
        //   },
        //   styles: {
        //     style: 'stroke',
        //     // color
        //     color: '#ff000020',
        //     // border style
        //     borderStyle: 'dashed',
        //     // border color
        //     borderColor: '#002affff',
        //     // frame size
        //     borderSize: 1,
        //     // border dotted line parameters
        //     borderDashedValue: [0, 0],
        //     // Border fillet value
        //     borderRadius: 3
        //   }
        // },
        {
          key: 'body',
          type: 'text',
          attrs: {
            x: bounding.width,
            y:properties.price ? (chart.convertToPixel({ timestamp: chart.getDataList().at(chart.getDataList().length -1)?.timestamp, value: properties.price }) as Partial<Coordinate> ).y : coordinates[0].y,
            text: properties.text ?? 'Position Line',
            align: 'right',
            baseline: 'middle'
          },
          styles: labelStyle('body')
        },
        {
          key: 'quantity',
          type: 'text',
          attrs: {
            x: bounding.width - chart.calcTextWidth(properties.text ?? 'Position Line') - 10,
            y:properties.price ? (chart.convertToPixel({ timestamp: chart.getDataList().at(chart.getDataList().length -1)?.timestamp, value: properties.price }) as Partial<Coordinate> ).y : coordinates[0].y,
            text: properties.text ?? 'Position Line',
            align: 'right',
            baseline: 'middle'
          },
          styles: labelStyle('quantity')
        },
        {
          key: 'cancel-button',
          type: 'text',
          attrs: {
            x: bounding.width,
            y:properties.price ? (chart.convertToPixel({ timestamp: chart.getDataList().at(chart.getDataList().length -1)?.timestamp, value: properties.price }) as Partial<Coordinate> ).y : coordinates[0].y,
            text: 'X',
            align: 'right',
            baseline: 'middle'
          },
          styles: labelStyle('cancel-button')
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
        styles: labelStyle('body')
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
    setQuantity(quantity: number|string) {
      properties.quantity = quantity
      return this as OrderOverlay
    },
    setModifyTooltip(tooltip: string) {
      properties.modifyTooltip = tooltip
      return this as OrderOverlay
    },
    setTooltip(tooltip: string) {
      properties.tooltip = tooltip
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
      properties.lineDashedValue = [length, length]
      return this as OrderOverlay
    },
    setLineDashedValue(dashedValue: number[]) {
      properties.lineDashedValue = dashedValue
      return this as OrderOverlay
    },

    setBodyFont(font: string) {
      properties.bodyFont = font
      return this as OrderOverlay
    },
    setBodyTextColor(color: string) {
      properties.bodyTextColor = color
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

    setBorderStyle(style: LineType) {
      properties.borderStyle = style
      return this as OrderOverlay
    },
    setBorderSize(size: number) {
      properties.borderSize = size
      return this as OrderOverlay
    },
    setBorderDashedValue(dashedValue: number[]) {
      properties.borderDashedValue = dashedValue
      return this as OrderOverlay
    },
    setBorderRadius(radius: number) {
      properties.borderRadius = radius
      return this as OrderOverlay
    }
  }
}

export default OrderLine