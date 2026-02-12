import React, {useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Formik, FormikProps} from 'formik';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
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
import {
  deleteImageFromStorage,
  uploadFilePickerResult,
} from '../../services/firestore/imageUploadService';
import {useAddNewProduct, useUpdateProduct} from '../../react-queries/product/productQueries';
import {onlyDecimalNumbers} from '../../utils/common/numberUtils';
import {VendorStackParamList} from '../../navigation/rootparamstypes';
import {colors} from '../../config/styles/colors';
import {FilePickerResult} from '../../utils/filePicker';
import {showErrorToast} from '../../utils/common/toastUtils';
import {removeExtraWhitespace, toSnakeCase} from '../../utils/common/stringsUtils';

const ProductUpdateForm = () => {
  const {mutate: createProduct, isPending: createProductLoader} = useAddNewProduct();
  const {mutate: updateProduct, isPending: updateProductLoader} = useUpdateProduct();
  const [isLoader, setIsLoader] = useState(false);
  const [deletedImageUri, setDeletedImageUri] = useState([]);
  const formRef = useRef<FormikProps<IProductFormValue>>(null);

  const {productDetails = null, isUpdate = false} =
    useRoute<RouteProp<VendorStackParamList, 'ProductUpdate'>>().params || {};

  const {data: storeDetails} = useGetStoreDetails();
  const {data: categoryList} = useGetCategoriesList();
  const categoryDropDownList = useMemo(() => {
    return categoryList?.map((item: ICategoryTable) => {
      return {
        name: item.name,
        value: item,
      };
    });
  }, [categoryList]);
  const navigation = useNavigation();
  const initialValues: IProductFormValue = useMemo(() => {
    return productDetailsInitalValues(storeDetails, productDetails);
  }, [storeDetails, productDetails]);

  const handleOnDeleteImage = (index = 0) => {
    formRef.current?.setFieldValue(
      'images',
      formRef.current?.values.images.filter((item, i) => i !== index) ?? [],
    );
    if (isUpdate && formRef.current?.values.images[index]?.apiUri)
      setDeletedImageUri(
        prev => [...prev, formRef.current?.values.images[index]?.apiUri] as never[],
      );
  };

  const handleOnAddImage = (newImages: FilePickerResult[]) => {
    formRef.current?.setFieldValue('images', [
      ...(formRef.current?.values.images ?? []),
      ...newImages,
    ]);
  };

  const handleSubmit = async (values: IProductFormValue) => {
    try {
      setIsLoader(true);
      if (isUpdate) {
        await handleUpdate(values);
        return;
      }
      const {images, category, name, ...rest} = values;
      const imagePath = `images/${toSnakeCase(values?.store?.id ?? '')}/${toSnakeCase(name ?? '')}`;
      const updatedImages = await Promise.all(
        images.map(item => {
          return uploadFilePickerResult(item, imagePath);
        }),
      );
      createProduct(
        {
          ...rest,
          name: removeExtraWhitespace(name),
          image: updatedImages[0]?.url ?? '', // need to remove this code in future versions
          images: updatedImages.map(item => item.url ?? ''),
          categoryId: category.value?.id,
          category: category.value,
          imagePath,
        },
        {
          onSuccess: () => {
            navigation.goBack();
          },
        },
      );
    } catch (error) {
      showErrorToast('Error while creating product');
    } finally {
      setIsLoader(false);
    }
  };
  useEffect(() => {
    if (categoryDropDownList && productDetails?.categoryId) {
      formRef.current?.setFieldValue(
        'category',
        categoryDropDownList.find(item => item.value?.id === productDetails?.categoryId),
      );
    }
  }, [categoryDropDownList, productDetails?.categoryId]);

  const handleUpdate = async (values: IProductFormValue) => {
    let updatedImages: string[] = [];
    try {
      const {images, category, ...rest} = values;
      let finalImages = images.filter(item => item.apiUri).map(item => item.apiUri);
      const newImages = images.filter(item => !item.apiUri);

      if (newImages.length) {
        if (newImages.length) {
          updatedImages = (
            await Promise.all(
              newImages.map(item => {
                return uploadFilePickerResult(item, values?.imagePath ?? '');
              }),
            )
          )?.map(item => item?.url ?? '');
          finalImages = [...updatedImages, ...finalImages];
        }
      }
      updateProduct(
        {
          ...rest,
          id: productDetails?.id ?? '',
          image: finalImages[0],
          images: finalImages,
          categoryId: category.value?.id,
          category: category.value,
        },
        {
          onSuccess: async () => {
            console.log('finalImages', deletedImageUri);
            if (deletedImageUri.length) {
              await Promise.all(deletedImageUri.map(item => deleteImageFromStorage(item)));
            }
            navigation.goBack();
          },
        },
      );
    } catch (error) {
      showErrorToast('Error while updating product');
      if (updatedImages?.length) {
        updatedImages.forEach(item => deleteImageFromStorage(item));
      }
    } finally {
      // Loader state is controlled in the parent handleSubmit for update flow
    }
  };

  return (
    <>
      <TKHeader
        header={isUpdate ? strings('labels.updateProduct') : strings('labels.addProduct')}
        containerStyle={styles.headerContainerStyle}
      />
      <Formik<IProductFormValue>
        initialValues={initialValues}
        validationSchema={productValidationsSchema}
        onSubmit={handleSubmit}
        innerRef={formRef}>
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
                values={values.images}
                onFilesPicked={handleOnAddImage}
                error={
                  shouldShowError<IProductFormValue>(initialValues, 'images', touched, errors)
                    ? errors.images
                    : undefined
                }
                onDelete={handleOnDeleteImage}
                allowMultiple={true}
              />
              <View style={styles.radioButtonContainer}>
                <View style={styles.radioButtonGroup}>
                  <TKRadioButton
                    value={values.isSoldOut}
                    buttonName={strings('labels.isSoldOut')}
                    onSelect={data => setFieldValue('isSoldOut', !data)}
                    isSelected={values.isSoldOut}
                  />
                  <TKRadioButton
                    value={values.isOutOfStock}
                    buttonName={strings('labels.isOutOfStock')}
                    onSelect={data => setFieldValue('isOutOfStock', !data)}
                    isSelected={values.isOutOfStock}
                  />
                </View>
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
              isLoading={createProductLoader || isLoader || updateProductLoader}
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
    backgroundColor: colors.primaryBackgroundColor,
  },
  headerContainerStyle: {
    paddingHorizontal: moderateScale(16),
  },
  addressInputStyle: {
    height: 100,
    alignItems: 'flex-start',
  },
  contentContainerStyle: {
    marginBottom: moderateScale(10),
  },
  radioButtonContainer: {
    gap: moderateScale(20),
  },
  radioButtonGroup: {
    flexDirection: 'row',
    gap: moderateScale(20),
  },
});
