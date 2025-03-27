import * as React from "react";
import Svg, { Path } from "react-native-svg";

function zapon({ color = "black", size = 81.83, strokeWidth = 1, ...props }) {
  return (
    <Svg
      width={size}
      height={(size * 122.88) / 81.83} // Maintain aspect ratio
      viewBox="0 0 81.83 122.88"
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      enableBackground="new 0 0 81.83 122.88"
      {...props}
    >
      <Path
        d="M33.05 63.12L0 60.01 27.4 0 64.86 0 43.62 34.43 81.83 38.66 11.69 122.88 33.05 63.12z"
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth}
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </Svg>
  );
}

export default zapon;