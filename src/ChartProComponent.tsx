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
  PaneOptions, Indicator, FormatDateParams, TooltipFeatureStyle,
  IndicatorTooltipData
} from 'klinecharts'

import lodashSet from 'lodash/set'
import lodashClone from 'lodash/cloneDeep'

import { SelectDataSourceItem, Loading } from './component'

import {
  PeriodBar, DrawingBar, IndicatorModal, TimezoneModal, SettingModal,
  ScreenshotModal, IndicatorSettingModal, SymbolSearchModal
} from './widget'

import { translateTimezone } from './widget/timezone-modal/data'

import { SymbolInfo, Period, ChartProOptions, ChartPro } from './types/types'
import ChartDataLoader from './DataLoader'

export interface ChartProComponentProps extends Required<Omit<ChartProOptions, 'container' | 'datafeed'>> {
  ref: (chart: ChartPro) => void
  dataloader: ChartDataLoader
}

interface PrevSymbolPeriod {
  symbol: SymbolInfo
  period: Period
}

function createIndicator (widget: Chart, indicatorName: string, isStack?: boolean, paneOptions?: PaneOptions): Nullable<string> {
  if (indicatorName === 'VOL') {
    paneOptions = { axis: { gap: { bottom: 2 } }, ...paneOptions }
  }
  const indi =  widget.createIndicator({
    name: indicatorName,
    createTooltipDataSource: (param): IndicatorTooltipData => {
      const indiStyles = param.chart.getStyles().indicator
      const features = indiStyles.tooltip.features
      const icons: TooltipFeatureStyle[] = []

      icons.push(param.indicator.visible ? features[1] : features[0])
      icons.push(features[2])
      icons.push(features[3])

      return {
        name: `${indicatorName}_${indi}`,
        calcParamsText: indicatorName,
        features: icons,
        legends: []
      }
    }}, isStack, paneOptions) ?? null

  return indi
}

export const [loadingVisible, setLoadingVisible] = createSignal(false)
export const [symbol, setSymbol] = createSignal<Nullable<SymbolInfo>>(null)
export const [period, setPeriod] = createSignal<Nullable<Period>>(null)
export const [instanceapi, setInstanceapi] = createSignal<Nullable<Chart>>(null)

