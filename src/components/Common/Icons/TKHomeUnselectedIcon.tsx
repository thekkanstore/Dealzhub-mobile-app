import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface HomeUnselectedIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const TKHomeUnselectedIcon: React.FC<HomeUnselectedIconProps> = ({
                                                                          width = 32,
                                                                          height = 32,
                                                                          color = '#A6A6A6',
                                                                        }) => {
  return (
      <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            stroke={color}
            strokeWidth={1.5}
        />
      </Svg>
  );
};
