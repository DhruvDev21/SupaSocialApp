import * as React from "react";
import Svg, { Path } from "react-native-svg";

function ChatIcon(props) {
  return (
    <Svg
      id="Layer_1"
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 122.88 108.25"
      width={props.width || 24}  // Default width is 24 if not provided
      height={props.height || 24}  // Default height is 24 if not provided
      {...props}
    >
      <Path
        d="M51.16 93.74c13 12.49 31.27 16.27 49.59 8.46l15.37 6L111 96.13c17.08-13.68 14-32.48 1.44-45.3a44.38 44.38 0 01-4.88 13.92 51.45 51.45 0 01-14.11 16.09 62.51 62.51 0 01-19.73 10 71.07 71.07 0 01-22.56 2.92zm23.58-57.61a6.68 6.68 0 11-6.68 6.68 6.68 6.68 0 016.68-6.68zm-44.15 0a6.68 6.68 0 11-6.68 6.68 6.68 6.68 0 016.68-6.68zm22.08 0A6.68 6.68 0 1146 42.81a6.68 6.68 0 016.68-6.68zM54 0c14.42.44 27.35 5.56 36.6 13.49 9.41 8.07 15 19 14.7 31-.36 12-6.66 22.61-16.55 30.11C79 82.05 65.8 86.4 51.38 86a64.68 64.68 0 01-11.67-1.4 61 61 0 01-10-3.07L7.15 90.37l7.54-17.92A43.85 43.85 0 014 59a36.2 36.2 0 01-4-17.54c.36-12 6.66-22.61 16.55-30.12C26.3 4 39.53-.4 54 0zm-.14 5.2c-13.27-.38-25.34 3.57-34.17 10.26C11 22 5.5 31.28 5.19 41.6a31.2 31.2 0 003.42 15.07 39.31 39.31 0 0010.81 13l1.58 1.2-4.32 10.18 13.08-5.14 1 .42a55.59 55.59 0 0010.05 3.18 59 59 0 0010.71 1.29c13.22.39 25.29-3.56 34.12-10.26C94.31 64 99.83 54.73 100.15 44.4c.3-10.32-4.65-19.85-12.9-26.92C78.85 10.26 67.06 5.6 53.87 5.2z"
        fillRule="evenodd"
        stroke={props.color || "currentColor"}  // Default color is currentColor if not provided
        strokeWidth={props.strokeWidth}  // Default stroke width is 2 if not provided
      />
    </Svg>
  );
}

export default ChatIcon;
