import { DataLoaderGetBarsParams, DataLoaderSubscribeBarParams, DataLoaderUnsubscribeBarParams } from "klinecharts";
import { ChartDataLoaderType, Datafeed, Period, SymbolInfo } from "./types";

export default class ChartDataLoader implements ChartDataLoaderType {
  private _datafeed: Datafeed;
  private _loading: boolean;
  private getPeriod: () => Period;

  constructor(datafeed: Datafeed, getPeriod: () => Period) {
    this._datafeed = datafeed;
    this._loading = false;
    this.getPeriod = getPeriod;
  }

  async getBars (params: DataLoaderGetBarsParams): Promise<void> {
    const { type, timestamp, symbol, period, callback } = params;
      this._loading = true
      const get = async () => {
        const p = this.getPeriod()
        const [to] = this.adjustFromTo(p, timestamp!, 1)
        const [from] = this.adjustFromTo(p, to, 500)
        const kLineDataList = await this._datafeed.getHistoryKLineData(symbol, {...period, text: p.text}, from, to)
        callback(kLineDataList, kLineDataList.length > 0)
        this._loading = false
      }
      get();
  }

  subscribeBar (params: DataLoaderSubscribeBarParams): void {
    const { symbol, period, callback } = params;
    this._datafeed.subscribe(symbol, {...period, text: this.getPeriod().text}, callback)
  }

  unsubscribeBar (params: DataLoaderUnsubscribeBarParams): void {
    const { symbol, period } = params;
    this._datafeed.unsubscribe(symbol, {...period, text: this.getPeriod().text})
  }

  searchSymbols(search?: string): Promise<SymbolInfo[]> {
    return this._datafeed.searchSymbols(search)
  }

  get loading(): boolean {
    return this._loading;
  }
  
  adjustFromTo (period: Period, toTimestamp: number, count: number) {
    let to = toTimestamp
    let from = to
    switch (period.type) {
      case 'minute': {
        to = to - (to % (60 * 1000))
        from = to - count * period.span * 60 * 1000
        break
      }
      case 'hour': {
        to = to - (to % (60 * 60 * 1000))
        from = to - count * period.span * 60 * 60 * 1000
        break
      }
      case 'day': {
        to = to - (to % (60 * 60 * 1000))
        from = to - count * period.span * 24 * 60 * 60 * 1000
        break
      }
      case 'week': {
        const date = new Date(to)
        const week = date.getDay()
        const dif = week === 0 ? 6 : week - 1
        to = to - dif * 60 * 60 * 24
        const newDate = new Date(to)
        to = new Date(`${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`).getTime()
        from = count * period.span * 7 * 24 * 60 * 60 * 1000
        break
      }
      case 'month': {
        const date = new Date(to)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        to = new Date(`${year}-${month}-01`).getTime()
        from = count * period.span * 30 * 24 * 60 * 60 * 1000
        const fromDate = new Date(from)
        from = new Date(`${fromDate.getFullYear()}-${fromDate.getMonth() + 1}-01`).getTime()
        break
      }
      case 'year': {
        const date = new Date(to)
        const year = date.getFullYear()
        to = new Date(`${year}-01-01`).getTime()
        from = count * period.span * 365 * 24 * 60 * 60 * 1000
        const fromDate = new Date(from)
        from = new Date(`${fromDate.getFullYear()}-01-01`).getTime()
        break
      }
    }
    return [from, to]
  }
}