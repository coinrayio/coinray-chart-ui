import { Component, JSX } from "solid-js";
import { getScreenSize } from "../../../helpers";

export type PopupProps = {
  open?: boolean;
  top?: number;
  left?: number;
  onClose?: () => void;
  onMouseEnter?: (e?: MouseEvent) => void;
  onMouseLeave?: (e?: MouseEvent) => void;
  class?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
};

const Popup: Component<PopupProps> = (props) => {
  if (!props.open) return null;

  const MARGIN = 8;
  const vpW = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vpH = typeof window !== 'undefined' ? window.innerHeight : 768;

  let styleObj: JSX.CSSProperties = {
    ...(props.style ?? {}),
    position: "absolute",
    overflow: 'auto'
  };

  if (typeof props.top === "number") {
    console.log('props.top', props.top);
    styleObj["max-height"] = `${getScreenSize().y - props.top - MARGIN}px`;
    const topPx = Math.max(MARGIN, Math.min(props.top, vpH - MARGIN - 40));
    styleObj.top = `${topPx}px`;
    styleObj.transform = styleObj.transform ?? undefined;
  } else {
    styleObj["max-height"] = "50%";
    styleObj.top = "50%";
    styleObj.transform = "translateY(-50%)";
  }

  if (typeof props.left === "number") {
    styleObj["max-width"] = `${props.left - MARGIN}px`;
    const leftPx = Math.max(MARGIN, Math.min(props.left, vpW - MARGIN - 40));
    styleObj.left = `${leftPx}px`;
    if (typeof props.top === "number") styleObj.transform = undefined;
  } else {
    styleObj["max-width"] = "50%";
    styleObj.left = "50%";
    styleObj.transform = styleObj.transform ? `${styleObj.transform} translateX(-50%)` : "translateX(-50%)";
  }

  return (
    <div
      class="klinecharts-pro-popup_background"
      onClick={(e: MouseEvent) => {
          props.onClose?.()
      }}
      onMouseOver={(e: MouseEvent) => props.onMouseEnter?.(e)}
      onMouseLeave={(e: MouseEvent) => props.onMouseLeave?.(e)}
    >
      <div
        class={`popup ${props.class ?? ""}`}
        style={styleObj}
        onPointerDown={(e) => e.stopPropagation()}
        onclick={(e) => e.stopPropagation()}
      >
        {props.children}
      </div>
    </div>
  );
};

export default Popup;
