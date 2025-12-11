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

import { Show, createSignal } from 'solid-js'
import {
	useOverlaySettings, popupLeft, popupTop,
	popupOverlay, setShowOverlaySetting
} from '../../../store/overlaySettingStore'
import { useChartState } from '../../../store/chartStateStore'
import { Icon } from '../../../widget/icons'
import { GenericPopup } from '../index'

// const triggerAction = () => {
// 	useChartState().popOverlay(popupOverlay()!.id)
// }

const close = () => {
	useOverlaySettings().closePopup()
}

const setStyle = (type: 'overlay') => {
	if (type === 'overlay')
		setShowOverlaySetting(true)

	close()
}

const sendBack = () => {
	const overlay = popupOverlay()
	if (!overlay) {
		close()
		return
	}
	useChartState()?.modifyOverlay(overlay.id, { zLevel: +overlay!.zLevel + 1 })
	close()
}

const sendFront = () => {
	const overlay = popupOverlay()
	if (!overlay) {
		close()
		return
	}
	useChartState()?.modifyOverlay(overlay.id, { zLevel: +overlay!.zLevel - 1 })
	close()
}

const lockUnlock = () => {
	const overlay = popupOverlay()
	if (!overlay) {
		close()
		return
	}
	useChartState()?.modifyOverlay(overlay.id, { lock: !overlay.lock })
	close()
}

const hideUnhide = () => {
	const overlay = popupOverlay()
	if (!overlay) {
		close()
		return
	}
	useChartState()?.modifyOverlay(overlay.id, { visible: overlay.visible })
	close()
}


