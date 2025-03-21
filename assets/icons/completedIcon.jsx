import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { Colors } from "react-native/Libraries/NewAppScreen";

function completedIcon({
    color = "#000",       // Default fill color: black
  stroke = "none",     // Default stroke color: none
  size = 24,          // Default size: 100x100
  ...props
}) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      imageRendering="optimizeQuality"
      fillRule="evenodd"
      clipRule="evenodd"
      viewBox="0 0 505 511.62"
      width={size}
      height={size}
      {...props}
    >
      <Path
        d="M336.11 39.84l-115.38 68.94 135.38 18.4 111.32-69.44-131.32-17.9zm26.72 204.57c73.79 0 133.6 59.82 133.6 133.61 0 73.78-59.81 133.6-133.6 133.6-73.79 0-133.6-59.82-133.6-133.6 0-73.79 59.81-133.61 133.6-133.61zm-34.4 114.76l19.91 18.66 45.73-46.46c4.46-4.53 7.28-8.18 12.79-2.51l17.88 18.33c5.88 5.81 5.58 9.22.04 14.62l-66.23 65.01c-11.66 11.46-9.64 12.15-21.48.41l-38.75-38.52c-2.47-2.68-2.19-5.37.51-8.06l20.75-21.52c3.15-3.3 5.64-3.02 8.85.04zm-123.6-233.04l-.09 141.71-51.45-35.04-51.46 29.07 6.1-148.91-88.54-12.03v312.98l178.95 23.14c2.52 7.09 5.47 13.98 8.85 20.62L9.3 432.08c-5.17-.21-9.3-4.48-9.3-9.69V89.86c.27-4.05 1.89-6.89 5.72-8.81L182.48.85c1.58-.72 3.52-1.01 5.25-.77l308.18 42.04c5.09.59 8.58 4.77 8.58 9.99v.02L505 280.9c-5.72-8.46-15.57-20.29-19.93-27.77V69.56l-115.81 74.93v59.81a174.846 174.846 0 00-19.39.36v-58.82l-145.04-19.71zm-81.52-30.58l112.17-69.44-47.58-6.49L44.24 84.8l79.07 10.75z"
        fill={color}
        stroke={stroke}
      />
    </Svg>
  );
}

export default completedIcon;
