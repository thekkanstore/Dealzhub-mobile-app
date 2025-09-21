import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';

import TKHeader from '../../components/Common/TKHeader/TKHeader';
import {strings} from '../../utils/language/langauageUtils';
import {moderateScale} from '../../config/styles/responsiveSize';
import TKButton from '../../components/Common/TKButton/TKButton';
import {colors} from '../../config/styles/colors';
import {navigationStrings} from '../../navigation/navigationStrings';
import {useGetStoreDetails} from '../../react-queries/store/storeQueries';
import TKRenderIf from '../../components/Common/TKRenderIf/TKRenderIf';
import StoreDetailsCard from '../../components/Vendor/StoreDetailsCard/StoreDetailsCard';
import {VendorScreenNavigationProp} from '../../navigation/rootparamstypes';
import CategoryHeaderTabBar from '../../components/Vendor/CategoryHeaderTabBar/CategoryHeaderTabBar';
import {useGetCategoriesList} from '../../react-queries/categories/categoriesQuery';
import {CategoryListHeaderTabs} from '../../config/common/constants';

interface Props {
  navigation: VendorScreenNavigationProp;
}
const Vendor: React.FC<Props> = ({navigation}) => {
  const {data: storeDetails, isPending} = useGetStoreDetails();
  const {data: categoryList} = useGetCategoriesList();
  const handleAddStore = () => {
    navigation.navigate(navigationStrings.REGISTER_USER_STACK, {
      screen: navigationStrings.STORE_DETAILS,
      params: {isEdit: true},
    });
  };
  const renderHelpButton = () => {
    if (isPending || storeDetails) {
      return null;
    }
    return <TKButton title={strings('labels.addStore')} type="tertiary" onPress={handleAddStore} />;
  };

  const headerList = useMemo(() => {
    if (!categoryList) return [];
    const headerList =
      storeDetails?.categories
        ?.map(item => {
          const category = categoryList.find(cat => cat.id === item);
          return {
            id: category?.id,
            title: category?.name,
            key: category?.id,
          };
        })
        ?.filter(item => !!item) ?? [];
    return [
      {
        id: CategoryListHeaderTabs.ALL_PRODUCTS,
        title: strings('labels.allProducts'),
        key: 'all',
      },
      ...headerList,
    ];
  }, [categoryList, storeDetails]);

  return (
    <View style={style.container}>
      <TKHeader
        header={storeDetails?.storeName ?? strings('labels.storeDetails')}
        containerStyle={style.headerContainer}
        rightComponent={renderHelpButton()}
        showBackButton={false}
      />
      <TKRenderIf isRender={!!storeDetails && !!headerList?.length}>
        <StoreDetailsCard storeDetails={storeDetails!} navigation={navigation} />
        <CategoryHeaderTabBar headerTabItems={headerList} storeDetails={storeDetails} />
      </TKRenderIf>
    </View>
  );
};

export default Vendor;

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBackgroundColor,
  },
  headerContainer: {
    paddingHorizontal: moderateScale(20),
  },
  buttonContainer: {
    marginVertical: moderateScale(16),
    marginHorizontal: moderateScale(16),
    alignSelf: 'flex-start',
  },
});
