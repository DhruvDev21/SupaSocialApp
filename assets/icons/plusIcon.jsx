import * as React from "react";
import Svg, { Path } from "react-native-svg";

function PlusIcon({ color = "#000", strokeWidth = 2, ...props }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={color}
      stroke={color}
      strokeWidth={strokeWidth}
      {...props}
    >
      <Path d="M12 2v20M2 12h20" />
    </Svg>
  );
}

export default PlusIcon;