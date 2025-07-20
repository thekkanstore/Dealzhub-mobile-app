import React from 'react';
import {ColorValue, StatusBar, StatusBarStyle} from 'react-native';
import {colors} from '../../config/styles/colors';

type props = {
  barStyle?: StatusBarStyle | null | undefined;
  backgroundColor?: ColorValue;
};
const TKStatusBar: React.FC<props> = ({barStyle, backgroundColor}) => {
  return (
    <StatusBar
      translucent
      barStyle={barStyle ?? 'dark-content'}
      backgroundColor={backgroundColor ?? colors.transparent}
    />
  );
};

export default TKStatusBar;
