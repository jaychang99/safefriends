import React, { useRef, useState } from 'react';
import { ImagePlus, Camera, Sparkles, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import Header from './Header';
import { toast } from '@/hooks/use-toast';

interface UploadScreenProps {
  onUpload: () => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSelectFile = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // 실제 업로드 시:
      // const response = await fetch('/images/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      // if (!response.ok) throw new Error('이미지 업로드 실패');
      // const result = await response.json();

      await new Promise((resolve) => setTimeout(resolve, 800));

      toast({
        title: '업로드 완료!',
        description: '사진이 안전하게 업로드됐어요.',
      });

      onUpload();
    } catch (error) {
      console.error('Upload failed', error);
      toast({
        variant: 'destructive',
        title: '업로드에 실패했어요',
        description: '네트워크를 확인하고 다시 시도해주세요.',
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-card">
      <Header />

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 py-8 lg:py-16 gap-8 lg:gap-16">
        {/* Hero Section */}
        <div className="text-center lg:text-left lg:flex-1 lg:max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI 개인정보 보호</span>
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-foreground mb-3">
            안심하고 사진을 공유하세요
          </h1>
          <p className="text-muted-foreground text-sm lg:text-base leading-relaxed mb-6">
            AI가 사진 속 민감한 정보를 자동으로<br className="lg:hidden" />
            감지하고 안전하게 보호해드려요
          </p>
          
          {/* Features - Desktop */}
          <div className="hidden lg:grid grid-cols-3 gap-4 mt-8">
            {[
              { icon: '🔒', label: '초상권 보호', desc: '얼굴 자동 감지' },
              { icon: '📍', label: '위치 정보 삭제', desc: '간판/주소 블러' },
              { icon: '🤖', label: 'AI 자동 감지', desc: '원클릭 보호' },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-muted/50">
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-sm font-semibold text-foreground">{feature.label}</span>
                <span className="text-xs text-muted-foreground">{feature.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Zone */}
        <div className="w-full max-w-sm lg:max-w-md">
          <button
            onClick={handleSelectFile}
            disabled={isUploading}
            className="w-full aspect-square border-2 border-dashed border-primary/30 rounded-3xl flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-accent/50 to-secondary/30 hover:from-accent hover:to-secondary transition-all duration-300 hover:border-primary/50 hover:shadow-card group disabled:opacity-70"
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center animate-pulse-soft">
                  <ImagePlus className="w-8 h-8 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  사진을 업로드 중...
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <ImagePlus className="w-8 h-8 lg:w-10 lg:h-10 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-base lg:text-lg font-semibold text-foreground mb-1">
                    사진을 선택하세요
                  </p>
                  <p className="text-xs lg:text-sm text-muted-foreground">
                    클릭하여 파일 선택 또는 드래그 앤 드롭
                  </p>
                </div>
              </>
            )}
          </button>

          {/* Quick Actions */}
          <div className="flex justify-center gap-3 mt-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSelectFile}
              disabled={isUploading}
              className="gap-2"
            >
              <Camera className="w-4 h-4" />
              카메라
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate('/dashboard')}
            >
              <History className="w-4 h-4" />
              히스토리
            </Button>
          </div>
        </div>

        {/* Features - Mobile */}
        <div className="lg:hidden w-full mt-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: '🔒', label: '초상권 보호' },
              { icon: '📍', label: '위치 정보 삭제' },
              { icon: '🤖', label: 'AI 자동 감지' },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-muted/50">
                <span className="text-xl">{feature.icon}</span>
                <span className="text-xs font-medium text-muted-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadScreen;
