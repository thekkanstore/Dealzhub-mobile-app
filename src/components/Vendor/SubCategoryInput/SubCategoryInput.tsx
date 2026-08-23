import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  useGetSubCategories,
  useCreateSubCategory,
  useUpdateSubCategory,
  useDeleteSubCategory,
} from '../../../react-queries/categories/subcategoryQuery';
import TKSecondaryTextInput from '../../Common/TKSecondaryTextInput/TKSecondaryTextInput';
import {colors} from '../../../config/styles/colors';
import {fontScale, moderateScale, verticalScale} from '../../../config/styles/responsiveSize';
import {fontFamily} from '../../../config/styles/fontFamily';
import {strings} from '../../../utils/language/langauageUtils';
import {showErrorToast} from '../../../utils/common/toastUtils';
import {ISubCategory} from '../../../config/models/subcategory';
import {TKTrashIcon} from '../../Common/Icons/TKTrashIcon';

// Plus (+) Icon component
const PlusIcon = ({color = colors.primaryButtonBackgroundColor}) => (
  <View style={styles.iconWrapper}>
    <Text style={[styles.plusText, {color}]}>+</Text>
  </View>
);

// Close (X) Icon component
const CloseIcon = ({color = colors.greyTextColor}) => (
  <View style={styles.closeIconWrapper}>
    <Text style={[styles.closeText, {color}]}>×</Text>
  </View>
);

// Edit Pencil Icon SVG
const EditIcon = ({color = '#8B8A8A'}) => (
  <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} style={{padding: 4}}>
    <Text style={{fontSize: fontScale(14), color}}>✎</Text>
  </TouchableOpacity>
);

// Checkmark Icon (Save)
const CheckIcon = ({color = colors.primaryButtonBackgroundColor}) => (
  <Text style={{fontSize: fontScale(16), fontWeight: 'bold', color}}>✓</Text>
);

// Cross Icon (Cancel)
const CrossIcon = ({color = colors.errorTextColor}) => (
  <Text style={{fontSize: fontScale(16), fontWeight: 'bold', color}}>✗</Text>
);

interface SubCategoryInputProps {
  storeId: string;
  categoryId: string;
  value: string[]; // subcategoryIds
  onChange: (ids: string[]) => void;
  error?: string;
}

