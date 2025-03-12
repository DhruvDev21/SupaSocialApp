// import * as React from "react";
// import Svg, { Path } from "react-native-svg";

// function pendingIcon({
//     size = 24,
//   color = "currentColor",
// //   strokeColor = "none",
//   strokeWidth = 0,
//   ...props
// }) {
//   return (
//     <Svg
//       width={size}
//       height={size}
//       viewBox="0 0 1024 1024"
//       fill={color}
//       {...props}
//     >
//       <Path
//         d="M181.8 247.3h82v64.3h429.3v-64.3h82.8v231.2h46V201.3H693.1v-64.2H263.8v64.2h-128v621.8h348.3v-46H181.8V247.3zm128-64.1h337.3v82.5H309.8v-82.5z"
//         stroke={color}
//         strokeWidth={strokeWidth}
//       />
//       <Path
//         d="M286.8 393.6h384.1v46H286.8zm0 132.3H516v46H286.8zm0 123.4h164.4v46H286.8zM706 522.4c-100.5 0-182.2 81.7-182.2 182.2 0 100.5 81.7 182.2 182.2 182.2 100.5 0 182.2-81.7 182.2-182.2 0-100.5-81.8-182.2-182.2-182.2zm0 318.4c-75.1 0-136.2-61.1-136.2-136.2s61-136.2 136.2-136.2 136.2 61.1 136.2 136.2S781.1 840.8 706 840.8z"
//         stroke={color}
//         strokeWidth={strokeWidth}
//       />
//       <Path
//         d="M711.8 617h-46v120.7h115.9v-46h-69.9z"
//         stroke={color}
//         strokeWidth={strokeWidth}
//       />
//     </Svg>
//   );
// }

// export default pendingIcon;
import * as React from "react";
import Svg, { Path } from "react-native-svg";

function pendingIcon({ color = "#000", size = 24, strokeWidth = 1, ...props }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
      imageRendering="optimizeQuality"
      fillRule="evenodd"
      clipRule="evenodd"
      viewBox="0 0 505 512.15"
      width={size}
      height={size}
      {...props}
    >
      <Path
        d="M336.11 39.84l-115.38 68.94 135.38 18.4 111.32-69.44-131.32-17.9zM362.44 245c73.77 0 133.58 59.8 133.58 133.58 0 73.77-59.81 133.57-133.58 133.57-73.77 0-133.57-59.8-133.57-133.57 0-73.78 59.8-133.58 133.57-133.58zm-23.12 86.93c0-10.96 8.89-19.85 19.85-19.85 10.97 0 19.86 8.89 19.86 19.85v52.99l29.81 9.41c10.45 3.3 16.24 14.45 12.95 24.9-3.3 10.45-14.45 16.24-24.9 12.95l-42.95-13.57c-8.43-2.3-14.62-10-14.62-19.15v-67.53zm-134.49-205.8l-.09 141.71-51.45-35.04-51.46 29.07 6.1-148.91-88.54-12.03v312.98l178.95 23.13c2.52 7.1 5.47 13.99 8.85 20.63L9.3 432.08c-5.17-.21-9.3-4.48-9.3-9.69V89.86c.27-4.05 1.89-6.89 5.72-8.81L182.47.85c1.58-.72 3.53-1.01 5.26-.76l308.18 42.03c5.09.59 8.58 4.77 8.58 9.99v.02L505 280.9c-5.72-8.46-15.57-20.29-19.93-27.77V69.56l-115.81 74.93v59.81a174.577 174.577 0 00-19.39.36v-58.82l-145.04-19.71zm-81.52-30.58l112.17-69.44-47.58-6.49L44.24 84.8l79.07 10.75z"
        fill={color}
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}

export default pendingIcon;
