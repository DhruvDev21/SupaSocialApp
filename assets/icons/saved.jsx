import * as React from "react";
import Svg, { Path } from "react-native-svg";

function saved({ size = 120, color = "#000", strokeColor = "red", strokeWidth = 2, ...props }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path d="M10 10H110V110H10z" stroke={strokeColor} fill={color} strokeWidth={strokeWidth} />
    </Svg>
  );
}

export default saved;