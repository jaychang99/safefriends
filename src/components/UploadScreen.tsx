import React, { useState } from 'react';
import { ImagePlus, Camera, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import Header from './Header';

interface UploadScreenProps {
  onUpload: () => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onUpload }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onUpload();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-card">
      <Header />
      
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI 개인정보 보호</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            안심하고 사진을 공유하세요
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            AI가 사진 속 민감한 정보를 자동으로<br />
            감지하고 안전하게 보호해드려요
          </p>
        </div>

        {/* Upload Zone */}
        <button
          onClick={handleUpload}
          disabled={isLoading}
          className="w-full aspect-square max-w-[280px] border-2 border-dashed border-primary/30 rounded-3xl flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-accent/50 to-secondary/30 hover:from-accent hover:to-secondary transition-all duration-300 hover:border-primary/50 hover:shadow-card group disabled:opacity-70"
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center animate-pulse-soft">
                <ImagePlus className="w-8 h-8 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                사진을 불러오는 중...
              </span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <ImagePlus className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-foreground mb-1">
                  사진을 선택하세요
                </p>
                <p className="text-xs text-muted-foreground">
                  탭하여 갤러리에서 선택
                </p>
              </div>
            </>
          )}
        </button>

        {/* Quick Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleUpload}
            disabled={isLoading}
            className="gap-2"
          >
            <Camera className="w-4 h-4" />
            카메라
          </Button>
        </div>

        {/* Features */}
        <div className="mt-auto pt-8 w-full">
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
