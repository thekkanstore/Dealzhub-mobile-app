import React, {useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Formik} from 'formik';
import {useNavigation} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {strings} from '../../utils/language/langauageUtils';
import TKSecondaryTextInput from '../../components/Common/TKSecondaryTextInput/TKSecondaryTextInput';
import TKButton from '../../components/Common/TKButton/TKButton';
import {shouldShowError} from '../../utils/common/errorUtils';
import {moderateScale} from '../../config/styles/responsiveSize';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import TKDropdown from '../../components/Common/TKDropdown/TKDropdown';
import {useGetStoreDetails} from '../../react-queries/store/storeQueries';
import {productDetailsInitalValues} from '../../utils/initialValues/productDetailsInitalValues';
import {IProductFormValue} from '../../config/models/product';
import {productValidationsSchema} from '../../utils/validations/ProductDetailsValidation';
import TKFilePicker from '../../components/Common/TKFilePicker/TKFilePicker';
import TKRadioButton from '../../components/Common/TKRadioButton/TKRadioButton';
import {useGetCategoriesList} from '../../react-queries/categories/categoriesQuery';
import {ICategoryTable} from '../../config/models/category';
import {uploadFilePickerResult} from '../../services/firestore/imageUploadService';
import {useAddNewProduct} from '../../react-queries/product/productQueries';
import {onlyDecimalNumbers} from '../../utils/common/numberUtils';

const ProductUpdateForm = () => {
  // const {mutate: createStore, isPending: createStoreLoader} = useCreateNewUserStore();
  // const {mutate: updateStore, isPending: updateStoreLoader} = useUpdateUserStore();
  const {mutate: createProduct, isPending: createProductLoader} = useAddNewProduct();
  const [isLoader, setIsLoader] = useState(false);

  const {data: storeDetails} = useGetStoreDetails();
  const {data: categoryList} = useGetCategoriesList();
  const categoryDropDownList = useMemo(() => {
    return categoryList?.map((item: ICategoryTable) => {
      return {
        name: item.name,
        value: item.id,
      };
    });
  }, [categoryList]);
  const navigation = useNavigation();
  const initialValues: IProductFormValue = useMemo(() => {
    return productDetailsInitalValues(storeDetails);
  }, [storeDetails]);

  const handleSubmit = async (values: IProductFormValue) => {
    setIsLoader(true);
    const {image, category, ...rest} = values;
    const updatedImage = await uploadFilePickerResult(image);
    createProduct(
      {...rest, image: updatedImage.url ?? '', categoryId: category.value},
      {
        onSuccess: () => {
          navigation.goBack();
        },
      },
    );
    setIsLoader(false);
  };
  return (
    <>
      <TKHeader header={strings('labels.addProduct')} />
      <Formik<IProductFormValue>
        initialValues={initialValues}
        validationSchema={productValidationsSchema}
        onSubmit={handleSubmit}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isValid,
          dirty,
          setFieldValue,
        }) => (
          <View style={styles.container}>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps={'handled'}
              bounces={false}
              contentContainerStyle={styles.contentContainerStyle}>
              <TKSecondaryTextInput
                label={strings('labels.productName')}
                isRequired
                value={values.name}
                onChangeText={data => handleChange('name')(data)}
                onBlur={handleBlur('name')}
                error={
                  shouldShowError<IProductFormValue>(initialValues, 'name', touched, errors)
                    ? errors.name
                    : undefined
                }
                placeholder={strings('placeholder.productName')}
              />
              <TKSecondaryTextInput
                label={strings('labels.productDescription')}
                isRequired
                value={values.description}
                onChangeText={data => handleChange('description')(data)}
                onBlur={handleBlur('description')}
                error={
                  shouldShowError<IProductFormValue>(initialValues, 'description', touched, errors)
                    ? errors.description
                    : undefined
                }
                placeholder={strings('placeholder.productDescription')}
                containerStyle={styles.addressInputStyle}
              />
              <TKSecondaryTextInput
                label={strings('labels.actualPrice')}
                isRequired
                value={values.actualPrice}
                onChangeText={data => handleChange('actualPrice')(onlyDecimalNumbers(data))}
                onBlur={handleBlur('actualPrice')}
                error={
                  shouldShowError<IProductFormValue>(initialValues, 'actualPrice', touched, errors)
                    ? errors.actualPrice
                    : undefined
                }
                placeholder={strings('placeholder.actualPrice')}
              />
              <TKSecondaryTextInput
                label={strings('labels.discountPrice')}
                isRequired
                value={values.discountPrice}
                onChangeText={data => handleChange('discountPrice')(onlyDecimalNumbers(data))}
                onBlur={handleBlur('discountPrice')}
                error={
                  shouldShowError<IProductFormValue>(
                    initialValues,
                    'discountPrice',
                    touched,
                    errors,
                  )
                    ? errors.discountPrice
                    : undefined
                }
                placeholder={strings('placeholder.discountPrice')}
              />
              <TKDropdown
                label={strings('labels.productCategory')}
                isRequired
                data={categoryDropDownList || []}
                labelKey={'name'}
                isVisible={false}
                onPress={data => setFieldValue('category', data)}
                selectedItem={values.category as any}
                error={touched.category && errors.category ? errors.category : undefined}
                placeholder={strings('placeholder.productCategory')}
              />
              <TKFilePicker
                title={strings('labels.productImage')}
                isRequired
                value={values.image}
                onFilePicked={data => setFieldValue('image', data)}
                error={
                  shouldShowError<IProductFormValue>(initialValues, 'image', touched, errors)
                    ? errors.image
                    : undefined
                }
              />
              <View>
                <TKRadioButton
                  value={values.isSecondHand}
                  buttonName={strings('labels.isSecondHand')}
                  onSelect={data => setFieldValue('isSecondHand', !data)}
                  isSelected={values.isSecondHand}
                />
              </View>
            </KeyboardAwareScrollView>

            <TKButton
              title={strings('button.continue')}
              onPress={() => handleSubmit()}
              isLoading={createProductLoader || isLoader}
              isDisabled={!isValid || !dirty}
            />
          </View>
        )}
      </Formik>
    </>
  );
};

export default ProductUpdateForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
  },
  addressInputStyle: {
    height: 100,
    alignItems: 'flex-start',
  },
  contentContainerStyle: {
    marginBottom: moderateScale(10),
  },
});
