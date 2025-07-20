import React, {useState, useEffect} from 'react';
import TKModal from '../TKModal/TKModal';

interface DialogManagerProps {
  children: React.ReactNode;
}

interface DialogManagerRef {
  showDialog: (component: React.ReactElement) => Promise<void>;
  hideDialog: () => void;
}

// Global dialog manager instance
let dialogManagerRef: DialogManagerRef | null = null;

export const TKGlobalModalManager: React.FC<DialogManagerProps> = ({children}) => {
  const [currentDialog, setCurrentDialog] = useState<React.ReactElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showDialog = (component: React.ReactElement): Promise<void> => {
    return new Promise(resolve => {
      setCurrentDialog(component);
      setIsVisible(true);
      resolve();
    });
  };

  const hideDialog = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentDialog(null);
    }, 300); // Wait for animation to complete
  };

  useEffect(() => {
    // Register this instance as the global dialog manager
    dialogManagerRef = {
      showDialog,
      hideDialog,
    };

    // Cleanup on unmount
    return () => {
      dialogManagerRef = null;
    };
  }, []);

  return (
    <>
      {children}
      <TKModal
        isVisible={isVisible}
        onClose={hideDialog}
        showCloseButton={false}
        containerStyle={{
          maxHeight: 'auto',
        }}>
        {currentDialog}
      </TKModal>
    </>
  );
};

// Export helper functions to show/hide dialogs from anywhere
export const showDialog = (component: React.ReactElement): Promise<void> => {
  if (!dialogManagerRef) {
    throw new Error(
      'DialogManager not initialized. Make sure to wrap your app with DialogManager.',
    );
  }
  return dialogManagerRef.showDialog(component);
};

export const hideDialog = (): void => {
  if (dialogManagerRef) {
    dialogManagerRef.hideDialog();
  }
};
