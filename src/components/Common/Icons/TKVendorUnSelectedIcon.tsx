import React from 'react';
import Svg, {Path} from 'react-native-svg';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const TKVendorUnselectedIcon: React.FC<IconProps> = ({
  width = 22,
  height = 22,
  color = '#A6A6A6',
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
        stroke={color}
      />
    </Svg>
  );
};
