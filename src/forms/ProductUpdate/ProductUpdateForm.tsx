import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Formik, FormikProps } from 'formik';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { strings } from '../../utils/language/langauageUtils';
import TKSecondaryTextInput from '../../components/Common/TKSecondaryTextInput/TKSecondaryTextInput';
import TKButton from '../../components/Common/TKButton/TKButton';
import { shouldShowError } from '../../utils/common/errorUtils';
import { fontScale, moderateScale } from '../../config/styles/responsiveSize';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import TKDropdown from '../../components/Common/TKDropdown/TKDropdown';
import { useGetStoreDetails } from '../../react-queries/store/storeQueries';
import { productDetailsInitalValues } from '../../utils/initialValues/productDetailsInitalValues';
import { IProductFormValue } from '../../config/models/product';
import { productValidationsSchema } from '../../utils/validations/ProductDetailsValidation';
import TKFilePicker from '../../components/Common/TKFilePicker/TKFilePicker';
import TKRadioButton from '../../components/Common/TKRadioButton/TKRadioButton';
import { useGetCategoriesList } from '../../react-queries/categories/categoriesQuery';
import { ICategoryTable } from '../../config/models/category';
import SubCategoryInput from '../../components/Vendor/SubCategoryInput/SubCategoryInput';
import {
    deleteImageFromStorage,
    uploadFilePickerResult,
} from '../../services/firestore/imageUploadService';
import { useAddNewProduct, useUpdateProduct } from '../../react-queries/product/productQueries';
import { onlyDecimalNumbers } from '../../utils/common/numberUtils';
import { VendorStackParamList } from '../../navigation/rootparamstypes';
import { colors } from '../../config/styles/colors';
import { FilePickerResult } from '../../utils/filePicker';
import { showErrorToast } from '../../utils/common/toastUtils';
import { removeExtraWhitespace, toSnakeCase } from '../../utils/common/stringsUtils';
import {
    ALL_MEASUREMENT_UNITS,
    getCategoryMeasurementProfile,
    parseWeightOption,
} from '../../utils/measurement/measurementUtils';
import { TKCloseCircleIcon } from '../../components/Common/Icons/TKCircledCloseIcon';
import { fontFamily } from '../../config/styles/fontFamily';

