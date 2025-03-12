import * as React from "react";
import Svg, { Path } from "react-native-svg";

const bag = ({ width = 106.53, height = 122.88, color = "#000", strokeWidth = 2, ...props }) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 106.53 122.88"
      width={width}
      height={height}
      fill={color}
      stroke={color}
      strokeWidth={strokeWidth}
      {...props}
    >
      <Path d="M4.93 30.34h22.48v-4.58a25.77 25.77 0 0151.53 0v4.58h22.66a4.91 4.91 0 013.47 1.45 4.9 4.9 0 011.44 3.48v69.9a17.75 17.75 0 01-17.7 17.7H17.7A17.75 17.75 0 010 105.18v-69.9a4.91 4.91 0 011.45-3.48 4.91 4.91 0 013.47-1.45zm28.76 0h39v-4.58a19.49 19.49 0 00-39 0v4.58zm-6.28 13v-6.72H6.28v62h94v-62H78.94v6.76a6.48 6.48 0 11-6.28-.12v-6.64h-39v6.71a6.48 6.48 0 11-6.28 0z" />
    </Svg>
  );
};

export default bag;
