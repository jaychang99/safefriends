import { useState } from 'react';
import UploadScreen from '@/components/UploadScreen';
import EditScreen from '@/components/EditScreen';
import usePageTitle from '@/hooks/usePageTitle';
import useAuthSession from '@/hooks/useAuthSession';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<'upload' | 'edit'>(
    'upload',
  );
  const [uploadResult, setUploadResult] = useState<{
    imageUuid: string;
    previewUrl: string;
    fileName: string;
  } | null>(null);
  const { user } = useAuthSession();

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
        <EditScreen
          onBack={handleReset}
          uploadResult={uploadResult}
          memberId={user?.memberId ?? 1}
        />
      )}
    </div>
  );
};

export default Index;