const ProductUpdateForm = () => {
    const { mutate: createProduct, isPending: createProductLoader } = useAddNewProduct();
    const { mutate: updateProduct, isPending: updateProductLoader } = useUpdateProduct();
    const [isLoader, setIsLoader] = useState(false);
    const [deletedImageUri, setDeletedImageUri] = useState([]);
    const formRef = useRef<FormikProps<IProductFormValue>>(null);

    const { productDetails = null, isUpdate = false } =
        useRoute<RouteProp<VendorStackParamList, 'ProductUpdate'>>().params || {};

    const [showOverride, setShowOverride] = useState(
        Boolean(
            (productDetails?.weightOptions && productDetails.weightOptions.length > 0) ||
            (productDetails?.sizes && productDetails.sizes.length > 0)
        )
    );
    const [customSizeInput, setCustomSizeInput] = useState('');
    const [customWeightInput, setCustomWeightInput] = useState('');
    const [customWeightUnit, setCustomWeightUnit] = useState('g');

    const { data: storeDetails } = useGetStoreDetails();
    const { data: categoryList } = useGetCategoriesList();
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
            const { images, category, name, isOutOfStock, ...rest } = values;
            const finalOutOfStock = Boolean(isOutOfStock);
            const finalStatus = finalOutOfStock ? 'outofstock' : 'instock';
            const imagePath = `images/${toSnakeCase(values?.store?.id ?? '')}/${toSnakeCase(name ?? '')}`;
            const updatedImages = await Promise.all(
                images.map(item => {
                    return uploadFilePickerResult(item, imagePath);
                }),
            );
            const firstOptParsed = (values.weightOptions && values.weightOptions.length > 0)
                ? parseWeightOption(values.weightOptions[0])
                : null;
            const finalUnit = firstOptParsed?.unit || (values.unit || 'pcs');
            const finalUnitValue = firstOptParsed ? firstOptParsed.value : (parseFloat(String(values.unitValue)) || 1);

            createProduct(
                {
                    ...rest,
                    unit: finalUnit,
                    unitValue: finalUnitValue,
                    name: removeExtraWhitespace(name),
                    image: updatedImages[0]?.url ?? '', // need to remove this code in future versions
                    images: updatedImages.map(item => item.url ?? ''),
                    categoryId: category?.value?.id ?? '',
                    category: category?.value as any,
                    imagePath,
                    isOutOfStock: finalOutOfStock,
                    status: finalStatus,
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
            const { images, category, isOutOfStock, ...rest } = values;
            const finalOutOfStock = Boolean(isOutOfStock);
            const finalStatus = finalOutOfStock ? 'outofstock' : 'instock';
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

            const firstOptParsed = (values.weightOptions && values.weightOptions.length > 0)
                ? parseWeightOption(values.weightOptions[0])
                : null;
            const finalUnit = firstOptParsed?.unit || (values.unit || 'pcs');
            const finalUnitValue = firstOptParsed ? firstOptParsed.value : (parseFloat(String(values.unitValue)) || 1);

            updateProduct(
                {
                    ...rest,
                    unit: finalUnit,
                    unitValue: finalUnitValue,
                    id: productDetails?.id ?? '',
                    image: finalImages[0],
                    images: finalImages,
                    categoryId: category?.value?.id ?? '',
                    category: category?.value as any,
                    isOutOfStock: finalOutOfStock,
                    status: finalStatus,
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

    if (!isUpdate && storeDetails?.vendorStatus?.toLowerCase() === 'pending') {
        return (
            <View style={{flex: 1, backgroundColor: colors.primaryBackgroundColor}}>
                <TKHeader
                    header={strings('labels.addProduct')}
                    containerStyle={styles.headerContainerStyle}
                />
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold', color: colors.primaryTextColor, marginBottom: 10}}>
                        Store Pending Approval
                    </Text>
                    <Text style={{fontSize: 14, color: colors.secondaryTextColor, textAlign: 'center', marginBottom: 20}}>
                        Wait for approval to add product
                    </Text>
                    <TKButton title="Go Back" onPress={() => navigation.goBack()} type="primary" style={{width: '100%'}} />
                </View>
            </View>
        );
    }

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
                            <TKFilePicker
                                title={strings('labels.productImage')}
                                isRequired
                                values={values.images}
                                onFilesPicked={handleOnAddImage}
                                error={
                                    shouldShowError<IProductFormValue>(initialValues, 'images', touched, errors)
                                        ? (typeof errors.images === 'string' ? errors.images : undefined)
                                        : undefined
                                }
                                onDelete={handleOnDeleteImage}
                                allowMultiple={true}
                            />
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
                                onPress={data => {
                                    setFieldValue('category', data);
                                    setFieldValue('subcategoryIds', []);
                                    const nextCat = (data as any)?.value || data;
                                    const nextProfile = getCategoryMeasurementProfile(nextCat);
                                    if (!nextProfile.hasMeasurementOptions) {
                                        setFieldValue('unit', 'pcs');
                                        setFieldValue('unitValue', 1);
                                        setFieldValue('sizes', []);
                                        setFieldValue('weightOptions', []);
                                        setShowOverride(false);
                                    } else {
                                        if (!nextProfile.allowedUnits.includes(values.unit || 'pcs')) {
                                            setFieldValue('unit', nextProfile.defaultUnit || 'pcs');
                                        }
                                        if (nextProfile.defaultUnit && ['g', 'kg', 'ml', 'ltr', 'pack', 'pcs'].includes(nextProfile.defaultUnit)) {
                                            setCustomWeightUnit(nextProfile.defaultUnit);
                                        }
                                        if (!nextProfile.supportsSizes && !showOverride) {
                                            setFieldValue('sizes', []);
                                        }
                                        if (!nextProfile.allowWeightOptions && !showOverride) {
                                            setFieldValue('weightOptions', []);
                                        }
                                    }
                                }}
                                selectedItem={values.category as any}
                                error={touched.category && errors.category ? (typeof errors.category === 'string' ? errors.category : (errors.category as any)?.name || 'Category is required') : undefined}
                                placeholder={strings('placeholder.productCategory')}
                            />
                            {values.category?.value?.id && values.storeId && (
                                <SubCategoryInput
                                    storeId={values.storeId}
                                    categoryId={values.category.value.id}
                                    value={values.subcategoryIds || []}
                                    onChange={ids => setFieldValue('subcategoryIds', ids)}
                                />
                            )}

                            {/* Category-Driven Measurement & Sizing Section: Only renders if category supports measurements or owner enables override */}
                            {(() => {
                                const selectedCategoryObj = values.category?.value || values.category;
                                const hasCategorySelected = Boolean(
                                    selectedCategoryObj &&
                                        ((selectedCategoryObj as any).id || (selectedCategoryObj as any).name)
                                );
                                const categoryProfile = getCategoryMeasurementProfile(selectedCategoryObj);

                                // If no category selected yet, don't show anything (avoid clutter before picking category)
                                if (!hasCategorySelected) {
                                    return null;
                                }

                                const shouldShowCard = categoryProfile.hasMeasurementOptions || showOverride;

                                // If category does not need measurement options (e.g. Books, Furniture, Hardware, Pets) and override is off:
                                // show a clean minimal button just like web: "+ Add sizes or weight options (optional)"
                                if (!shouldShowCard) {
                                    return (
                                        <View style={styles.addOptionsTriggerRow}>
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => setShowOverride(true)}
                                                style={styles.addOptionsTriggerButton}>
                                                <Text style={styles.addOptionsTriggerText}>
                                                    + Add sizes or weight options (optional)
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                }

                                const showSizes = categoryProfile.supportsSizes || showOverride;
                                const showWeights =
                                    categoryProfile.allowWeightOptions ||
                                    categoryProfile.allowFractionalWeight ||
                                    showOverride;

                                const availableUnits = (showOverride
                                    ? ALL_MEASUREMENT_UNITS
                                    : ALL_MEASUREMENT_UNITS.filter(u =>
                                          categoryProfile.allowedUnits.includes(u.value),
                                      )
                                ).map(u => ({
                                    name: u.label,
                                    value: u.value,
                                }));
                                const unitListToUse =
                                    availableUnits.length > 0
                                        ? availableUnits
                                        : ALL_MEASUREMENT_UNITS.map(u => ({
                                              name: u.label,
                                              value: u.value,
                                          }));
                                const currentUnitItem =
                                    unitListToUse.find(u => u.value === (values.unit || 'pcs')) || {
                                        name: 'Pieces (pcs)',
                                        value: 'pcs',
                                    };

                                const cardTitle =
                                    categoryProfile.supportsSizes && !showWeights
                                        ? 'Product Sizes'
                                        : showWeights && !showSizes
                                        ? 'Product Weights & Portions'
                                        : 'Product Options & Variations';

                                const cardSubTitle =
                                    categoryProfile.supportsSizes && !showWeights
                                        ? 'Configure customer selectable sizes (S, M, L, XL)'
                                        : showWeights && !showSizes
                                        ? 'Configure package weights (250g, 500g, 1kg) and prices'
                                        : 'Configure options tailored to this product category';

                                return (
                                    <View style={styles.measurementSection}>
                                        <View style={styles.sectionHeaderRow}>
                                            <View style={styles.sectionTitleWrap}>
                                                <Text style={styles.sectionHeading}>
                                                    {cardTitle}
                                                </Text>
                                                <Text style={styles.sectionSubHeading}>
                                                    {cardSubTitle}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => {
                                                    const nextOverride = !showOverride;
                                                    setShowOverride(nextOverride);
                                                    if (!nextOverride && !categoryProfile.hasMeasurementOptions) {
                                                        setFieldValue('unit', 'pcs');
                                                        setFieldValue('unitValue', 1);
                                                        setFieldValue('sizes', []);
                                                        setFieldValue('weightOptions', []);
                                                    }
                                                }}
                                                style={styles.headerToggleBtn}>
                                                <Text style={styles.headerToggleBtnText}>
                                                    {showOverride ? 'Reset to defaults' : 'More options'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Advanced Override: Base Unit & Unit Value (only when showOverride is active) */}
                                        {showOverride && (
                                            <View style={styles.overrideUnitBox}>
                                                <Text style={styles.overrideUnitTitle}>
                                                    Base Pricing Unit (Advanced Override)
                                                </Text>
                                                <View style={styles.unitRow}>
                                                    <View style={{flex: 1.2}}>
                                                        <TKDropdown
                                                            label="Base Unit"
                                                            data={unitListToUse}
                                                            labelKey="name"
                                                            isVisible={false}
                                                            placeholder="Select Unit"
                                                            selectedItem={currentUnitItem}
                                                            onPress={item =>
                                                                setFieldValue('unit', (item as any).value)
                                                            }
                                                        />
                                                    </View>
                                                    <View style={{flex: 0.8}}>
                                                        <TKSecondaryTextInput
                                                            label="Unit Value"
                                                            placeholder="1"
                                                            value={String(values.unitValue ?? 1)}
                                                            onChangeText={v =>
                                                                setFieldValue(
                                                                    'unitValue',
                                                                    parseFloat(onlyDecimalNumbers(v)) || 1,
                                                                )
                                                            }
                                                            keyboardType="numeric"
                                                        />
                                                    </View>
                                                </View>
                                            </View>
                                        )}

                                        {/* Sizes Section (Apparel, Footwear, or Override) */}
                                        {showSizes && (
                                            <View style={styles.measurementBox}>
                                                <View style={styles.boxHeaderRow}>
                                                    <Text style={styles.measurementSubTitle}>
                                                        Available Sizes
                                                    </Text>
                                                    <Text style={styles.measurementHint}>
                                                        Standard sizes for apparel and footwear
                                                    </Text>
                                                </View>

                                                {/* Presets */}
                                                {categoryProfile.presetSizes &&
                                                    categoryProfile.presetSizes.length > 0 && (
                                                        <View style={styles.presetChipsWrap}>
                                                            {categoryProfile.presetSizes.map(
                                                                preset => {
                                                                    const isSelected = (
                                                                        values.sizes || []
                                                                    ).includes(preset);
                                                                    return (
                                                                        <TouchableOpacity
                                                                            key={preset}
                                                                            activeOpacity={0.7}
                                                                            style={[
                                                                                styles.presetChip,
                                                                                isSelected &&
                                                                                    styles.presetChipSelected,
                                                                            ]}
                                                                            onPress={() => {
                                                                                const current =
                                                                                    values.sizes ||
                                                                                    [];
                                                                                const next = isSelected
                                                                                    ? current.filter(
                                                                                          s =>
                                                                                              s !==
                                                                                              preset,
                                                                                      )
                                                                                    : [
                                                                                          ...current,
                                                                                          preset,
                                                                                      ];
                                                                                setFieldValue(
                                                                                    'sizes',
                                                                                    next,
                                                                                );
                                                                            }}>
                                                                            <Text
                                                                                style={[
                                                                                    styles.presetChipText,
                                                                                    isSelected &&
                                                                                        styles.presetChipTextSelected,
                                                                                ]}>
                                                                                {preset}
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    );
                                                                },
                                                            )}
                                                        </View>
                                                    )}

                                                {/* Custom size input */}
                                                <View style={styles.inputAndButtonRow}>
                                                    <TKSecondaryTextInput
                                                        placeholder="Type size (e.g. 32, UK 8, Free Size)"
                                                        value={customSizeInput}
                                                        onChangeText={setCustomSizeInput}
                                                        wrapperStyle={styles.flexInputWrapper}
                                                        containerStyle={styles.flexInputContainer}
                                                    />
                                                    <TouchableOpacity
                                                        style={styles.actionAddButton}
                                                        activeOpacity={0.8}
                                                        onPress={() => {
                                                            const trimmed = customSizeInput.trim();
                                                            if (
                                                                trimmed &&
                                                                !(values.sizes || []).includes(
                                                                    trimmed,
                                                                )
                                                            ) {
                                                                setFieldValue('sizes', [
                                                                    ...(values.sizes || []),
                                                                    trimmed,
                                                                ]);
                                                                setCustomSizeInput('');
                                                            }
                                                        }}>
                                                        <Text style={styles.actionAddButtonText}>
                                                            + Add
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>

                                                {/* Selected size chips */}
                                                {(values.sizes || []).length > 0 && (
                                                    <View style={styles.selectedSection}>
                                                        <Text style={styles.selectedLabel}>
                                                            Added sizes:
                                                        </Text>
                                                        <View style={styles.selectedChipsWrap}>
                                                            {(values.sizes || []).map(
                                                                (s: string) => (
                                                                    <View
                                                                        key={s}
                                                                        style={
                                                                            styles.selectedChip
                                                                        }>
                                                                        <Text
                                                                            style={
                                                                                styles.selectedChipText
                                                                            }>
                                                                            {s}
                                                                        </Text>
                                                                        <TouchableOpacity
                                                                            onPress={() =>
                                                                                setFieldValue(
                                                                                    'sizes',
                                                                                    (
                                                                                        values.sizes ||
                                                                                        []
                                                                                    ).filter(
                                                                                        item =>
                                                                                            item !==
                                                                                            s,
                                                                                    ),
                                                                                )
                                                                            }
                                                                            hitSlop={{
                                                                                top: 8,
                                                                                bottom: 8,
                                                                                left: 8,
                                                                                right: 8,
                                                                            }}>
                                                                            <TKCloseCircleIcon
                                                                                width={16}
                                                                                height={16}
                                                                                color={
                                                                                    colors.primaryButtonBackgroundColor
                                                                                }
                                                                            />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                ),
                                                            )}
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        )}

                                        {/* Weights & Packages Section (Grocery, Food, Spices, Liquids, or Override) */}
                                        {showWeights && (
                                            <View style={styles.measurementBox}>
                                                <View style={styles.boxHeaderRow}>
                                                    <Text style={styles.measurementSubTitle}>
                                                        Available Weights & Packages
                                                    </Text>
                                                    <Text style={styles.measurementHint}>
                                                        Portions for grocery, liquids, spices, and produce
                                                    </Text>
                                                </View>

                                                {/* Quick add suggestion pills */}
                                                <View style={styles.suggestionSection}>
                                                    <Text style={styles.suggestionLabel}>
                                                        Quick presets:
                                                    </Text>
                                                    <View style={styles.suggestionWrap}>
                                                        {(
                                                            categoryProfile.suggestedWeights ||
                                                            (['kg', 'g'].includes(
                                                                values.unit || '',
                                                            )
                                                                ? [
                                                                      '50g',
                                                                      '100g',
                                                                      '250g',
                                                                      '500g',
                                                                      '1kg',
                                                                      '2kg',
                                                                  ]
                                                                : [
                                                                      '100ml',
                                                                      '250ml',
                                                                      '500ml',
                                                                      '1L',
                                                                      '2L',
                                                                  ])
                                                        ).map(sugg => (
                                                            <TouchableOpacity
                                                                key={sugg}
                                                                activeOpacity={0.7}
                                                                style={styles.suggestionChip}
                                                                onPress={() => {
                                                                    const parsed =
                                                                        parseWeightOption(
                                                                            sugg,
                                                                            customWeightUnit ||
                                                                                values.unit ||
                                                                                'g',
                                                                        );
                                                                    const label =
                                                                        parsed?.label || sugg;
                                                                    const cur =
                                                                        values.weightOptions || [];
                                                                    if (!cur.includes(label)) {
                                                                        const next = [
                                                                            ...cur,
                                                                            label,
                                                                        ];
                                                                        setFieldValue(
                                                                            'weightOptions',
                                                                            next,
                                                                        );
                                                                        if (
                                                                            next.length === 1 &&
                                                                            parsed
                                                                        ) {
                                                                            setFieldValue(
                                                                                'unitValue',
                                                                                parsed.value,
                                                                            );
                                                                            if (parsed.unit)
                                                                                setFieldValue(
                                                                                    'unit',
                                                                                    parsed.unit,
                                                                                );
                                                                        }
                                                                    }
                                                                }}>
                                                                <Text
                                                                    style={
                                                                        styles.suggestionChipText
                                                                    }>
                                                                    + {sugg}
                                                                </Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                </View>

                                                {/* Custom Weight Creator Card */}
                                                <View style={styles.customWeightCard}>
                                                    <Text style={styles.customWeightCardLabel}>
                                                        Add Custom Weight / Package
                                                    </Text>

                                                    {/* Input + Add button row */}
                                                    <View style={styles.inputAndButtonRow}>
                                                        <TKSecondaryTextInput
                                                            placeholder="Amount (e.g. 250, 500, 1.5)"
                                                            value={customWeightInput}
                                                            onChangeText={setCustomWeightInput}
                                                            keyboardType="numeric"
                                                            wrapperStyle={styles.flexInputWrapper}
                                                            containerStyle={
                                                                styles.flexInputContainer
                                                            }
                                                        />
                                                        <TouchableOpacity
                                                            style={styles.actionAddButton}
                                                            activeOpacity={0.8}
                                                            onPress={() => {
                                                                const raw =
                                                                    customWeightInput.trim();
                                                                if (!raw) return;
                                                                const parsed = parseWeightOption(
                                                                    raw,
                                                                    customWeightUnit ||
                                                                        values.unit ||
                                                                        'g',
                                                                );
                                                                const label =
                                                                    parsed?.label ||
                                                                    `${raw}${customWeightUnit}`;
                                                                const cur =
                                                                    values.weightOptions || [];
                                                                if (!cur.includes(label)) {
                                                                    const next = [
                                                                        ...cur,
                                                                        label,
                                                                    ];
                                                                    setFieldValue(
                                                                        'weightOptions',
                                                                        next,
                                                                    );
                                                                    setCustomWeightInput('');
                                                                    if (
                                                                        next.length === 1 &&
                                                                        parsed
                                                                    ) {
                                                                        setFieldValue(
                                                                            'unitValue',
                                                                            parsed.value,
                                                                        );
                                                                        if (parsed.unit)
                                                                            setFieldValue(
                                                                                'unit',
                                                                                parsed.unit,
                                                                            );
                                                                    }
                                                                }
                                                            }}>
                                                            <Text
                                                                style={
                                                                    styles.actionAddButtonText
                                                                }>
                                                                + Add
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>

                                                    {/* Unit selector pill row */}
                                                    <View style={styles.unitSelectorRow}>
                                                        <Text style={styles.unitSelectorLabel}>
                                                            Unit:
                                                        </Text>
                                                        <View style={styles.unitPillsWrap}>
                                                            {[
                                                                'g',
                                                                'kg',
                                                                'ml',
                                                                'ltr',
                                                                'pack',
                                                                'pcs',
                                                            ].map(u => {
                                                                const isSelected =
                                                                    customWeightUnit === u;
                                                                return (
                                                                    <TouchableOpacity
                                                                        key={u}
                                                                        activeOpacity={0.7}
                                                                        style={[
                                                                            styles.unitPill,
                                                                            isSelected &&
                                                                                styles.unitPillSelected,
                                                                        ]}
                                                                        onPress={() =>
                                                                            setCustomWeightUnit(u)
                                                                        }>
                                                                        <Text
                                                                            style={[
                                                                                styles.unitPillText,
                                                                                isSelected &&
                                                                                    styles.unitPillTextSelected,
                                                                            ]}>
                                                                            {u}
                                                                        </Text>
                                                                    </TouchableOpacity>
                                                                );
                                                            })}
                                                        </View>
                                                    </View>
                                                </View>

                                                {/* Selected weight chips */}
                                                {(values.weightOptions || []).length > 0 && (
                                                    <View style={styles.selectedSection}>
                                                        <Text style={styles.selectedLabel}>
                                                            Added package variations ({values.weightOptions?.length || 0}):
                                                        </Text>
                                                        <View style={styles.selectedChipsWrap}>
                                                            {(values.weightOptions || []).map(
                                                                (opt: string) => (
                                                                    <View
                                                                        key={opt}
                                                                        style={
                                                                            styles.selectedChip
                                                                        }>
                                                                        <Text
                                                                            style={
                                                                                styles.selectedChipText
                                                                            }>
                                                                            {opt}
                                                                        </Text>
                                                                        <TouchableOpacity
                                                                            onPress={() =>
                                                                                setFieldValue(
                                                                                    'weightOptions',
                                                                                    (
                                                                                        values.weightOptions ||
                                                                                        []
                                                                                    ).filter(
                                                                                        item =>
                                                                                            item !==
                                                                                            opt,
                                                                                    ),
                                                                                )
                                                                            }
                                                                            hitSlop={{
                                                                                top: 8,
                                                                                bottom: 8,
                                                                                left: 8,
                                                                                right: 8,
                                                                            }}>
                                                                            <TKCloseCircleIcon
                                                                                width={16}
                                                                                height={16}
                                                                                color={
                                                                                    colors.primaryButtonBackgroundColor
                                                                                }
                                                                            />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                ),
                                                            )}
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                );
                            })()}

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
                                        onSelect={data => {
                                            const nextVal = !data;
                                            setFieldValue('isOutOfStock', nextVal);
                                            setFieldValue('status', nextVal ? 'outofstock' : 'instock');
                                        }}
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
                            <View style={{
                                height: 70
                            }} />
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
        marginTop: moderateScale(10),
    },
    radioButtonGroup: {
        flexDirection: 'row',
        gap: moderateScale(20),
    },
    measurementSection: {
        marginTop: moderateScale(16),
        marginBottom: moderateScale(12),
        padding: moderateScale(16),
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(12),
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    addOptionsTriggerRow: {
        alignItems: 'flex-end',
        marginTop: moderateScale(6),
        marginBottom: moderateScale(12),
    },
    addOptionsTriggerButton: {
        paddingVertical: moderateScale(6),
        paddingHorizontal: moderateScale(10),
        backgroundColor: '#F0FDF4',
        borderRadius: moderateScale(6),
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    addOptionsTriggerText: {
        fontSize: fontScale(12),
        fontFamily: fontFamily.semiBold,
        color: '#15803D',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: moderateScale(12),
        paddingBottom: moderateScale(8),
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    sectionTitleWrap: {
        flex: 1,
        paddingRight: moderateScale(8),
    },
    headerToggleBtn: {
        paddingVertical: moderateScale(4),
        paddingHorizontal: moderateScale(8),
        backgroundColor: '#F1F5F9',
        borderRadius: moderateScale(6),
    },
    headerToggleBtnText: {
        fontSize: fontScale(12),
        fontFamily: fontFamily.semiBold,
        color: colors.primaryButtonBackgroundColor,
    },
    overrideUnitBox: {
        marginBottom: moderateScale(12),
        padding: moderateScale(10),
        backgroundColor: '#F8FAFC',
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    overrideUnitTitle: {
        fontSize: fontScale(11),
        fontFamily: fontFamily.semiBold,
        color: '#475569',
        marginBottom: moderateScale(8),
    },
    sectionHeading: {
        fontSize: fontScale(16),
        fontFamily: fontFamily.bold,
        color: colors.primaryTextColor,
        marginBottom: moderateScale(2),
    },
    sectionSubHeading: {
        fontSize: fontScale(12),
        fontFamily: fontFamily.regular,
        color: '#64748B',
    },
    unitRow: {
        flexDirection: 'row',
        gap: moderateScale(12),
        alignItems: 'flex-start',
        marginBottom: moderateScale(4),
    },
    measurementBox: {
        marginTop: moderateScale(14),
        paddingTop: moderateScale(14),
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    boxHeaderRow: {
        marginBottom: moderateScale(10),
    },
    measurementSubTitle: {
        fontSize: fontScale(13),
        fontFamily: fontFamily.semiBold,
        color: '#1E293B',
        marginBottom: moderateScale(2),
    },
    measurementHint: {
        fontSize: fontScale(11),
        fontFamily: fontFamily.regular,
        color: '#64748B',
    },
    presetChipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: moderateScale(6),
        alignItems: 'center',
        marginBottom: moderateScale(10),
    },
    presetChip: {
        paddingHorizontal: moderateScale(12),
        paddingVertical: moderateScale(7),
        borderRadius: moderateScale(8),
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    presetChipSelected: {
        backgroundColor: colors.primaryButtonBackgroundColor,
        borderColor: colors.primaryButtonBackgroundColor,
    },
    presetChipText: {
        fontSize: fontScale(12),
        fontFamily: fontFamily.medium,
        color: colors.primaryTextColor,
    },
    presetChipTextSelected: {
        color: '#FFFFFF',
        fontFamily: fontFamily.bold,
    },
    inputAndButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(10),
        marginTop: moderateScale(6),
    },
    flexInputWrapper: {
        flex: 1,
        marginBottom: 0,
    },
    flexInputContainer: {
        height: moderateScale(48),
        marginBottom: 0,
    },
    actionAddButton: {
        height: moderateScale(48),
        paddingHorizontal: moderateScale(18),
        backgroundColor: colors.primaryButtonBackgroundColor,
        borderRadius: moderateScale(8),
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionAddButtonText: {
        fontSize: fontScale(13),
        fontFamily: fontFamily.semiBold,
        color: '#FFFFFF',
    },
    suggestionSection: {
        marginBottom: moderateScale(12),
    },
    suggestionLabel: {
        fontSize: fontScale(11),
        fontFamily: fontFamily.semiBold,
        color: '#475569',
        marginBottom: moderateScale(6),
    },
    suggestionWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: moderateScale(6),
        alignItems: 'center',
    },
    suggestionChip: {
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(6),
        backgroundColor: '#F1F5F9',
        borderRadius: moderateScale(6),
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    suggestionChipText: {
        fontSize: fontScale(11),
        fontFamily: fontFamily.medium,
        color: '#334155',
    },
    customWeightCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: moderateScale(10),
        padding: moderateScale(12),
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginTop: moderateScale(6),
    },
    customWeightCardLabel: {
        fontSize: fontScale(12),
        fontFamily: fontFamily.semiBold,
        color: '#1E293B',
        marginBottom: moderateScale(4),
    },
    unitSelectorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(8),
        marginTop: moderateScale(10),
    },
    unitSelectorLabel: {
        fontSize: fontScale(12),
        fontFamily: fontFamily.semiBold,
        color: '#475569',
    },
    unitPillsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: moderateScale(6),
        flex: 1,
    },
    unitPill: {
        paddingHorizontal: moderateScale(9),
        paddingVertical: moderateScale(5),
        borderRadius: moderateScale(6),
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    unitPillSelected: {
        backgroundColor: colors.primaryButtonBackgroundColor,
        borderColor: colors.primaryButtonBackgroundColor,
    },
    unitPillText: {
        fontSize: fontScale(11),
        fontFamily: fontFamily.medium,
        color: colors.primaryTextColor,
    },
    unitPillTextSelected: {
        color: '#FFFFFF',
        fontFamily: fontFamily.bold,
    },
    selectedSection: {
        marginTop: moderateScale(12),
    },
    selectedLabel: {
        fontSize: fontScale(11),
        fontFamily: fontFamily.semiBold,
        color: '#475569',
        marginBottom: moderateScale(6),
    },
    selectedChipsWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: moderateScale(8),
    },
    selectedChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: moderateScale(10),
        paddingVertical: moderateScale(6),
        backgroundColor: '#F0FDF4',
        borderRadius: moderateScale(8),
        borderWidth: 1,
        borderColor: '#BBF7D0',
        gap: moderateScale(6),
    },
    selectedChipText: {
        fontSize: fontScale(12),
        fontFamily: fontFamily.semiBold,
        color: '#15803D',
    },
    overrideToggleRow: {
        marginTop: moderateScale(16),
        paddingTop: moderateScale(12),
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
});
