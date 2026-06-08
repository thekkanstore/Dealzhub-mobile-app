import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../../../config/styles/colors';
import TKButton from '../TKButton/TKButton';
import {
  CustomPermissionDialogProps,
  CustomSettingsDialogProps,
} from '../../../utils/notifictiaon/notificationPermissionManager';

export const TKModalPermissionDialog: React.FC<CustomPermissionDialogProps> = ({
  title,
  message,
  allowText,
  notNowText,
  onAllow,
  onNotNow,
}) => {
  return (
    <View style={styles.dialogContent}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🔔</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.buttonContainer}>
        <TKButton
          onPress={() => {
            onNotNow();
          }}
          title={notNowText}
          type={'secondary'}
          style={styles.button}
        />
        <TKButton
          onPress={() => {
            onAllow();
          }}
          title={allowText}
          style={styles.button}
        />
      </View>
    </View>
  );
};

export const TKModalSettingsDialog: React.FC<CustomSettingsDialogProps> = ({
  title,
  message,
  goToSettingsText,
  cancelText,
  onGoToSettings,
  onCancel,
}) => {
  return (
    <View style={styles.dialogContent}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>⚙️</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.buttonContainer}>
        <TKButton
          onPress={() => {
            onCancel();
          }}
          title={cancelText}
          type={'secondary'}
          style={styles.button}
        />
        <TKButton
          onPress={() => {
            onGoToSettings();
          }}
          title={goToSettingsText}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dialogContent: {
    padding: 20,
    width: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    color: colors.primaryTextColor,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
    color: colors.primaryTextColor,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
});
