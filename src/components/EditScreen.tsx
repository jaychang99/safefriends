import React, { useState } from 'react';
import { Check, Scan, Save, Share2, Eye, EyeOff, Crown, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
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
  const [isPricingOpen, setIsPricingOpen] = useState(false);
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-card">
      <Header showBack onBack={onBack} title="사진 편집" />
      
      {/* Image Container */}
      <div className="relative flex-1 lg:flex-[2] bg-foreground/5 min-h-[300px] lg:min-h-screen">
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

      {/* Control Panel - Bottom sheet on mobile, sidebar on desktop */}
      <div className="lg:w-96 lg:min-h-screen bg-card rounded-t-3xl lg:rounded-none shadow-lg lg:shadow-none border-t lg:border-t-0 lg:border-l border-border/50 -mt-4 lg:mt-0 relative z-10">
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-3 lg:hidden" />
        
        <div className="px-5 lg:px-6 py-4 lg:py-8 space-y-5 lg:space-y-6 pb-8">
          <h2 className="hidden lg:block text-xl font-bold text-foreground">편집 옵션</h2>
          
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
            <div className="flex flex-col lg:flex-col gap-2">
              {[
                { key: 'blur', label: '블러' },
                { key: 'mosaic', label: '모자이크' },
                { key: 'ai-remove', label: 'AI 자연스럽게 지우기', pro: true, description: '자연스럽게 복원하는 프리미엄 필터' },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => option.pro ? setIsPricingOpen(true) : setFilterType(option.key as FilterType)}
                  className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                    filterType === option.key && !option.pro
                      ? 'bg-primary text-primary-foreground border-primary'
                      : option.pro
                        ? 'bg-primary/5 border-primary/40 text-primary hover:border-primary/60 hover:bg-primary/10'
                        : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{option.label}</span>
                    {option.pro && (
                      <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold tracking-wide">
                        <Crown className="w-3 h-3" />
                        PRO
                      </span>
                    )}
                  </div>
                  {option.pro && (
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-primary">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{option.description}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Detection List - Desktop only */}
          {isAnalyzed && (
            <div className="hidden lg:block">
              <h3 className="text-sm font-semibold text-foreground mb-3">감지된 영역</h3>
              <div className="space-y-2">
                {detections.map((detection) => (
                  <button
                    key={detection.id}
                    onClick={() => toggleDetection(detection.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                      detection.isActive
                        ? 'bg-primary/10 border-primary'
                        : 'bg-muted/50 border-transparent'
                    }`}
                  >
                    <span className="font-medium text-foreground">{detection.label}</span>
                    {detection.isActive ? (
                      <EyeOff className="w-4 h-4 text-primary" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 lg:pt-4">
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

      <Dialog open={isPricingOpen} onOpenChange={setIsPricingOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>AI 자연스럽게 지우기는 Pro 기능이에요</DialogTitle>
            <DialogDescription>
              자연스러운 복원과 고해상도 내보내기를 포함한 업그레이드 플랜을 선택해보세요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: 'Basic',
                price: '무료',
                period: '',
                description: '개인 사용자를 위한 기본 보호',
                features: ['블러/모자이크 필터', '표준 감지 옵션', '저장 · 공유 지원'],
                cta: '현재 이용 중',
                variant: 'secondary' as const,
                disabled: true,
              },
              {
                name: 'Pro',
                price: '12,000원',
                period: '/월',
                description: 'AI가 알아서 자연스럽게 복원',
                features: ['AI 자연스럽게 지우기', '무제한 감지 및 토글', '고해상도 내보내기'],
                cta: 'Pro로 업그레이드',
                highlight: true,
                variant: 'primary' as const,
              },
              {
                name: 'Enterprise',
                price: '맞춤 상담',
                period: '',
                description: '팀과 보안을 위한 전담 지원',
                features: ['팀 좌석 · 접근 제어', '보안 규정 맞춤 설정', '전담 매니저 및 SLA'],
                cta: '상담 요청하기',
                variant: 'outline' as const,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-4 shadow-sm transition-all ${
                  plan.highlight
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border/60 bg-background'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-foreground">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  {plan.highlight && (
                    <span className="rounded-full bg-primary text-primary-foreground px-2 py-1 text-[11px] font-semibold">
                      추천
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-sm font-semibold text-muted-foreground">{plan.period}</span>}
                </div>

                <div className="mt-4 space-y-2 text-sm text-foreground">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="mt-5 w-full"
                  variant={plan.variant}
                  size="lg"
                  disabled={plan.disabled}
                  onClick={() => {
                    toast({
                      title: `${plan.name} 플랜 문의가 접수되었어요.`,
                      description: '담당자가 곧 안내드릴게요.',
                    });
                    setIsPricingOpen(false);
                  }}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditScreen;
