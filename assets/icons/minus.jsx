import * as React from "react";
import Svg, { Path } from "react-native-svg";

function minus({ color = "#000", strokeWidth = 2, ...props }) {
  return (
    <Svg
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      stroke={color}
      strokeWidth={strokeWidth}
      {...props}
    >
      <Path d="M5 12h14" />
    </Svg>
  );
}

export default minus;
