import * as React from "react";
import Svg, { Path } from "react-native-svg";

function checkedCirlce({ color = "#000", strokeWidth = 0, ...props }) {
  return (
    <Svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" {...props}>
      <Path
        d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm115.8 211.8l-128 128c-5.5 5.5-12.6 8.2-19.8 8.2s-14.34-2.719-19.81-8.188l-64-64c-10.91-10.94-10.91-28.69 0-39.63 10.94-10.94 28.69-10.94 39.63 0L224 280.4l108.2-108.2c10.94-10.94 28.69-10.94 39.63 0 10.87 10.9 10.87 28.7-.03 39.6z"
        fill={color}
        stroke={'none'}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}

export default checkedCirlce;
