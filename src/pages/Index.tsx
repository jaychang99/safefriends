import { useState } from 'react';
import UploadScreen from '@/components/UploadScreen';
import EditScreen from '@/components/EditScreen';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<'upload' | 'edit'>('upload');

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md min-h-screen">
        {currentScreen === 'upload' ? (
          <UploadScreen onUpload={() => setCurrentScreen('edit')} />
        ) : (
          <EditScreen onBack={() => setCurrentScreen('upload')} />
        )}
      </div>
    </div>
  );
};

export default Index;
