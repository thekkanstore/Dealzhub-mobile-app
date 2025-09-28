import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';
import TKHeader from '../../components/Common/TKHeader/TKHeader';
import {strings} from '../../utils/language/langauageUtils';
import TKTextInput from '../../components/Common/TKTextInput/TKTextInput';
import {moderateScale} from '../../config/styles/responsiveSize';
import SearchItems from '../../components/Search/SearchItems/SearchItems';

const Search = () => {
  const [text, setText] = useState('');

  return (
    <View>
      <TKHeader
        header={
          <View>
            <TKTextInput
              placeholder={strings('labels.searchForProduct')}
              containerStyle={styles.textContainer}
              onChangeText={setText}
              value={text}
            />
          </View>
        }
        containerStyle={styles.headerContainer}
        // rightComponent={renderHelpButton()}
      />
      <SearchItems productName={text} />
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  textContainer: {
    width: '95%',
    marginTop: moderateScale(10),
  },
  headerContainer: {
    paddingHorizontal: moderateScale(16),
  },
});
