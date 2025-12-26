import { useState } from 'react';
import UploadScreen from '@/components/UploadScreen';
import EditScreen from '@/components/EditScreen';
import usePageTitle from '@/hooks/usePageTitle';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<'upload' | 'edit'>(
    'upload',
  );
  const [uploadResult, setUploadResult] = useState<{
    imageUuid: string;
    previewUrl: string;
    fileName: string;
  } | null>(null);

  const handleReset = () => {
    setCurrentScreen('upload');
    setUploadResult(null);
  };

  usePageTitle(
    currentScreen === 'edit' ? '편집하기' : '안심하고 사진을 공유하세요',
  );

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === 'upload' || !uploadResult ? (
        <UploadScreen
          onUpload={(payload) => {
            setUploadResult(payload);
            setCurrentScreen('edit');
          }}
        />
      ) : (
        <EditScreen onBack={handleReset} uploadResult={uploadResult} />
      )}
    </div>
  );
};

export default Index;
