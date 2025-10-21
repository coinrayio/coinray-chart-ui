import { Chart, Nullable, Overlay, YAxis } from "klinecharts"

export const getScreenSize = () => {
	return {x: window.innerWidth, y: window.innerHeight}
}

export const getPrecision = (chart: Chart, overlay: Overlay<unknown>, yAxis: Nullable<YAxis>):{ price: number, volume: number } => {
	const precision = {
		price: 0,
		volume: 0
	}

	const symbol = chart.getSymbol()
	if ((yAxis?.isInCandle() ?? true) && symbol) {
		precision.price = symbol.pricePrecision
		precision.volume = symbol.volumePrecision
	} else {
		const indicators = chart.getIndicators({ paneId: overlay.paneId })
		indicators.forEach(indicator => {
			precision.price = Math.max(precision.price, indicator.precision)
		})
	}

	return precision
}