import React, {useState} from 'react';
import {StyleProp, ViewStyle} from 'react-native';

import TKButton from '../../../../components/TKButton/TKButton';
import {strings} from '../../../../utils/language/langauageUtils';
import authService from '../../../../services/auth/authService';

interface LogoutButtonProps {
  buttonStyle?: StyleProp<ViewStyle>;
}
const LogoutButton: React.FC<LogoutButtonProps> = ({buttonStyle}) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleLogOut = async () => {
    setIsLoading(true);
    const result = await authService.logout();
    if (result.success) {
      strings('login.logoutMessage');
    }
    setIsLoading(false);
  };
  return (
    <TKButton
      title={strings('labels.logout')}
      style={buttonStyle}
      onPress={handleLogOut}
      isLoading={isLoading}
    />
  );
};

export default LogoutButton;
