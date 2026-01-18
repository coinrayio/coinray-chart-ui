import { DeepPartial, LineAttrs, SmoothLineStyle } from "klinecharts";
import { OverlayProperties, ProOverlayTemplate } from "../types";
import loadash from "lodash"

const brush = (): ProOverlayTemplate => {
  let properties: DeepPartial<OverlayProperties> = {}

  return {
    name: "brush",
    totalStep: 3,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: false,
    styles: {},
    createPointFigures: ({ coordinates }) => {
      const lines: LineAttrs[] = []
      if (coordinates.length > 1) {
        const filteredCoords = coordinates.filter((_, i) => i !== 1)

        lines.push({ coordinates: filteredCoords })
      }

      return [
        {
          type: 'line',
          attrs: lines,
          styles: { style: 'solid', smooth: true } as SmoothLineStyle
        },
      ];
    },
    performEventMoveForDrawing: ({ currentStep, points, performPoint }) => {
      if (currentStep >= 2) {
        points.push(performPoint);
      }
    },
    setProperties: (_properties: DeepPartial<OverlayProperties>) => {
      properties = loadash.merge({}, properties, _properties) as OverlayProperties
    },
    getProperties: (): DeepPartial<OverlayProperties> => {
      return properties
    }
  }
};

export default brush;