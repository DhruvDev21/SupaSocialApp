import * as React from "react";
import Svg, { Path } from "react-native-svg";

function downArrow({
  color = "#515151", // Default color
  size = 24, // Default size
  strokeWidth = 1, // Default stroke width
  ...props
}) {
  return (
    <Svg
      height={size}
      width={size}
      viewBox="0 0 32 32"
      xmlSpace="preserve"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M14.77 23.795L5.185 14.21a2.265 2.265 0 010-3.195l.8-.801a2.266 2.266 0 013.194 0l7.315 7.315 7.316-7.315a2.266 2.266 0 013.194 0l.8.801a2.265 2.265 0 010 3.195l-9.587 9.585a2.242 2.242 0 01-1.723.647 2.247 2.247 0 01-1.724-.647z"
        fill={color} // Use dynamic color
        stroke={color} // Use dynamic stroke color
        strokeWidth={strokeWidth} // Use dynamic stroke width
      />
    </Svg>
  );
}

export default downArrow;