const OverlayOptionsPopup = () => {
	const [hoverKey, setHoverKey] = createSignal<string | null>(null)
	const [hoverTop, setHoverTop] = createSignal<number>(0)
	let popupEl: HTMLElement | undefined
	let hideTimer: number | undefined
	const HIDE_DELAY = 200 // ms

	const cancelHideTimer = () => {
		if (hideTimer) {
			window.clearTimeout(hideTimer)
			hideTimer = undefined
		}
	}
	const startHideTimer = () => {
		cancelHideTimer()
		hideTimer = window.setTimeout(() => {
			setHoverKey(null)
			hideTimer = undefined
		}, HIDE_DELAY)
	}

	const onRowHover = (e: MouseEvent, key: string) => {
		cancelHideTimer()
		const target = e.currentTarget as HTMLElement
		if (!popupEl || !target) {
			setHoverKey(key)
			setHoverTop(0)
			return
		}

		const top = (target as HTMLElement).offsetTop || 0
		const center = top + ((target as HTMLElement).offsetHeight || 32) / 2 - 12
		setHoverTop(center)
		setHoverKey(key)
	}
	const onRowLeave = () => {
		startHideTimer()
	}

	return (
		<GenericPopup
			open={true}
			top={popupTop()}
			left={popupLeft()}
			onClose={() => close()}
			class="overlay-options-popup"
		>
			<div ref={el => (popupEl = el!)} style={{ display: 'flex', 'flex-direction': 'row', gap: '1px' }}>
				<table class="overlay-menu" role="menu">
					<tbody>
						<tr onMouseEnter={(e) => onRowHover(e, 'template')} onMouseLeave={onRowLeave} onclick={() => { console.debug('template clicked'); close(); }}>
							<td class="icon-cell"></td>
							<td class="label">
								<div class="flex-row row-content">
									<span>Template</span>
									<span class="inline-icon"><Icon name="arrowRight" /></span>
								</div>
							</td>
						</tr>

						<tr onMouseEnter={(e) => onRowHover(e, 'visual')} onMouseLeave={onRowLeave} onclick={() => { console.debug('visual order clicked'); close(); }}>
							<td class="icon-cell"><Icon name="layerStack" /></td>
							<td class="label">
								<div class="flex-row row-content">
									<span>Visual order</span>
									<span class="inline-icon"><Icon name="arrowRight" /></span>
								</div>
							</td>
						</tr>

						<tr onMouseEnter={(e) => onRowHover(e, 'visibility')} onMouseLeave={onRowLeave} onclick={() => { console.debug('visibility intervals clicked'); close(); }}>
							<td class="icon-cell"></td>
							<td class="label">
								<div class="flex-row row-content">
									<span>Visibility on intervals</span>
									<span class="inline-icon"><Icon name="arrowRight" /></span>
								</div>
							</td>
						</tr>

						<tr class="divider-after" onclick={() => { console.debug('object tree clicked'); close(); }}>
							<td class="icon-cell"></td>
							<td class="label">
								<div class="flex flex-row row-content">
									<span>Object Tree…</span>
								</div>
							</td>
						</tr>

						<tr onclick={() => { console.debug('clone ctr+drag'); close(); }}>
							<td class="icon-cell"><Icon name="copy" /></td>
							<td class="label">
								<div class="flex flex-row row-content">
									<span>Clone</span>
									<span class="shortcut-pill blurred"><span class="key">Ctrl</span><span class="plus">+</span><span class="key">Drag</span></span>
								</div>
							</td>
						</tr>

						<tr class="divider-after" onclick={() => { console.debug('copy ctr+c'); close(); }}>
							<td class="icon-cell"><Icon name="copy" /></td>
							<td class="label">
								<div class="flex flex-row row-content">
									<span>Copy</span>
									<span class="shortcut-pill blurred"><span class="key">Ctrl</span><span class="plus">+</span><span class="key">C</span></span>
								</div>
							</td>
						</tr>

						<tr onclick={lockUnlock}>
							<td class="icon-cell"><Icon name={popupOverlay()?.lock ? "locked" : "unlocked"} /></td>
							<td class="label">
								<span>{popupOverlay()?.lock ? 'Unlock' : 'Lock'}</span>
							</td>
						</tr>

						<tr onclick={hideUnhide}>
							<td class="icon-cell"><Icon name={popupOverlay()?.visible ? "hide" : "show"} /></td>
							<td class="label">
								<span>{popupOverlay()?.visible ? 'Hide' : 'Show'}</span>
							</td>
						</tr>

						<tr class="divider-after" onclick={() => { useChartState().popOverlay(popupOverlay()!.id); close(); }}>
							<td class="icon-cell"><Icon name="trash" /></td>
							<td class="label">
								<span>Remove</span>
								<span class="shortcut-pill blurred"><span class="key">Del</span></span>
							</td>
						</tr>

						<tr onclick={() => setStyle('overlay')}>
							<td class="icon-cell"><Icon name="settings" /></td>
							<td class="label">
								<span>Settings</span>
							</td>
						</tr>
					</tbody>
				</table>
				{hoverKey() && (() => {
					const popupLeftPx = popupLeft() ?? 0
					const popupTopPx = popupTop() ?? 0
					///@ts-ignore
					const popupWidth = popupEl ? popupEl.getBoundingClientRect().width : (popupEl?.clientWidth ?? 220)
					const left = popupLeftPx + popupWidth + 8
					const top = popupTopPx + (hoverTop() ?? 0)
					return (
						<div
							class="submenu"
							style={{ position: 'fixed', left: `${left}px`, top: `${top}px` }}
							onMouseEnter={() => cancelHideTimer()}
							onMouseLeave={onRowLeave}
						>
							<ul>
								<Show when={hoverKey() === 'visual'}>
									<li onClick={() => { useChartState()?.modifyOverlay(popupOverlay()!.id, { zLevel: 99 }); close(); }}>Bring to front</li>
									<li onClick={() => { useChartState()?.modifyOverlay(popupOverlay()!.id, { zLevel: -9999 }); close(); }}>Send to back</li>
									<li onClick={() => sendFront()}>Bring forward</li>
									<li onClick={() => sendBack()}>Send backward</li>
								</Show>
								<Show when={hoverKey() === 'template'}>
									<li onClick={() => { console.debug('save as'); close(); }}>Save as…</li>
									<li onClick={() => {console.debug('apply default'); close(); }}>Apply default</li>
								</Show>
								<Show when={hoverKey() === 'visibility'}>
									<li onClick={() => { console.debug('current and above'); close(); }}>Current Interval and above</li>
									<li onClick={() => { console.debug('current and below'); close(); }}>Current Interval and below</li>
									<li onClick={() => { console.debug('current only'); close(); }}>Current Interval only</li>
									<li onClick={() => { console.debug('all intervals'); close(); }}>All intervals</li>
								</Show>
							</ul>
						</div>
					)
				})()}
			</div>
		</GenericPopup>
	)
}

export default OverlayOptionsPopup
