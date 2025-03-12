// import * as React from "react";
// import Svg, { Path } from "react-native-svg";

// function circle({ fill = "#000", strokeWidth = 2, ...props }) {
//   return (
//     <Svg
//       height="512px"
//       viewBox="0 0 512 512"
//       width="512px"
//       xmlSpace="preserve"
//       xmlns="http://www.w3.org/2000/svg"
//       enableBackground="new 0 0 512 512"
//       {...props}
//     >
//       <Path
//         d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm0 398.7c-105.1 0-190.7-85.5-190.7-190.7 0-105.1 85.5-190.7 190.7-190.7 105.1 0 190.7 85.5 190.7 190.7 0 105.1-85.6 190.7-190.7 190.7z"
//         fill={fill}
//         stroke="currentColor"
//         strokeWidth={strokeWidth}
//       />
//     </Svg>
//   );
// }

// export default circle;
// import * as React from "react";
// import Svg, { Path } from "react-native-svg";

// function circle({ fill = "#000", strokeWidth = 0, ...props }) {
//   return (
//     <Svg
//       height="20px"
//       viewBox="0 0 20 20"
//       width="20px"
//       xmlns="http://www.w3.org/2000/svg"
//       {...props}
//     >
//       <Path
//         d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"
//         transform="translate(-170 -86) translate(170 86)"
//         fill={fill}
//         fillRule="evenodd"
//         stroke="none"
//         strokeWidth={strokeWidth}
//       />
//     </Svg>
//   );
// }

// export default circle;
// import * as React from "react";
// import Svg, { Path, Circle } from "react-native-svg";

// function circle({ color = "#000", strokeWidth = 0, ...props }) {
//   return (
//     <Svg
//       height="20px"
//       viewBox="0 0 20 20"
//       width="20px"
//       xmlns="http://www.w3.org/2000/svg"
//       {...props}
//     >
//       <Circle
//         cx="10"
//         cy="10"
//         r="9"
//         stroke={color}
//         strokeWidth={strokeWidth}
//         fill="none"  // Make the inside of the circle transparent
//       />
//     </Svg>
//   );
// }

// export default circle;
import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SvgComponent({ color = "black", size = 48, strokeWidth = 3, ...props }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      {...props}
    >
      <Path
        stroke={color}
        strokeMiterlimit={10}
        strokeWidth={strokeWidth}
        d="M45.71 24c0-11.986-9.724-21.71-21.71-21.71S2.29 12.013 2.29 24 12.013 45.71 24 45.71 45.71 35.987 45.71 24z"
      />
    </Svg>
  );
}

export default SvgComponent;


