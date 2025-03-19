import * as React from "react";
import Svg, { Path } from "react-native-svg";

function filledStar({ size = 24, color = "#000", strokeWidth = 1, ...props }) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      {...props}
    >
      <Path
        d="M47.755 3.765L59.28 27.118a3.075 3.075 0 002.314 1.681l25.772 3.745c2.52.366 3.527 3.463 1.703 5.241L70.42 55.962a3.074 3.074 0 00-.884 2.72l4.402 25.667c.431 2.51-2.204 4.424-4.458 3.239L46.43 75.47a3.071 3.071 0 00-2.86 0L20.519 87.588c-2.254 1.185-4.889-.729-4.458-3.239l4.402-25.667a3.074 3.074 0 00-.884-2.72L.931 37.784c-1.824-1.778-.817-4.875 1.703-5.241l25.772-3.745a3.073 3.073 0 002.314-1.681L42.245 3.765c1.127-2.284 4.383-2.284 5.51 0z"
        transform="matrix(2.81 0 0 2.81 1.407 1.407)"
        stroke={color}
        strokeWidth={strokeWidth}
        fill={color}
        fillRule="nonzero"
        opacity={1}
      />
    </Svg>
  );
}

export default filledStar;