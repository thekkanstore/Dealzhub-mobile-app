import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface CartUnselectedIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const TKCartUnselectedIcon: React.FC<CartUnselectedIconProps> = ({
                                                                          width = 32,
                                                                          height = 32,
                                                                          color = '#A6A6A6',
                                                                        }) => {
  return (
      <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            stroke={color}
            strokeWidth={1.5}
        />
      </Svg>
  );
};
