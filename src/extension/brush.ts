import { Coordinate, LineAttrs, LineStyle, OverlayTemplate, SmoothLineStyle } from "klinecharts";
import _ from "lodash";

const brush = (): OverlayTemplate => {
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
        console.info("brush - createPointFigures - lines", filteredCoords, 'and coordinates', coordinates);
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
        console.info("brush - performEventMoveForDrawing before", { currentStep, points, performPoint: { ...performPoint } });
        points.push(performPoint);
      }
    }
  }
};

export default brush;