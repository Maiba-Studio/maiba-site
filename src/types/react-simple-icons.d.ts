declare module "@icons-pack/react-simple-icons/icons/*.mjs" {
  import type { ComponentType } from "react";
  interface IconProps {
    size?: number;
    color?: string;
    className?: string;
    title?: string;
  }
  const Icon: ComponentType<IconProps>;
  export default Icon;
  export const defaultColor: string;
}
