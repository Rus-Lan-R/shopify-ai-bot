import { FC } from "react";
import { SpriteIconName } from "./types";

interface ISpriteIconProps {
  name: SpriteIconName;
  size?: string;
  color?: string;
}

const DEFAULT_ICON_SIZE = "1rem";

const SpriteIcon: FC<ISpriteIconProps> = (props) => {
  const { name, size = DEFAULT_ICON_SIZE, color, ...rest } = props;

  return (
    <svg color={color} width={size} height={size} {...rest}>
      <use xlinkHref={`#${name}`} />
    </svg>
  );
};

export default SpriteIcon;