const SubCategoryInput: React.FC<SubCategoryInputProps> = ({
  storeId,
  categoryId,
  value = [],
  onChange,
  error,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Queries & Mutations
  const {data: subCategories = [], isLoading} = useGetSubCategories(storeId, categoryId);
  const {mutateAsync: createSubCategoryMutate, isPending: isCreating} = useCreateSubCategory();
  const {mutateAsync: updateSubCategoryMutate} = useUpdateSubCategory();
  const {mutateAsync: deleteSubCategoryMutate} = useDeleteSubCategory();

  // Filtered suggestions based on search text (not already selected)
  const filteredSuggestions = useMemo(() => {
    return subCategories.filter(sub =>
      sub.name.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [subCategories, inputValue]);

  // Map subcategory ID to name
  const getSubCategoryName = (id: string) => {
    const sub = subCategories.find(item => item.id === id);
    return sub ? sub.name : '...';
  };

  const handleAdd = async () => {
    if (!inputValue.trim()) return;
    const name = inputValue.trim();

    // Check if it already exists in the fetched list
    const existing = subCategories.find(
      sub => sub.name.toLowerCase() === name.toLowerCase()
    );

    if (existing) {
      if (value.includes(existing.id)) {
        showErrorToast(strings('validations.subCategoryExists'));
      } else {
        onChange([...value, existing.id]);
      }
      setInputValue('');
      return;
    }

    try {
      const newSub = await createSubCategoryMutate({name, storeId, categoryId});
      onChange([...value, newSub.id]);
      setInputValue('');
    } catch (err: any) {
      if (err.message === 'subCategoryExists') {
        showErrorToast(strings('validations.subCategoryExists'));
      }
    }
  };

  const handleRemove = (id: string) => {
    onChange(value.filter(item => item !== id));
  };

  const handleToggleSelect = (id: string) => {
    if (value.includes(id)) {
      handleRemove(id);
    } else {
      onChange([...value, id]);
    }
    setInputValue('');
  };

  const handleStartEdit = (item: ISubCategory) => {
    setEditingId(item.id);
    setEditingText(item.name);
  };

  const handleSaveEdit = async (item: ISubCategory) => {
    if (!editingText.trim() || editingText.trim() === item.name) {
      setEditingId(null);
      return;
    }
    const newName = editingText.trim();

    // Duplicate check locally
    const duplicate = subCategories.find(
      sub => sub.id !== item.id && sub.name.toLowerCase() === newName.toLowerCase()
    );
    if (duplicate) {
      showErrorToast(strings('validations.subCategoryExists'));
      return;
    }

    try {
      await updateSubCategoryMutate({id: item.id, name: newName, storeId, categoryId});
      setEditingId(null);
    } catch (err: any) {
      if (err.message === 'subCategoryExists') {
        showErrorToast(strings('validations.subCategoryExists'));
      }
    }
  };

  const handleDelete = (item: ISubCategory) => {
    Alert.alert(
      strings('labels.areYouSure'),
      `Do you want to delete sub-category "${item.name}"?`,
      [
        {text: strings('button.cancel'), style: 'cancel'},
        {
          text: strings('button.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSubCategoryMutate({id: item.id, storeId, categoryId});
              // Deselect if active on the product
              if (value.includes(item.id)) {
                handleRemove(item.id);
              }
            } catch (err) {
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const handleBlur = () => {
    // Small delay to allow suggestions list touch handlers to register
    setTimeout(() => {
      setShowSuggestions(false);
    }, 250);
  };

  if (!categoryId) return null;

  return (
    <View style={styles.container}>
      {/* Search & Add Text Input */}
      <View style={styles.inputContainer}>
        <TKSecondaryTextInput
          label={strings('labels.subCategories')}
          placeholder={strings('placeholder.subCategory')}
          value={inputValue}
          onChangeText={setInputValue}
          onFocus={() => setShowSuggestions(true)}
          onBlur={handleBlur}
          error={error}
          rightChild={
            isCreating ? (
              <ActivityIndicator size="small" color={colors.primaryButtonBackgroundColor} />
            ) : (
              <TouchableOpacity onPress={handleAdd} activeOpacity={0.7} style={styles.plusButton}>
                <PlusIcon />
              </TouchableOpacity>
            )
          }
        />
      </View>

      {/* Selected Chips List */}
      {value.length > 0 && (
        <View style={styles.chipsContainer}>
          {value.map(id => (
            <View key={id} style={styles.chip}>
              <Text style={styles.chipText}>{getSubCategoryName(id)}</Text>
              <TouchableOpacity
                onPress={() => handleRemove(id)}
                style={styles.chipCloseButton}
                activeOpacity={0.7}>
                <CloseIcon />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Suggestions Autocomplete List */}
      {showSuggestions && (filteredSuggestions.length > 0 || isLoading) && (
        <View style={styles.suggestionsContainer}>
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={colors.primaryButtonBackgroundColor}
              style={{padding: 16}}
            />
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={styles.suggestionsList}
              contentContainerStyle={{paddingVertical: 4}}>
              {filteredSuggestions.map(item => {
                const isSelected = value.includes(item.id);
                const isEditing = editingId === item.id;

                return (
                  <View key={item.id} style={styles.suggestionRow}>
                    {isEditing ? (
                      // Editing View
                      <View style={styles.editContainer}>
                        <TextInput
                          value={editingText}
                          onChangeText={setEditingText}
                          style={styles.editInput}
                          autoFocus
                          maxLength={30}
                        />
                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            onPress={() => handleSaveEdit(item)}
                            style={styles.actionBtn}>
                            <CheckIcon />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => setEditingId(null)}
                            style={styles.actionBtn}>
                            <CrossIcon />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      // Normal Suggestions Row
                      <>
                        <TouchableOpacity
                          onPress={() => handleToggleSelect(item.id)}
                          style={styles.suggestionTextWrapper}
                          activeOpacity={0.7}>
                          <Text
                            style={[
                              styles.suggestionText,
                              isSelected && styles.selectedSuggestionText,
                            ]}>
                            {item.name} {isSelected && '✓'}
                          </Text>
                        </TouchableOpacity>
                        <View style={styles.rowActions}>
                          <TouchableOpacity onPress={() => handleStartEdit(item)} style={styles.actionBtn}>
                            <EditIcon />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                            <TKTrashIcon width={14} height={14} color={colors.errorTextColor} />
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};

export default SubCategoryInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: verticalScale(16),
  },
  inputContainer: {
    zIndex: 10,
  },
  plusButton: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
  },
  iconWrapper: {
    width: moderateScale(24),
    height: moderateScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(82, 142, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    fontSize: fontScale(18),
    fontWeight: '600',
    lineHeight: fontScale(20),
    textAlign: 'center',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: moderateScale(8),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(4),
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(82, 142, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(82, 142, 107, 0.3)',
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(4),
    paddingLeft: moderateScale(12),
    paddingRight: moderateScale(8),
  },
  chipText: {
    fontSize: fontScale(12),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.medium,
  },
  chipCloseButton: {
    marginLeft: moderateScale(4),
    padding: moderateScale(2),
  },
  closeIconWrapper: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: fontScale(16),
    lineHeight: fontScale(16),
    textAlign: 'center',
  },
  suggestionsContainer: {
    backgroundColor: colors.inputBackgroundSecondary,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: moderateScale(10),
    maxHeight: verticalScale(160),
    marginTop: verticalScale(2),
    zIndex: 999,
  },
  suggestionsList: {
    width: '100%',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  suggestionTextWrapper: {
    flex: 1,
    paddingVertical: verticalScale(4),
  },
  suggestionText: {
    fontSize: fontScale(14),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.regular,
  },
  selectedSuggestionText: {
    color: colors.primaryButtonBackgroundColor,
    fontFamily: fontFamily.semiBold,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(12),
  },
  actionBtn: {
    padding: moderateScale(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editInput: {
    flex: 1,
    height: verticalScale(32),
    borderWidth: 1,
    borderColor: colors.primaryButtonBackgroundColor,
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(8),
    paddingVertical: 0,
    fontSize: fontScale(13),
    color: colors.primaryTextColor,
    fontFamily: fontFamily.regular,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginLeft: moderateScale(8),
  },
});
