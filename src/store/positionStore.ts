import { Chart, Nullable, Overlay, OverlayEvent, OverlayTemplate, Point, YAxis } from 'klinecharts';
import { ExitType, OrderInfo, OrderModifyInfo, OrderResource, OrderType } from '../types/types';
import { createSignal } from 'solid-js';
import { currenttick } from './tickStore';
import { instanceapi, symbol } from '../ChartProComponent';
import { getPrecision } from '../helpers';
// import { setOrderModalVisible } from './chartStateStore';
// import { syntheticPausePlay } from './keyEventStore';

export const [chartapi, setChartapi] = createSignal<Nullable<Chart>>(null);
export const [ordercontr, setOrderContr] = createSignal<Nullable<OrderResource>>(null)
export const [orderList, setOrderList] = createSignal<OrderInfo[]>([])
export const [currentequity, setCurrentequity] = createSignal<number>(0)

export const createOrderLine = () => {
  return instanceapi()?.createOverlay('')
}