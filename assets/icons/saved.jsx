import * as React from "react";
import Svg, { Path } from "react-native-svg";

function saved({ color = "currentColor", size = 24, strokeWidth = 2, ...props }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill={color}
      stroke={color}
      strokeWidth={strokeWidth}
      {...props}
    >
      <Path d="M256 896a42.667 42.667 0 01-20.907-5.547 42.667 42.667 0 01-21.76-37.12v-625.92A97.28 97.28 0 01307.2 128h409.6a97.28 97.28 0 0193.867 99.413v625.92a42.667 42.667 0 01-21.334 36.694 42.667 42.667 0 01-42.666 0l-241.92-136.96L277.333 889.6A42.667 42.667 0 01256 896z" />
    </Svg>
  );
}

export default saved;