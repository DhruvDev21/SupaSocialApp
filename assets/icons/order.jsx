// import * as React from "react";
// import Svg, { Path } from "react-native-svg";

// function order({ size = 24, color = "black", strokeWidth = 1, ...props }) {
//   return (
//     <Svg
//     xmlns="http://www.w3.org/2000/svg"
//     width={size}
//     height={size}
//     viewBox="0 0 128 128"
//     {...props}
//   >
//     <Path
//       d="M32 11c-.8 0-1.6.3-2.1.9l-20 20c-.6.5-.9 1.3-.9 2.1v80c0 1.7 1.3 3 3 3h104c1.7 0 3-1.3 3-3V34c0-.8-.3-1.6-.9-2.1l-20-20c-.5-.6-1.3-.9-2.1-.9H32zm1.2 6H61v14H19.2l14-14zM67 17h27.8l14 14H67V17zM15 37h98v74H15V37z"
//       fill={color}
//       stroke={color}
//       strokeWidth={strokeWidth}
//     />
//   </Svg>
//   );
// }

// export default order;
import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SvgComponent({ size = 32, color = "black", strokeWidth = 0, ...props }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      {...props}
    >
      <Path
        d="M28 18a1 1 0 001-1V6.84a1 1 0 00-.08-.25v-.08a1.13 1.13 0 00-.22-.27.71.71 0 00-.17-.11h-.14l-13-4a1 1 0 00-.88.15l-11 8v.05a.77.77 0 00-.23.28v.12a.94.94 0 00-.06.28A.25.25 0 003 11v14a1 1 0 00.73 1l14 4a.84.84 0 00.27 0 1.13 1.13 0 00.32-.05l.09-.05.19-.1 10-8a1 1 0 10-1.24-1.56L19 26.92V15.48l8-6.4V17a1 1 0 001 1zM15.18 4.1L25.9 7.4l-3.11 2.49-10.94-3.37zM5 12.33l8.73 2.49a1 1 0 00.54-1.92l-8-2.3L9.83 8l11.07 3.4-3.52 2.82a.84.84 0 00-.18.23.86.86 0 00-.07.1A1.07 1.07 0 0017 15v12.67L5 24.25z"
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}

export default SvgComponent;
