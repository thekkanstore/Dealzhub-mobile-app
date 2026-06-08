import {useState, useEffect, useCallback} from 'react';
import {Keyboard} from 'react-native';

export const useKeyboardListener = (): [boolean, () => void] => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const hideKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
      Keyboard.dismiss();
    });
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  return [isKeyboardVisible, hideKeyboard];
};