const ChartProComponent: Component<ChartProComponentProps> = props => {
  let widgetRef: HTMLDivElement | undefined = undefined

  let priceUnitDom: HTMLElement

  const [theme, setTheme] = createSignal(props.theme)
  const [styles, setStyles] = createSignal(props.styles)
  const [locale, setLocale] = createSignal(props.locale)

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

  const [indicatorSettingModalParams, setIndicatorSettingModalParams] = createSignal({
    visible: false, indicatorName: '', paneId: '', calcParams: [] as Array<any>
  })
  setPeriod(props.period)
  setSymbol(props.symbol)

  props.ref({
    setTheme,
    getTheme: () => theme(),
    setStyles,
    getStyles: () => instanceapi()!.getStyles(),
    setLocale,
    getLocale: () => locale(),
    setTimezone: (timezone: string) => { setTimezone({ key: timezone, text: translateTimezone(props.timezone, locale()) }) },
    getTimezone: () => timezone().key,
    setSymbol,
    getSymbol: () => symbol()!,
    setPeriod,
    getPeriod: () => period()!,
    getInstanceApi: () => instanceapi(),
    resize: () => instanceapi()?.resize(),
    dispose: () => {}
  })

  const documentResize = () => {
    instanceapi()?.resize()
  }

  onMount(() => {
    window.addEventListener('resize', documentResize)
    setInstanceapi(init(widgetRef!, {
      formatter: {
        formatDate: (params: FormatDateParams) => {
          const p = period()!
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

    if (instanceapi()) {
      console.info('ChartPro widget initialized')
      const watermarkContainer = instanceapi()!.getDom('candle_pane', 'main')
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

      const priceUnitContainer = instanceapi()!.getDom('candle_pane', 'yAxis')
      priceUnitDom = document.createElement('span')
      priceUnitDom.className = 'klinecharts-pro-price-unit'
      priceUnitContainer?.appendChild(priceUnitDom)

      instanceapi()?.subscribeAction('onCrosshairFeatureClick', (data) => {
        console.info('onCrosshairFeatureClick', data)
      })

      instanceapi()?.subscribeAction('onIndicatorTooltipFeatureClick', (data) => {
        console.info('onIndicatorTooltipFeatureClick', data)
        const _data = data as { paneId: string, feature: TooltipFeatureStyle, indicator: Indicator }
        // if (_data.indicatorName) {
          switch (_data.feature.id) {
            case 'visible': {
              instanceapi()?.overrideIndicator({ name: _data.indicator.name, visible: true, paneId: _data.paneId })
              break
            }
            case 'invisible': {
              instanceapi()?.overrideIndicator({ name: _data.indicator.name, visible: false, paneId: _data.paneId })
              break
            }
            case 'setting': {
              const indicator = instanceapi()?.getIndicators({ paneId: _data.paneId, name: _data.indicator.name, id: _data.indicator.id }).at(0)
              if (!indicator) return
              setIndicatorSettingModalParams({
                visible: true, indicatorName: _data.indicator.name, paneId: _data.paneId, calcParams: indicator.calcParams
              })
              break
            }
            case 'close': {
              if (_data.paneId === 'candle_pane') {
                const newMainIndicators = [...mainIndicators()]
                instanceapi()?.removeIndicator({ paneId: _data.paneId, name: _data.indicator.name, id: _data.indicator.id })
                newMainIndicators.splice(newMainIndicators.indexOf(_data.indicator.name), 1)
                setMainIndicators(newMainIndicators)
              } else {
                const newIndicators = { ...subIndicators() }
                instanceapi()?.removeIndicator({ paneId: _data.paneId, name: _data.indicator.name, id: _data.indicator.id })
                // @ts-expect-error
                delete newIndicators[_data.indicator.name]
                setSubIndicators(newIndicators)
              }
            }
          }
        // }
      })

      instanceapi()?.subscribeAction('onCandleTooltipFeatureClick', (data) => {
        console.info('onCandleTooltipFeatureClick', data)
      })

      const s = symbol()
      if (s?.priceCurrency) {
        priceUnitDom.innerHTML = s?.priceCurrency.toLocaleUpperCase()
        priceUnitDom.style.display = 'flex'
      } else {
        priceUnitDom.style.display = 'none'
      }
      instanceapi()?.setSymbol({ ticker: s!.ticker, pricePrecision: s?.pricePrecision ?? 2, volumePrecision: s?.volumePrecision ?? 0 })
      instanceapi()?.setPeriod(period()!)
      instanceapi()?.setDataLoader(props.dataloader)
    }

    const w = instanceapi()

    if (w) {
      mainIndicators().forEach(indicator => {
        if (w)
          createIndicator(w, indicator, true, { id: 'candle_pane' })
      })
      const subIndicatorMap = {}
      props.subIndicators!.forEach(indicator => {
        const paneId = createIndicator(w, indicator, true)
        if (paneId) {
          // @ts-expect-error
          subIndicatorMap[indicator] = paneId
        }
      })
      setSubIndicators(subIndicatorMap)
    }
  })

  onCleanup(() => {
    window.removeEventListener('resize', documentResize)
    dispose(widgetRef!)
  })

  createEffect((prev?: PrevSymbolPeriod) => {
    console.info('symbol or period changed effect', symbol(), period(), prev)

    if (!props.dataloader.loading) {
      console.info('setLoadingVisible false by effect')
      const s = symbol()
      const p = period()

      if (prev?.period.span !== p!.span && prev?.period.type !== p!.type) {
        console.info('period changed: set period', p)
        instanceapi()?.setPeriod(p!)
      }
      if (prev?.symbol?.ticker !== s!.ticker)
        console.info('ticker changed: set symbol', s)
        instanceapi()?.setSymbol({
          ticker: s!.ticker,
          pricePrecision: s!.pricePrecision,
          volumePrecision: s!.volumePrecision,
        })

      onCleanup(() => {
        // Optional cleanup logic before re-run
      })

      return { symbol: s!, period: p! }
    }
    console.info('props.dataloader.loading is true, skip setLoadingVisible false')

    return prev
  })

  createEffect(() => {
    const t = theme()
    instanceapi()?.setStyles(t)
    const color = t === 'dark' ? '#929AA5' : '#76808F'
    instanceapi()?.setStyles({
      indicator: {
        tooltip: {
          features: [
            {
              id: 'visible',
              position: 'middle',
              marginLeft: 8,
              marginTop: 1,
              marginRight: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              type: 'icon_font',
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
              marginTop: 1,
              marginRight: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              type: 'icon_font',
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
              marginTop: 1,
              marginBottom: 0,
              marginRight: 0,
              paddingLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              type: 'icon_font',
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
              marginTop: 1,
              marginRight: 0,
              marginBottom: 0,
              paddingLeft: 0,
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              type: 'icon_font',
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
    instanceapi()?.setLocale(locale())
  })

  createEffect(() => {
    instanceapi()?.setTimezone(timezone().key)
  })

  createEffect(() => {
    if (styles()) {
      instanceapi()?.setStyles(styles())
      setWidgetDefaultStyles(lodashClone(instanceapi()!.getStyles()))
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
              createIndicator(instanceapi()!, data.name, true, { id: 'candle_pane' })
              newMainIndicators.push(data.name)
            } else {
              instanceapi()?.removeIndicator({name: data.name, paneId: 'candle_pane', id: data.id ?? undefined})
              newMainIndicators.splice(newMainIndicators.indexOf(data.name), 1)
            }
            setMainIndicators(newMainIndicators)
          }}
          onSubIndicatorChange={data => {
            console.info('onSubIndicatorChange', data)
            const newSubIndicators = { ...subIndicators() }
            if (data.added) {
              const id = createIndicator(instanceapi()!, data.name)
              if (id) {
                // @ts-expect-error
                newSubIndicators[data.name] = id
              }
            } else {
              if (data.id) {
                instanceapi()?.removeIndicator({name: data.name, id: data.id})
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
          currentStyles={utils.clone(instanceapi()!.getStyles())}
          onClose={() => { setSettingModalVisible(false) }}
          onChange={style => {
            instanceapi()?.setStyles(style)
          }}
          onRestoreDefault={(options: SelectDataSourceItem[]) => {
            const style = {}
            options.forEach(option => {
              const key = option.key
              lodashSet(style, key, utils.formatValue(widgetDefaultStyles(), key))
            })
            instanceapi()?.setStyles(style)
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
            instanceapi()?.overrideIndicator({ name: modalParams.indicatorName, calcParams: params, paneId: modalParams.paneId })
          }}
        />
      </Show>
      <PeriodBar
        locale={props.locale}
        symbol={symbol()!}
        spread={drawingBarVisible()}
        period={period()!}
        periods={props.periods}
        onMenuClick={async () => {
          try {
            await startTransition(() => setDrawingBarVisible(!drawingBarVisible()))
            instanceapi()?.resize()
          } catch (e) {}    
        }}
        onSymbolClick={() => { setSymbolSearchModalVisible(!symbolSearchModalVisible()) }}
        onPeriodChange={setPeriod}
        onIndicatorClick={() => { setIndicatorModalVisible((visible => !visible)) }}
        onTimezoneClick={() => { setTimezoneModalVisible((visible => !visible)) }}
        onSettingClick={() => { setSettingModalVisible((visible => !visible)) }}
        onScreenshotClick={() => {
          if (instanceapi()) {
            const url = instanceapi()!.getConvertPictureUrl(true, 'jpeg', props.theme === 'dark' ? '#151517' : '#ffffff')
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
            onDrawingItemClick={overlay => { instanceapi()?.createOverlay(overlay) }}
            onModeChange={mode => { instanceapi()?.overrideOverlay({ mode: mode as OverlayMode }) }}
            onLockChange={lock => { instanceapi()?.overrideOverlay({ lock }) }}
            onVisibleChange={visible => { instanceapi()?.overrideOverlay({ visible }) }}
            onRemoveClick={(groupId) => { instanceapi()?.removeOverlay({ groupId }) }}/>
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