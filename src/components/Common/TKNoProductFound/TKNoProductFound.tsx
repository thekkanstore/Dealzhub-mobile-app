import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {imagePath} from '../../../assets/imagePath';
import {strings} from '../../../utils/language/langauageUtils';
import {fontScale, moderateScale, verticalScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';
import {fontFamily} from '../../../config/styles/fontFamily';

interface Props {
  title?: string;
}

const TKNoProductFound: React.FC<Props> = ({title}) => {
  return (
    <View style={styles.emptyContainer}>
      <Image source={imagePath.noDataFound} style={styles.emptyImage} />
      <Text style={styles.emptyText}>{title ?? strings('labels.sorryNoResultFound')}</Text>
    </View>
  );
};

export default TKNoProductFound;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  emptyText: {
    fontSize: fontScale(16),
    color: colors.noFoundTextColor,
    fontFamily: fontFamily.medium,
    textAlign: 'center',
  },
  emptyImage: {
    width: moderateScale(300),
    height: moderateScale(300),
  },
});
