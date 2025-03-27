import * as React from "react";
import Svg, { Path } from "react-native-svg";

function zap({ color = "black", size = 82.1, strokeWidth = 1, ...props }) {
  return (
    <Svg
      width={size}
      height={(size * 122.88) / 82.1} // Maintain aspect ratio
      viewBox="0 0 82.1 122.88"
      xmlns="http://www.w3.org/2000/svg"
      xmlSpace="preserve"
      enableBackground="new 0 0 82.1 122.88"
      {...props}
    >
      <Path
        d="M19.62 0h50.2l-17.5 33.88 29.78.52-72.57 88.48 13.96-58.21H0L19.62 0zm-5.7 53.48l14.65-41.7h22.75L39.49 43.53l17.85.3-30.03 44.96 8.95-35.31H13.92z"
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth}
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </Svg>
  );
}

export default zap;