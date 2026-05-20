import React from 'react';
import {Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import TKItemCard from '../../Common/TKItemCard/TKItemCard';
import {moderateScale} from '../../../config/styles/responsiveSize';
import {colors} from '../../../config/styles/colors';
import {fontFamily} from '../../../config/styles/fontFamily';
import {TKWhatsappIcon} from '../../Common/Icons/TKWhatsappIcon';

const CustomerSupportCard = () => {
  const handleSupportPress = () => {
    Linking.openURL('whatsapp://send?phone=919746323074').catch(() => {
      // Fallback if WhatsApp is not installed
      Linking.openURL('https://wa.me/919746323074');
    });
  };

  return (
    <Pressable onPress={handleSupportPress}>
      <TKItemCard style={style.itemContainer}>
        <View style={style.iconContainer}>
          <TKWhatsappIcon
            width={moderateScale(20)}
            height={moderateScale(20)}
            color={colors.primaryButtonBackgroundColor}
          />
        </View>
        <View style={style.textContainer}>
          <Text style={style.itemText}>Customer Support</Text>
          <Text style={style.subText}>For any queries contact +91 97463 23074</Text>
        </View>
      </TKItemCard>
    </Pressable>
  );
};

export default CustomerSupportCard;

const style = StyleSheet.create({
  itemContainer: {
    marginBottom: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  iconContainer: {
    width: moderateScale(35),
    height: moderateScale(35),
    borderRadius: moderateScale(20),
    backgroundColor: '#E5EEE9', // Using secondary background / tertiary button color
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemText: {
    color: colors.primaryTextColor,
    fontSize: moderateScale(14),
    fontFamily: fontFamily.regular,
    marginBottom: moderateScale(2),
  },
  subText: {
    color: colors.greyTextColor,
    fontSize: moderateScale(12),
    fontFamily: fontFamily.regular,
  },
});
