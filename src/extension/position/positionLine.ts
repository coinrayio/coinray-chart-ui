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

import { Coordinate, utils } from 'klinecharts'
import { PositionLineProperties, PositionOverlayTemplate, useOrder } from '../../store/positionStore'
import { buyStyle } from '../../store/overlayStyle/positionStyleStore'
import { getPrecision } from '../../helpers'
// import { useOverlaySettings } from '../../../store/overlaySettingStore'

const buyLine = (): PositionOverlayTemplate => {
  let properties: PositionLineProperties = {
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
  }

  return {
    name: 'positionLine',
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
          styles: buyStyle().lineStyle,
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
          styles: buyStyle().labelStyle
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
        styles: buyStyle().labelStyle
      }
    },
    onRightClick: (event): boolean => {
      // useOverlaySettings().singlePopup(event, 'buy')
      return true
    },
    onClick: (event): boolean => {
      event.figure?.
      return true
    }
    setPrice(price: number) {
      console.info('setPrice called with price: ', price)
      properties.price = price
      return this
    },
    setText(text: string) {
      console.info('setText called with text: ', text)
      properties.text = text
      return this
    }
  }
}

export default buyLine