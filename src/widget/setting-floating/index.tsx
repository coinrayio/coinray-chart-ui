import { Overlay } from "klinecharts";
import { createSignal, createEffect, onCleanup, onMount, JSX } from "solid-js";
import lodashSet from 'lodash/set'
import { selectedOverlay, setChartModified } from '../../store/chartStore'
import { useChartState } from "../../store/chartStateStore";
import { setPopupOverlay, setShowOverlaySetting } from "../../store/overlaySettingStore";
import { Color } from "../../component";

const { popOverlay, modifyOverlay } = useChartState()

export type FloatingAction = {
  key: string;
  title?: string;
  icon?: JSX.Element;
  visible?: boolean | ((overlay?: Overlay) => boolean);
  // optional inline editor type: 'color' | 'number' | 'select' | undefined
  editor?: {
    type: "color" | "number" | "select";
    value?: string | number;
    options?: string[]; // for select
    min?: number;
    max?: number;
    step?: number;
  };
  // when clicked (or when editor value changed) -> receives overlay id and optional new value
  onClick?: (overlayId: string, value?: any) => void;
};

export type FloatingProps = {
  locale?: string;
  // absolute coords relative to chart container
  x?: number;
  y?: number;
  // user-provided actions override default
  actions?: FloatingAction[];
  onClose?: () => void;
  class?: string;
};

const Icon = {
  group: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 7a2 2 0 100-4 2 2 0 000 4zm0 3c-3 0-6 1.5-6 4v2h12v-2c0-2.5-3-4-6-4zM4 13h2v7H4v-7zm14 0h2v7h-2v-7z"/></svg>
  ),
  color: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 3a7 7 0 00-7 7c0 3.866 3.582 7 7 7s7-3.134 7-7a7 7 0 00-7-7zm0 10a3 3 0 110-6 3 3 0 010 6z"/></svg>
  ),
  text: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5 4v3h5.5v12h3V7H19V4z"/></svg>
  ),
  size: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5 21h14v-2H5v2zm7-18L5.33 13h13.34L12 3z"/></svg>
  ),
  line: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 12h6v2H3zM15 12h6v2h-6zM9 12h6v2H9z"/></svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19.14 12.94A7.963 7.963 0 0019.14 11l2.03-1.58-2-3.46L16 7.13a7.93 7.93 0 00-1.76-.95L13 3h-2l-1.25 3.18c-.63.24-1.22.56-1.76.95L3.83 5.96l-2 3.46L3.86 11c0 .33.03.66.08.98l-1.94 1.5 2 3.46L8 16.87c.53.39 1.13.71 1.76.95L11 21h2l1.25-3.18c.63-.24 1.22-.56 1.76-.95l4.41 1.55 2-3.46-1.94-1.5z"/></svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7h-1V7a5 5 0 00-10 0v3H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-8-3a3 3 0 016 0v3H10V7z"/></svg>
  ),
  trash: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
  ),
  more: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 8a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
  )
};
  const [localPos, setLocalPos] = createSignal({ x: 0, y: 0 });

