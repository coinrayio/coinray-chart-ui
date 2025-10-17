import { DataLoader, DataLoaderGetBarsParams, DataLoaderSubscribeBarParams, DataLoaderUnsubscribeBarParams } from "klinecharts";
import { Datafeed } from "./types";

export default class ChartDataLoader implements DataLoader {
  private _datafeed: Datafeed;

  constructor(datafeed: Datafeed) {
    this._datafeed = datafeed;
  }

  async getBars (params: DataLoaderGetBarsParams): Promise<void> {
    const { type, timestamp, symbol, period, callback } = params;
        widget()?.loadMore(timestamp => {
      loading = true
      const get = async () => {
        const p = period()
        const [to] = adjustFromTo(p, timestamp!, 1)
        const [from] = adjustFromTo(p, to, 500)
        const kLineDataList = await props.datafeed.getHistoryKLineData(symbol(), p, from, to)
        widget()?.applyMoreData(kLineDataList, kLineDataList.length > 0)
        loading = false
      }
      get()
    })
    const klineData = await this._datafeed.getHistoryKLineData(symbol, period, from, to);
  }

  subscribeBar (params: DataLoaderSubscribeBarParams): void {
    const { symbol, period, callback } = params;
  }

  unsubscribeBar (params: DataLoaderUnsubscribeBarParams): void {
    const { symbol, period } = params;
  }
}