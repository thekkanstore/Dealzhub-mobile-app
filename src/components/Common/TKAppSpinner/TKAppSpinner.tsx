import React, {useMemo} from 'react';
import {StyleSheet, Modal, View, ActivityIndicator} from 'react-native';
import {colors} from '../../../config/styles/colors';

interface SpinnerProps {
  isVisible: boolean;
}

const TKAppSpinner: React.FC<SpinnerProps> = ({isVisible}) => {
  const styles = useMemo(() => createStyles(), []);

  return (
    <Modal
      transparent
      statusBarTranslucent
      visible={isVisible}
      animationType="fade"
      style={styles.modal}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primaryButtonBackgroundColor} />
      </View>
    </Modal>
  );
};

const createStyles = () =>
  StyleSheet.create({
    modal: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: -1,
    },
  });

export default React.memo(TKAppSpinner);
