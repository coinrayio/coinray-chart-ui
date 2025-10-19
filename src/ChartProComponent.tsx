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

import { createSignal, createEffect, onMount, Show, onCleanup, startTransition, Component } from 'solid-js'

import {
  init, dispose, utils, Nullable, Chart, OverlayMode, Styles,
  ActionType, PaneOptions, Indicator, DomPosition, FormatDateType,
  FormatDateParams
} from 'klinecharts'

import lodashSet from 'lodash/set'
import lodashClone from 'lodash/cloneDeep'

import { SelectDataSourceItem, Loading } from './component'

import {
  PeriodBar, DrawingBar, IndicatorModal, TimezoneModal, SettingModal,
  ScreenshotModal, IndicatorSettingModal, SymbolSearchModal
} from './widget'

import { translateTimezone } from './widget/timezone-modal/data'

import { SymbolInfo, Period, ChartProOptions, ChartPro } from './types'
import ChartDataLoader from './DataLoader'
import { filter } from 'lodash'

export interface ChartProComponentProps extends Required<Omit<ChartProOptions, 'container' | 'datafeed'>> {
  ref: (chart: ChartPro) => void
  dataloader: ChartDataLoader
}

interface PrevSymbolPeriod {
  symbol: SymbolInfo
  period: Period
}

function createIndicator (widget: Nullable<Chart>, indicatorName: string, isStack?: boolean, paneOptions?: PaneOptions): Nullable<string> {
  if (indicatorName === 'VOL') {
    paneOptions = { axis: { gap: { bottom: 2 } }, ...paneOptions }
  }
  return widget?.createIndicator(indicatorName, isStack, paneOptions) ?? null
  // return widget?.createIndicator({
  //   name: indicatorName,
  //   // @ts-expect-error
  //   createTooltipDataSource: ({ indicator, defaultStyles }) => {
  //     console.info('createTooltipDataSource 01', indicator)
  //     console.info('createTooltipDataSource 02', defaultStyles)
  //     const icons = []
  //     if (indicator.visible) {
  //       icons.push(defaultStyles.tooltip.icons[1])
  //       icons.push(defaultStyles.tooltip.icons[2])
  //       icons.push(defaultStyles.tooltip.icons[3])
  //     } else {
  //       icons.push(defaultStyles.tooltip.icons[0])
  //       icons.push(defaultStyles.tooltip.icons[2])
  //       icons.push(defaultStyles.tooltip.icons[3])
  //     }
  //     return { icons }
  //   }
  // }, isStack, paneOptions) ?? null
}

export const [ widget, setWidget ] = createSignal<Nullable<Chart>>(null)