export default function Floating(props: FloatingProps) {
  const [visibleEditorKey, setVisibleEditorKey] = createSignal<string | null>(null);
  setLocalPos({
    x: localPos().x ?? props.x ?? 0,
    y: localPos().y ?? props.y ?? 0
  })

  // dragging state
  const [dragging, setDragging] = createSignal(false);
  let dragStart = { mx: 0, my: 0, sx: 0, sy: 0 };

  const defaultActions = (overlay: Overlay): FloatingAction[] => {
    console.info('default actions called');
    return [
      { key: "group", title: "Group", icon: Icon.group, onClick: (id) => console.debug("group", id) },
      {
        key: "background",
        title: "Background color",
        icon: Icon.color,
        // try to read sensible defaults from overlay.styles if present
        editor: { type: "color", value: overlay.styles?.line?.color ?? "#000000" },
        onClick: (id, v) => console.debug("set background", id, v)
      },
      {
        key: "text",
        title: "Text color",
        icon: Icon.text,
        editor: { type: "color", value: overlay.styles?.text?.color ?? "#ffffff" },
        onClick: (id, v) => console.debug("set text color", id, v)
      },
      {
        key: "size",
        title: "Size (px)",
        icon: Icon.size,
        editor: { type: "number", value: (overlay && (overlay as any).size) ?? 2, min: 1, max: 50, step: 1 },
        onClick: (id, v) => console.debug("set size", id, v)
      },
      {
        key: "line",
        title: "Line type",
        icon: Icon.line,
        editor: { type: "select", options: ["solid", "dashed"], value: overlay.styles?.line?.style ?? "solid" },
        onClick: (id, v) => console.debug("set line", id, v)
      },
      { key: "settings", title: "Settings", icon: Icon.settings, onClick: (id) => {
          setPopupOverlay(overlay)
          setShowOverlaySetting(true)
      } },
      // { key: "alert", title: "Alert", icon: Icon.alert, onClick: (id) => console.debug("alert", id) },
      {
        key: "lock",
        title: overlay && (overlay as any).locked ? "Unlock" : "Lock",
        icon: Icon.lock,
        visible: true,
        onClick: (id) => modifyOverlay(id, { lock: !overlay.lock })
      },
      { key: "delete", title: "Delete", icon: Icon.trash, onClick: (id) => popOverlay(id) },
      { key: "more", title: "More", icon: Icon.more, onClick: (id) => console.debug("more", id) }
    ]
  };

  const actions = () => {
    const overlay = selectedOverlay();
    console.info('actions called, overlay:', overlay);
    return props.actions ?? (overlay ? defaultActions(overlay) : []);
  }

  let containerEl: HTMLElement | undefined;

  const onDocumentClick = (e: MouseEvent) => {
    const target = e.target as Node;
    if (!containerEl) return;
    if (!containerEl.contains(target)) {
      props.onClose?.();
    }
  };
  const onDocMouseMove = (e: MouseEvent) => {
    if (!dragging()) return;
    const nxRaw = dragStart.sx + (e.clientX - dragStart.mx);
    const nyRaw = dragStart.sy + (e.clientY - dragStart.my);

    // clamp to viewport so toolbar doesn't go off-screen
    const maxX = Math.max(0, (window.innerWidth - (containerEl?.offsetWidth ?? 220)));
    const maxY = Math.max(0, (window.innerHeight - (containerEl?.offsetHeight ?? 48)));
    const nx = Math.min(Math.max(0, nxRaw), maxX);
    const ny = Math.min(Math.max(0, nyRaw), maxY);

    setLocalPos({ x: nx, y: ny });
  };
  const onDocMouseUp = () => {
    if (dragging()) setDragging(false);
    document.removeEventListener('mousemove', onDocMouseMove);
    document.removeEventListener('mouseup', onDocMouseUp);
  };

  onMount(() => {
    document.addEventListener("mousedown", onDocumentClick);

    // if no explicit coordinates provided, place near viewport top-right
    if ((typeof props.x !== 'number' || typeof props.y !== 'number')) {
      const defaultX = Math.max(8, window.innerWidth - 220 - 8);
      const defaultY = 8;
      setLocalPos({ x: defaultX, y: defaultY });
    }
  });
  onCleanup(() => {
    document.removeEventListener("mousedown", onDocumentClick);
    document.removeEventListener('mousemove', onDocMouseMove);
    document.removeEventListener('mouseup', onDocMouseUp);
  });

  createEffect(() => {
    if (typeof props.x === "number" && typeof props.y === "number") {
      setLocalPos({ x: props.x, y: props.y });
    }
  });

  // persist fallback similar to setting-modal -> chartstatedata.styleObj
  const persistFallbackStyle = (key: string, value: any) => {
    try {
      const chartStateObj = localStorage.getItem(`chartstatedata`);
      let chartObj: any;
      if (chartStateObj) {
        chartObj = JSON.parse(chartStateObj);
        chartObj.styleObj = chartObj.styleObj ?? {};
      } else {
        chartObj = { styleObj: {} };
      }
      // use a simple prefixed key so setting-modal/listeners can map it if needed
      const storageKey = `overlay.${key}`;
      lodashSet(chartObj.styleObj, storageKey, value);
      localStorage.setItem(`chartstatedata`, JSON.stringify(chartObj));
      setChartModified(true);
    } catch (err) {
      console.warn('persistFallbackStyle error', err);
    }
  };

  const runAction = (act: FloatingAction, value?: any) => {
    const id = selectedOverlay()?.id;
    // if action provides custom handler, call it
    if (act.onClick) {
      if (id) act.onClick(id, value);
      else act.onClick('unknown', value);
      return;
    }
    // otherwise emit an event so parent components can map keys to actual overlay/style properties
    window.dispatchEvent(new CustomEvent('cr-overlay-setting', {
      detail: { overlayId: id, key: act.key, value }
    }));
    // also persist a fallback style in local storage so setting-modal style persistence is consistent
    persistFallbackStyle(act.key, value);
  };

  // start drag when clicking the floating wrapper (but not on action buttons or editors)
  const onMouseDownStartDrag = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.cr-action-btn') || target.closest('.cr-editor') || target.tagName === 'INPUT' || target.tagName === 'SELECT') {
      return; // don't start drag if interacting with controls
    }
    e.preventDefault();
    dragStart = { mx: e.clientX, my: e.clientY, sx: localPos().x, sy: localPos().y };
    setDragging(true);
    document.addEventListener('mousemove', onDocMouseMove);
    document.addEventListener('mouseup', onDocMouseUp);
  };

  return (
    <div
      ref={el => (containerEl = el!)}
      class={`cr-setting-floating ${props.class ?? ""} ${dragging() ? 'dragging' : ''}`}
      style={{
        // render above everything and capture pointer events like a modal
        position: "fixed",
        left: `${localPos().x}px`,
        top: `${localPos().y}px`,
        ///@ts-ignore
        touchAction: 'none', // improve drag behavior
        cursor: dragging() ? 'grabbing' : 'grab'
      }}
      // prevent pointer events from reaching underlying chart
      onPointerDown={(e) => { e.stopPropagation(); }}
      onMouseDown={(e) => onMouseDownStartDrag(e as unknown as MouseEvent)}
    >
      <div class="cr-floating-inner">
        {actions().map(act => {
          const isVisible = typeof act.visible === "function" ? act.visible(selectedOverlay() ?? undefined) : (act.visible ?? true);
          if (!isVisible) return null;
          return (
            <div class="cr-action" title={act.title ?? act.key}>
            {/* <div class="cr-action" key={act.key} title={act.title ?? act.key}> */}
              <div
                class="cr-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  // toggle editor if present, otherwise run action immediately
                  if (act.editor) {
                    setVisibleEditorKey(visibleEditorKey() === act.key ? null : act.key);
                  } else {
                    runAction(act);
                  }
                }}
              >
                <div class="cr-action-icon">{act.icon}</div>
              </div>

              {act.editor && visibleEditorKey() === act.key && (
                <div class="cr-editor" onClick={(e) => e.stopPropagation()}>
                  {act.editor.type === "color" && (
                    <Color
                      style={{ width: '120px' }}
                      value={act.editor.value as string}
                      reactiveChange={false}
                      onChange={(el) => {
                       runAction(act, el)
                      }}  
                    />
                    // <input
                    //   type="color"
                    //   value={(act.editor.value as string) ?? "#000000"}
                    //   onInput={(e) => runAction(act, (e.currentTarget as HTMLInputElement).value)}
                    //   onClick={(e) => e.stopPropagation()}
                    // />
                  )}
                  {act.editor.type === "number" && (
                    <input
                      type="number"
                      min={act.editor.min}
                      max={act.editor.max}
                      step={act.editor.step}
                      value={String(act.editor.value ?? "")}
                      onInput={(e) => runAction(act, Number((e.currentTarget as HTMLInputElement).value))}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  {act.editor.type === "select" && (
                    <select
                      value={(act.editor.value as string) ?? ""}
                      onChange={(e) => runAction(act, (e.currentTarget as HTMLSelectElement).value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(act.editor.options ?? []).map(opt => <option value={opt}>{opt}</option>)}
                    </select>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}