import type { CSSProperties } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ion-icon": {
        name?: string;
        src?: string;
        ios?: string;
        md?: string;
        size?: "small" | "large";
        color?: string;
        style?: CSSProperties;
        className?: string;
        slot?: string;
        "aria-label"?: string;
        "aria-hidden"?: string | boolean;
      };
    }
  }
}