const ChartProComponent: Component<ChartProComponentProps> = props => {
  let widgetRef: HTMLDivElement | undefined = undefined

  let priceUnitDom: HTMLElement

  let loading = false

  const [theme, setTheme] = createSignal(props.theme)
  const [styles, setStyles] = createSignal(props.styles)
  const [locale, setLocale] = createSignal(props.locale)

  const [symbol, setSymbol] = createSignal(props.symbol)
  const [period, setPeriod] = createSignal(props.period)
  const [indicatorModalVisible, setIndicatorModalVisible] = createSignal(false)
  const [mainIndicators, setMainIndicators] = createSignal([...(props.mainIndicators!)])
  const [subIndicators, setSubIndicators] = createSignal({})

  const [timezoneModalVisible, setTimezoneModalVisible] = createSignal(false)
  const [timezone, setTimezone] = createSignal<SelectDataSourceItem>({ key: props.timezone, text: translateTimezone(props.timezone, props.locale) })

  const [settingModalVisible, setSettingModalVisible] = createSignal(false)
  const [widgetDefaultStyles, setWidgetDefaultStyles] = createSignal<Styles>()

  const [screenshotUrl, setScreenshotUrl] = createSignal('')

  const [drawingBarVisible, setDrawingBarVisible] = createSignal(props.drawingBarVisible)

  const [symbolSearchModalVisible, setSymbolSearchModalVisible] = createSignal(false)

  const [loadingVisible, setLoadingVisible] = createSignal(false)

  const [indicatorSettingModalParams, setIndicatorSettingModalParams] = createSignal({
    visible: false, indicatorName: '', paneId: '', calcParams: [] as Array<any>
  })

  props.ref({
    setTheme,
    getTheme: () => theme(),
    setStyles,
    getStyles: () => widget()!.getStyles(),
    setLocale,
    getLocale: () => locale(),
    setTimezone: (timezone: string) => { setTimezone({ key: timezone, text: translateTimezone(props.timezone, locale()) }) },
    getTimezone: () => timezone().key,
    setSymbol,
    getSymbol: () => symbol(),
    setPeriod,
    getPeriod: () => period(),
    getInstanceApi: () => widget(),
    resize: () => widget()?.resize(),
    dispose: () => {}
  })

  const documentResize = () => {
    widget()?.resize()
  }

  onMount(() => {
    window.addEventListener('resize', documentResize)
    setWidget(init(widgetRef!, {
      formatter: {
        formatDate: (params: FormatDateParams) => {
          // console.info('formatDate', params)
          const p = period()
          switch (p.type) {
            case 'minute': {
              if (params.type === 'xAxis') {
                return utils.formatDate(params.dateTimeFormat, params.timestamp, 'HH:mm')
              }
              return utils.formatDate(params.dateTimeFormat, params.timestamp, 'YYYY-MM-DD HH:mm')
            }
            case 'hour': {
              if (params.type === 'xAxis') {
                return utils.formatDate(params.dateTimeFormat, params.timestamp, 'MM-DD HH:mm')
              }
              return utils.formatDate(params.dateTimeFormat, params.timestamp, 'YYYY-MM-DD HH:mm')
            }
            case 'day':
            case 'week': return utils.formatDate(params.dateTimeFormat, params.timestamp, 'YYYY-MM-DD')
            case 'month': {
              if (params.type === 'xAxis') {
                return utils.formatDate(params.dateTimeFormat, params.timestamp, 'YYYY-MM')
              }
              return utils.formatDate(params.dateTimeFormat, params.timestamp, 'YYYY-MM-DD')
            }
            case 'year': {
              if (params.type === 'xAxis') {
                return utils.formatDate(params.dateTimeFormat, params.timestamp, 'YYYY')
              }
              return utils.formatDate(params.dateTimeFormat, params.timestamp, 'YYYY-MM-DD')
            }
          }
          return utils.formatDate(params.dateTimeFormat, params.timestamp, 'YYYY-MM-DD HH:mm')
        }
      }
    }))

    if (widget()) {
      console.info('ChartPro widget initialized')
      const watermarkContainer = widget()!.getDom('candle_pane', 'main')
      if (watermarkContainer) {
        let watermark = document.createElement('div')
        watermark.className = 'klinecharts-pro-watermark'
        if (utils.isString(props.watermark)) {
          const str = (props.watermark as string).replace(/(^\s*)|(\s*$)/g, '')
          watermark.innerHTML = str
        } else {
          watermark.appendChild(props.watermark as Node)
        }
        watermarkContainer.appendChild(watermark)
      }

      const priceUnitContainer = widget()!.getDom('candle_pane', 'yAxis')
      priceUnitDom = document.createElement('span')
      priceUnitDom.className = 'klinecharts-pro-price-unit'
      priceUnitContainer?.appendChild(priceUnitDom)

      widget()?.subscribeAction('onCrosshairFeatureClick', (data) => {
        console.info('onCrosshairFeatureClick', data)
      })

      widget()?.subscribeAction('onIndicatorTooltipFeatureClick', (data) => {
        console.info('onIndicatorTooltipFeatureClick', data)
      })

      widget()?.subscribeAction('onCandleTooltipFeatureClick', (data) => {
        console.info('onCandleTooltipFeatureClick', data)
        // if (data.indicatorName) {
        //   switch (data.iconId) {
        //     case 'visible': {
        //       widget()?.overrideIndicator({ name: data.indicatorName, visible: true }, data.paneId)
        //       break
        //     }
        //     case 'invisible': {
        //       widget()?.overrideIndicator({ name: data.indicatorName, visible: false }, data.paneId)
        //       break
        //     }
        //     case 'setting': {
        //       const indicator = widget()?.getIndicatorByPaneId(data.paneId, data.indicatorName) as Indicator
        //       setIndicatorSettingModalParams({
        //         visible: true, indicatorName: data.indicatorName, paneId: data.paneId, calcParams: indicator.calcParams
        //       })
        //       break
        //     }
        //     case 'close': {
        //       if (data.paneId === 'candle_pane') {
        //         const newMainIndicators = [...mainIndicators()]
        //         widget()?.removeIndicator('candle_pane', data.indicatorName)
        //         newMainIndicators.splice(newMainIndicators.indexOf(data.indicatorName), 1)
        //         setMainIndicators(newMainIndicators)
        //       } else {
        //         const newIndicators = { ...subIndicators() }
        //         widget()?.removeIndicator(data.paneId, data.indicatorName)
        //         // @ts-expect-error
        //         delete newIndicators[data.indicatorName]
        //         setSubIndicators(newIndicators)
        //       }
        //     }
        //   }
        // }
      })

      const s = symbol()
      if (s?.priceCurrency) {
        priceUnitDom.innerHTML = s?.priceCurrency.toLocaleUpperCase()
        priceUnitDom.style.display = 'flex'
      } else {
        priceUnitDom.style.display = 'none'
      }
      widget()?.setSymbol({ticker: s.ticker, pricePrecision: s?.pricePrecision ?? 2, volumePrecision: s?.volumePrecision ?? 0})
      widget()?.setPeriod(period())
      widget()?.setDataLoader(props.dataloader)
    }

    mainIndicators().forEach(indicator => {
      createIndicator(widget(), indicator, true, { id: 'candle_pane' })
    })
    const subIndicatorMap = {}
    props.subIndicators!.forEach(indicator => {
      const paneId = createIndicator(widget(), indicator, true)
      if (paneId) {
        // @ts-expect-error
        subIndicatorMap[indicator] = paneId
      }
    })
    setSubIndicators(subIndicatorMap)
  })

  onCleanup(() => {
    window.removeEventListener('resize', documentResize)
    dispose(widgetRef!)
  })


  // createEffect((prev?: PrevSymbolPeriod) => {
  //   if (!props.dataloader.loading) {
  //     if (prev) {
  //       props.datafeed.unsubscribe(prev.symbol, prev.period)
  //     }
  //     const s = symbol()
  //     const p = period()
  //     props.dataloader.loading = true
  //     setprops.dataloader.LoadingVisible(true)
  //     const get = async () => {
  //       const [from, to] = adjustFromTo(p, new Date().getTime(), 500)
  //       const kLineDataList = await props.datafeed.getHistoryKLineData(s, p, from, to)
  //       widget()?.applyNewData(kLineDataList, kLineDataList.length > 0)
  //       props.datafeed.subscribe(s, p, data => {
  //         widget()?.updateData(data)
  //       })
  //       props.dataloader.loading = false
  //       setprops.dataloader.LoadingVisible(false)
  //     }
  //     get()
  //     return { symbol: s, period: p }
  //   }
  //   return prev
  // })

  createEffect(() => {
    const t = theme()
    widget()?.setStyles(t)
    const color = t === 'dark' ? '#929AA5' : '#76808F'
    widget()?.setStyles({
      indicator: {
        tooltip: {
          features: [
            {
              id: 'visible',
              position: 'middle',
              marginLeft: 8,
              marginTop: 7,
              marginRight: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              content: {
                code: '\ue903',
                family: 'icomoon',
              },
              size: 14,
              color: color,
              activeColor: color,
              backgroundColor: 'transparent',
              activeBackgroundColor: 'rgba(22, 119, 255, 0.15)'
            },
            {
              id: 'invisible',
              position: 'middle',
              marginLeft: 8,
              marginTop: 7,
              marginRight: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              content: {
                code: '\ue901',
                family: 'icomoon',
              },
              size: 14,
              color: color,
              activeColor: color,
              backgroundColor: 'transparent',
              activeBackgroundColor: 'rgba(22, 119, 255, 0.15)'
            },
            {
              id: 'setting',
              position: 'middle',
              marginLeft: 6,
              marginTop: 7,
              marginBottom: 0,
              marginRight: 0,
              paddingLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              content: {
                code: '\ue902',
                family: 'icomoon',
              },
              size: 14,
              color: color,
              activeColor: color,
              backgroundColor: 'transparent',
              activeBackgroundColor: 'rgba(22, 119, 255, 0.15)'
            },
            {
              id: 'close',
              position: 'middle',
              marginLeft: 6,
              marginTop: 7,
              marginRight: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              content: {
                code: '\ue900',
                family: 'icomoon',
              },
              size: 14,
              color: color,
              activeColor: color,
              backgroundColor: 'transparent',
              activeBackgroundColor: 'rgba(22, 119, 255, 0.15)'
            }
          ]
        }
      }
    })
  })

  createEffect(() => {
    widget()?.setLocale(locale())
  })

  createEffect(() => {
    widget()?.setTimezone(timezone().key)
  })

  createEffect(() => {
    if (styles()) {
      widget()?.setStyles(styles())
      setWidgetDefaultStyles(lodashClone(widget()!.getStyles()))
    }
  })

  return (
    <>
      <i class="icon-close klinecharts-pro-load-icon"/>
      <Show when={symbolSearchModalVisible()}>
        <SymbolSearchModal
          locale={props.locale}
          datafeed={props.dataloader}
          onSymbolSelected={symbol => { setSymbol(symbol) }}
          onClose={() => { setSymbolSearchModalVisible(false) }}/>
      </Show>
      <Show when={indicatorModalVisible()}>
        <IndicatorModal
          locale={props.locale}
          mainIndicators={mainIndicators()}
          subIndicators={subIndicators()}
          onClose={() => { setIndicatorModalVisible(false) }}
          onMainIndicatorChange={data => {
            const newMainIndicators = [...mainIndicators()]
            if (data.added) {
              createIndicator(widget(), data.name, true, { id: 'candle_pane' })
              newMainIndicators.push(data.name)
            } else {
              widget()?.removeIndicator({name: data.name, paneId: 'candle_pane'})
              newMainIndicators.splice(newMainIndicators.indexOf(data.name), 1)
            }
            setMainIndicators(newMainIndicators)
          }}
          onSubIndicatorChange={data => {
            const newSubIndicators = { ...subIndicators() }
            if (data.added) {
              const paneId = createIndicator(widget(), data.name)
              if (paneId) {
                // @ts-expect-error
                newSubIndicators[data.name] = paneId
              }
            } else {
              if (data.paneId) {
                widget()?.removeIndicator({name: data.name, paneId: data.paneId})
                // @ts-expect-error
                delete newSubIndicators[data.name]
              }
            }
            setSubIndicators(newSubIndicators)
          }}/>
      </Show>
      <Show when={timezoneModalVisible()}>
        <TimezoneModal
          locale={props.locale}
          timezone={timezone()}
          onClose={() => { setTimezoneModalVisible(false) }}
          onConfirm={setTimezone}
        />
      </Show>
      <Show when={settingModalVisible()}>
        <SettingModal
          locale={props.locale}
          currentStyles={utils.clone(widget()!.getStyles())}
          onClose={() => { setSettingModalVisible(false) }}
          onChange={style => {
            widget()?.setStyles(style)
          }}
          onRestoreDefault={(options: SelectDataSourceItem[]) => {
            const style = {}
            options.forEach(option => {
              const key = option.key
              lodashSet(style, key, utils.formatValue(widgetDefaultStyles(), key))
            })
            widget()?.setStyles(style)
          }}
        />
      </Show>
      <Show when={screenshotUrl().length > 0}>
        <ScreenshotModal
          locale={props.locale}
          url={screenshotUrl()}
          onClose={() => { setScreenshotUrl('') }}
        />
      </Show>
      <Show when={indicatorSettingModalParams().visible}>
        <IndicatorSettingModal
          locale={props.locale}
          params={indicatorSettingModalParams()}
          onClose={() => { setIndicatorSettingModalParams({ visible: false, indicatorName: '', paneId: '', calcParams: [] }) }}
          onConfirm={(params)=> {
            const modalParams = indicatorSettingModalParams()
            widget()?.overrideIndicator({ name: modalParams.indicatorName, calcParams: params, paneId: modalParams.paneId })
          }}
        />
      </Show>
      <PeriodBar
        locale={props.locale}
        symbol={symbol()}
        spread={drawingBarVisible()}
        period={period()}
        periods={props.periods}
        onMenuClick={async () => {
          try {
            await startTransition(() => setDrawingBarVisible(!drawingBarVisible()))
            widget()?.resize()
          } catch (e) {}    
        }}
        onSymbolClick={() => { setSymbolSearchModalVisible(!symbolSearchModalVisible()) }}
        onPeriodChange={setPeriod}
        onIndicatorClick={() => { setIndicatorModalVisible((visible => !visible)) }}
        onTimezoneClick={() => { setTimezoneModalVisible((visible => !visible)) }}
        onSettingClick={() => { setSettingModalVisible((visible => !visible)) }}
        onScreenshotClick={() => {
          if (widget) {
            const url = widget()!.getConvertPictureUrl(true, 'jpeg', props.theme === 'dark' ? '#151517' : '#ffffff')
            setScreenshotUrl(url)
          }
        }}
      />
      <div
        class="klinecharts-pro-content">
        <Show when={loadingVisible()}>
          <Loading/>
        </Show>
        <Show when={drawingBarVisible()}>
          <DrawingBar
            locale={props.locale}
            onDrawingItemClick={overlay => { widget()?.createOverlay(overlay) }}
            onModeChange={mode => { widget()?.overrideOverlay({ mode: mode as OverlayMode }) }}
            onLockChange={lock => { widget()?.overrideOverlay({ lock }) }}
            onVisibleChange={visible => { widget()?.overrideOverlay({ visible }) }}
            onRemoveClick={(groupId) => { widget()?.removeOverlay({ groupId }) }}/>
        </Show>
        <div
          ref={widgetRef}
          class='klinecharts-pro-widget'
          data-drawing-bar-visible={drawingBarVisible()}/>
      </div>
    </>
  )
}

export default ChartProComponent