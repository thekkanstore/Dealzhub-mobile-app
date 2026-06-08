import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface HeartUnselectedIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const TKHeartUnselectedIcon: React.FC<HeartUnselectedIconProps> = ({
                                                                            width = 32,
                                                                            height = 32,
                                                                            color = '#A6A6A6',
                                                                          }) => {
  return (
      <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            stroke={color}
            strokeWidth={1.5}
        />
      </Svg>
  );
};
