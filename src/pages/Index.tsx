import React, { useState } from 'react';
import PhoneFrame from '@/components/PhoneFrame';
import UploadScreen from '@/components/UploadScreen';
import EditScreen from '@/components/EditScreen';

type Screen = 'upload' | 'edit';

const Index: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('upload');

  return (
    <PhoneFrame>
      {currentScreen === 'upload' && (
        <UploadScreen onUpload={() => setCurrentScreen('edit')} />
      )}
      {currentScreen === 'edit' && (
        <EditScreen onBack={() => setCurrentScreen('upload')} />
      )}
    </PhoneFrame>
  );
};

export default Index;
