import * as React from "react";
import Svg, { Path } from "react-native-svg";

function retakeCamera({ size = 24, color = "black", strokeWidth = 2, ...props }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      fill={color}
      strokeWidth={strokeWidth}
      {...props}
    >
      <Path 
        d="M20 5h-3l-2-2H9L7 5H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2m-8 13c-1.08 0-2.14-.35-3-1l1.44-1.44c.47.29 1.01.44 1.56.44a3 3 0 003-3 3 3 0 00-3-3c-1.26 0-2.4.8-2.82 2H11l-3 3-3-3h2.1A4.997 4.997 0 0113 8.1a5 5 0 01-1 9.9z" 
        fill={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}

export default retakeCamera;