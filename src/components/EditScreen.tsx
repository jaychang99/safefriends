import React, { useState } from 'react';
import { Check, Scan, Save, Share2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import Header from './Header';
import { toast } from '@/hooks/use-toast';

interface EditScreenProps {
  onBack: () => void;
}

type FilterType = 'blur' | 'mosaic' | 'ai-remove';

interface DetectionBox {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
}

const MOCK_DETECTIONS: DetectionBox[] = [
  { id: '1', label: '얼굴', x: 42, y: 15, width: 18, height: 12, isActive: true },
  { id: '2', label: '화면', x: 30, y: 45, width: 40, height: 25, isActive: true },
];

const EditScreen: React.FC<EditScreenProps> = ({ onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [detections, setDetections] = useState<DetectionBox[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('blur');
  const [selectedOptions, setSelectedOptions] = useState({
    qr: false,
    personal: false,
    location: false,
    portrait: true,
  });

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsAnalyzed(true);
      setDetections(MOCK_DETECTIONS);
    }, 2000);
  };

  const toggleDetection = (id: string) => {
    setDetections(prev => 
      prev.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d)
    );
  };

  const handleSave = () => {
    toast({
      title: "✨ 저장 완료!",
      description: "안심 사진이 앨범에 저장되었습니다.",
    });
  };

  const getFilterStyle = (isActive: boolean): React.CSSProperties => {
    if (!isActive) return {};
    
    switch (filterType) {
      case 'blur':
        return { 
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: 'hsl(263 70% 50% / 0.15)'
        };
      case 'mosaic':
        return { 
          background: 'repeating-conic-gradient(hsl(263 70% 50% / 0.4) 0% 25%, hsl(263 70% 70% / 0.3) 0% 50%) 50% / 8px 8px',
        };
      case 'ai-remove':
        return { 
          background: 'linear-gradient(135deg, hsl(263 70% 50% / 0.3), hsl(280 70% 55% / 0.3))',
        };
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-card">
      <Header showBack onBack={onBack} title="사진 편집" />
      
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-foreground/5 flex-shrink-0">
        <img
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80"
          alt="카페에서 노트북 작업 중인 사람"
          className="w-full h-full object-cover"
        />
        
        {/* Scanning Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-foreground/20">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-card/90 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="font-medium text-foreground">이미지를 분석 중입니다...</span>
              </div>
            </div>
          </div>
        )}

        {/* Detection Boxes */}
        {isAnalyzed && detections.map((detection) => (
          <button
            key={detection.id}
            onClick={() => toggleDetection(detection.id)}
            className={`absolute transition-all duration-300 rounded-xl border-2 ${
              detection.isActive 
                ? 'border-primary shadow-lg' 
                : 'border-muted-foreground/30 border-dashed'
            }`}
            style={{
              left: `${detection.x}%`,
              top: `${detection.y}%`,
              width: `${detection.width}%`,
              height: `${detection.height}%`,
              ...getFilterStyle(detection.isActive),
            }}
          >
            <div className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap ${
              detection.isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {detection.isActive ? (
                <EyeOff className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
              {detection.label}
            </div>
          </button>
        ))}

        {/* Active Filters Count */}
        {isAnalyzed && (
          <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-md">
            <span className="text-xs font-medium text-muted-foreground">보호 영역</span>
            <span className="text-lg font-bold text-primary ml-2">
              {detections.filter(d => d.isActive).length}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div className="flex-1 bg-card rounded-t-3xl shadow-lg border-t border-border/50 bottom-sheet-enter -mt-4 relative z-10">
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-3" />
        
        <div className="px-5 py-4 space-y-4 pb-8">
          {/* Detection Options */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">감지할 대상</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'qr', label: 'QR/바코드' },
                { key: 'personal', label: '개인정보(텍스트)' },
                { key: 'location', label: '지역 정보(간판)' },
                { key: 'portrait', label: '초상권' },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setSelectedOptions(prev => ({
                    ...prev,
                    [option.key]: !prev[option.key as keyof typeof prev]
                  }))}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                    selectedOptions[option.key as keyof typeof selectedOptions]
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-muted/50 border-transparent text-muted-foreground'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                    selectedOptions[option.key as keyof typeof selectedOptions]
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}>
                    {selectedOptions[option.key as keyof typeof selectedOptions] && (
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter Type */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">필터 방식</h3>
            <div className="flex gap-2">
              {[
                { key: 'blur', label: '블러' },
                { key: 'mosaic', label: '모자이크' },
                { key: 'ai-remove', label: 'AI 자연스럽게 지우기' },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFilterType(option.key as FilterType)}
                  className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    filterType === option.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {!isAnalyzed ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full gap-2"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                <Scan className="w-5 h-5" />
                AI 안심 분석 시작
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={() => {
                    toast({
                      title: "공유 준비 완료",
                      description: "공유할 앱을 선택해주세요.",
                    });
                  }}
                >
                  <Share2 className="w-5 h-5" />
                  공유
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={handleSave}
                >
                  <Save className="w-5 h-5" />
                  저장
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditScreen;
