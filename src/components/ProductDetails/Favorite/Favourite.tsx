import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {TKHeartIcon} from '../../Common/Icons/TKHeartIcon';
import {useUpdateFavoritesList} from '../../../react-queries/user/userQueries';
import {colors} from '../../../config/styles/colors';
import {Pressable} from 'react-native-gesture-handler';

interface Props {
  containerStyle?: StyleProp<ViewStyle>;
  productId: string;
  iconColor?: string;
  isFavorite: boolean;
}
const Favorite: React.FC<Props> = ({containerStyle, productId, isFavorite}) => {
  const {mutate: updateFavoriteStatus, isPending} = useUpdateFavoritesList();
  const handleOnPress = () => {
    updateFavoriteStatus({id: productId, updateStatus: !isFavorite ? 'add' : 'remove'});
  };
  return (
    <Pressable
      style={[containerStyle]}
      onPress={handleOnPress}
      disabled={isPending}
      hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
      <TKHeartIcon
        color={isFavorite ? colors.favoritesSelectedColor : colors.favoriteUnselectedColor}
      />
    </Pressable>
  );
};

export default Favorite;
