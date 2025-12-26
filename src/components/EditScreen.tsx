import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Check,
  Scan,
  Save,
  Share2,
  Eye,
  EyeOff,
  Crown,
  Lock,
  Loader2,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  DetectCategory,
  FilterType as ApiFilterType,
  requestDetect,
  requestEdit,
} from '@/lib/api';

interface EditScreenProps {
  onBack: () => void;
  uploadResult: {
    imageUuid: string;
    previewUrl: string;
    fileName?: string;
  };
  memberId?: number;
}

type FilterOption = 'blur' | 'mosaic' | 'ai-remove';

interface DetectionBox {
  id: string;
  category: DetectCategory;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isActive: boolean;
}

const CATEGORY_LABELS: Record<DetectCategory, string> = {
  QRBARCODE: 'QR/바코드',
  TEXT: '개인정보 텍스트',
  LOCATION: '지역 정보',
  FACE: '얼굴',
  ETC: '기타',
};

const filterOptionToApi: Record<FilterOption, ApiFilterType> = {
  blur: 'BLUR',
  mosaic: 'MOSAIC',
  'ai-remove': 'AI',
};

const memberIdDefault = 1;

const EditScreen: React.FC<EditScreenProps> = ({
  onBack,
  uploadResult,
  memberId = memberIdDefault,
}) => {
  const queryClient = useQueryClient();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [renderedImageSize, setRenderedImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [activeImageUuid, setActiveImageUuid] = useState(
    uploadResult.imageUuid,
  );
  const [displayedImageUrl, setDisplayedImageUrl] = useState(
    uploadResult.previewUrl,
  );
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [detections, setDetections] = useState<DetectionBox[]>([]);
  const [filterType, setFilterType] = useState<FilterOption>('blur');
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isProUnlocked, setIsProUnlocked] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    qr: false,
    personal: false,
    location: false,
    portrait: true,
  });

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const { width, height } = entry.contentRect;
      setRenderedImageSize({ width, height });
    });

    observer.observe(imageElement);
    return () => observer.disconnect();
  }, [displayedImageUrl]);

  const detectMutation = useMutation({
    mutationFn: requestDetect,
    onSuccess: (data) => {
      if (!imageSize) return;
      const mapped = data.detections.map((det, idx) => {
        const widthPercent = Math.min(100, (det.width / imageSize.width) * 100);
        const heightPercent = Math.min(
          100,
          (det.height / imageSize.height) * 100,
        );
        const xPercent = Math.min(
          100 - widthPercent,
          Math.max(0, (det.x / imageSize.width) * 100),
        );
        const yPercent = Math.min(
          100 - heightPercent,
          Math.max(0, (det.y / imageSize.height) * 100),
        );

        return {
          id: `${det.category}-${idx}-${det.x}-${det.y}`,
          category: det.category,
          label: CATEGORY_LABELS[det.category],
          x: xPercent,
          y: yPercent,
          width: widthPercent,
          height: heightPercent,
          isActive: true,
        };
      });

      setDetections(mapped);
      setIsAnalyzed(true);

      toast({
        title: '분석 완료',
        description: `${
          data.totalDetections ?? mapped.length
        }개의 개인정보 영역을 찾았어요.`,
      });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: '분석에 실패했어요',
        description: '네트워크를 확인하고 다시 시도해주세요.',
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: requestEdit,
    onSuccess: (data) => {
      setDisplayedImageUrl(data.newUrl ?? displayedImageUrl);
      setActiveImageUuid(data.newUuid ?? activeImageUuid);
      if (data.newUrl) {
        void downloadEditedImage(data.newUrl);
      }
      toast({
        title: '✨ 저장 완료!',
        description: '안심 사진이 생성되었어요.',
      });
      queryClient.invalidateQueries({ queryKey: ['history', memberId] });
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: '저장에 실패했어요',
        description: '잠시 후 다시 시도해주세요.',
      });
    },
  });

  const downloadEditedImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const extensionFromName = uploadResult.fileName
        ? uploadResult.fileName.split('.').pop()
        : undefined;
      const extensionFromUrl = imageUrl.split('.').pop()?.split('?')[0];
      const extensionCandidate =
        extensionFromName && extensionFromName.length <= 5
          ? extensionFromName
          : extensionFromUrl && extensionFromUrl.length <= 5
            ? extensionFromUrl
            : null;
      const fileExtension = extensionCandidate || 'png';
      const baseName = uploadResult.fileName
        ? uploadResult.fileName.replace(/\.[^/.]+$/, '')
        : 'safefriends-image';
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${baseName}-edited.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '다운로드에 실패했어요',
        description: '잠시 후 다시 시도해주세요.',
      });
    }
  };

  const toggleDetection = (id: string) => {
    setDetections((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)),
    );
  };

  const getFilterStyle = (isActive: boolean): React.CSSProperties => {
    if (!isActive) return {};

    switch (filterType) {
      case 'blur':
        return {
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          backgroundColor: 'hsl(263 70% 50% / 0.15)',
        };
      case 'mosaic':
        return {
          background:
            'repeating-conic-gradient(hsl(263 70% 50% / 0.4) 0% 25%, hsl(263 70% 70% / 0.3) 0% 50%) 50% / 8px 8px',
        };
      case 'ai-remove':
        return {
          background:
            'linear-gradient(135deg, hsl(263 70% 50% / 0.3), hsl(280 70% 55% / 0.3))',
        };
      default:
        return {};
    }
  };

  const getDetectionBoxStyle = (
    detection: DetectionBox,
  ): React.CSSProperties => {
    const overlaySize =
      renderedImageSize ?? imageContainerRef.current?.getBoundingClientRect();

    if (overlaySize?.width && overlaySize?.height) {
      return {
        left: (detection.x / 100) * overlaySize.width,
        top: (detection.y / 100) * overlaySize.height,
        width: (detection.width / 100) * overlaySize.width,
        height: (detection.height / 100) * overlaySize.height,
        ...getFilterStyle(detection.isActive),
      };
    }

    return {
      left: `${detection.x}%`,
      top: `${detection.y}%`,
      width: `${detection.width}%`,
      height: `${detection.height}%`,
      ...getFilterStyle(detection.isActive),
    };
  };

  const handleResizeStart = (
    detection: DetectionBox,
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const container = imageContainerRef.current;
    if (!container) return;

    const rect = renderedImageSize ?? container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = detection.width;
    const startHeight = detection.height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;

      setDetections((prev) =>
        prev.map((d) => {
          if (d.id !== detection.id) return d;

          const newWidth = Math.min(
            100 - d.x,
            Math.max(5, startWidth + deltaX),
          );
          const newHeight = Math.min(
            100 - d.y,
            Math.max(5, startHeight + deltaY),
          );
          const updatedDetection = { ...d, width: newWidth, height: newHeight };

          console.log('Detection resized', {
            id: updatedDetection.id,
            label: updatedDetection.label,
            x: updatedDetection.x,
            y: updatedDetection.y,
            width: updatedDetection.width,
            height: updatedDetection.height,
          });

          return updatedDetection;
        }),
      );
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const detectTargets: DetectCategory[] = Object.entries(selectedOptions)
    .filter(([, enabled]) => enabled)
    .map(([key]) => {
      switch (key) {
        case 'qr':
          return 'QRBARCODE';
        case 'personal':
          return 'TEXT';
        case 'location':
          return 'LOCATION';
        default:
          return 'FACE';
      }
    });

  const handleAnalyze = () => {
    if (!detectTargets.length) {
      toast({
        title: '감지할 대상을 선택해주세요',
        description: '최소 1개 이상 감지 옵션을 선택해야 해요.',
      });
      return;
    }

    if (!imageSize) {
      toast({
        variant: 'destructive',
        title: '이미지 로딩 중이에요',
        description: '이미지가 로드된 후 다시 시도해주세요.',
      });
      return;
    }

    setIsAnalyzed(false);
    setDetections([]);
    detectMutation.mutate({
      imageUuid: activeImageUuid,
      detectTargets,
    });
  };

  const buildRegionsPayload = () => {
    if (!imageSize) return [];

    return detections
      .filter((d) => d.isActive)
      .map((d) => ({
        category: d.category,
        x: Math.round((d.x / 100) * imageSize.width),
        y: Math.round((d.y / 100) * imageSize.height),
        width: Math.round((d.width / 100) * imageSize.width),
        height: Math.round((d.height / 100) * imageSize.height),
      }));
  };

  const handleSave = () => {
    if (!isAnalyzed) {
      toast({
        title: '먼저 감지를 실행해주세요',
        description: 'AI 분석을 완료해야 필터를 적용할 수 있어요.',
      });
      return;
    }

    if (!imageSize) {
      toast({
        variant: 'destructive',
        title: '이미지 정보를 불러오지 못했어요',
        description: '이미지를 다시 불러오고 시도해주세요.',
      });
      return;
    }

    const regions = buildRegionsPayload();

    if (!regions.length) {
      toast({
        title: '적용할 영역이 없어요',
        description: '보호할 영역을 켜거나 감지를 다시 실행해주세요.',
      });
      return;
    }

    editMutation.mutate({
      imageUuid: activeImageUuid,
      memberId,
      regions,
      filter: filterOptionToApi[filterType],
    });
  };

  const isAnalyzing = detectMutation.isPending;
  const isSaving = editMutation.isPending;
  const handleProUpgrade = () => {
    setIsProUnlocked(true);
    setFilterType('ai-remove');
    setIsPricingOpen(false);
    toast({
      title: 'Pro 플랜이 활성화되었어요',
      description: 'AI 자연스럽게 지우기 필터를 바로 사용해보세요.',
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-card">
      {/* Image Container */}
      <div
        ref={imageContainerRef}
        className="relative flex-1 lg:flex-[2] bg-foreground/5 min-h-[300px] lg:min-h-screen max-h-screen overflow-hidden"
      >
        <img
          ref={imageRef}
          src={displayedImageUrl}
          alt={uploadResult.fileName ?? '업로드한 이미지'}
          className="w-full h-full max-h-screen object-cover"
          onLoad={(event) => {
            const { naturalWidth, naturalHeight, clientWidth, clientHeight } =
              event.currentTarget;
            setImageSize({
              width: naturalWidth,
              height: naturalHeight,
            });
            setRenderedImageSize({
              width: clientWidth,
              height: clientHeight,
            });
          }}
        />

        {/* Scanning Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-foreground/20">
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-card/90 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="font-medium text-foreground">
                  이미지를 분석 중입니다...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Detection Boxes */}
        {isAnalyzed &&
          detections.map((detection) => (
            <button
              key={detection.id}
              onClick={() => toggleDetection(detection.id)}
              className={`group absolute transition-all duration-300 rounded-xl border-2 ${
                detection.isActive
                  ? 'border-primary shadow-lg'
                  : 'border-muted-foreground/30 border-dashed'
              }`}
              style={getDetectionBoxStyle(detection)}
            >
              <div
                className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap ${
                  detection.isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {detection.isActive ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
                {detection.label}
              </div>
              <div
                className="absolute bottom-1 right-1 w-3 h-3 rounded-sm bg-primary/80 text-primary-foreground cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                onPointerDown={(event) => handleResizeStart(detection, event)}
              />
            </button>
          ))}

        {/* Active Filters Count */}
        {isAnalyzed && (
          <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-md">
            <span className="text-xs font-medium text-muted-foreground">
              보호 영역
            </span>
            <span className="text-lg font-bold text-primary ml-2">
              {detections.filter((d) => d.isActive).length}
            </span>
          </div>
        )}
      </div>

      {/* Control Panel - Bottom sheet on mobile, sidebar on desktop */}
      <div className="lg:w-96 lg:min-h-screen bg-card rounded-t-3xl lg:rounded-none shadow-lg lg:shadow-none border-t lg:border-t-0 lg:border-l border-border/50 -mt-4 lg:mt-0 relative z-10">
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-3 lg:hidden" />

        <div className="px-5 lg:px-6 py-4 lg:py-8 space-y-5 lg:space-y-6 pb-8">
          <div className="hidden lg:flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">편집 옵션</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={onBack}
            >
              돌아가기
            </Button>
          </div>
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={onBack}
            >
              돌아가기
            </Button>
          </div>

          {/* Detection Options */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5">
                1단계
              </span>
              <h3 className="text-sm font-semibold text-foreground">
                감지할 대상
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              필터 전에 어떤 정보를 지킬지 먼저 선택해주세요.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'qr', label: 'QR/바코드' },
                { key: 'personal', label: '개인정보(텍스트)' },
                { key: 'location', label: '지역 정보(간판)' },
                { key: 'portrait', label: '초상권' },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() =>
                    setSelectedOptions((prev) => ({
                      ...prev,
                      [option.key]: !prev[option.key as keyof typeof prev],
                    }))
                  }
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                    selectedOptions[option.key as keyof typeof selectedOptions]
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-muted/50 border-transparent text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      selectedOptions[
                        option.key as keyof typeof selectedOptions
                      ]
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                  >
                    {selectedOptions[
                      option.key as keyof typeof selectedOptions
                    ] && (
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Analyze CTA */}
          <div className="pt-1 lg:pt-2">
            {!isAnalyzed ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full gap-2"
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Scan className="w-5 h-5" />
                )}
                {isAnalyzing ? '분석 중...' : 'AI 안심 분석 시작'}
              </Button>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3 text-primary">
                <Check className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">AI 안심 분석 완료</p>
                  <p className="text-xs text-primary/80">
                    이제 감지된 영역에 적용할 필터 방식을 선택하세요.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Filter Type */}
          <div>
            <div className="flex items-center gap-2 mb-2 mt-2">
              <span className="rounded-full bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5">
                2단계
              </span>
              <h3 className="text-sm font-semibold text-foreground">
                필터 방식
              </h3>
            </div>
            {!isAnalyzed ? (
              <div className="rounded-xl border border-dashed border-muted px-4 py-3 text-sm text-muted-foreground bg-muted/30">
                AI 분석 후에 필터 방식을 고를 수 있어요.
              </div>
            ) : (
              <div className="flex flex-col lg:flex-col gap-2">
                {[
                  { key: 'blur', label: '블러' },
                  { key: 'mosaic', label: '모자이크' },
                  {
                    key: 'ai-remove',
                    label: 'AI 자연스럽게 지우기',
                    pro: true,
                    description: '자연스럽게 복원하는 프리미엄 필터',
                  },
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      if (option.pro && !isProUnlocked) {
                        setIsPricingOpen(true);
                        return;
                      }
                      setFilterType(option.key as FilterOption);
                    }}
                    className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                      filterType === option.key
                        ? 'bg-primary text-primary-foreground border-primary'
                        : option.pro && !isProUnlocked
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
            )}
          </div>

          {/* Detection List - Desktop only */}
          {isAnalyzed && (
            <div className="hidden lg:block">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                감지된 영역
              </h3>
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
                    <span className="font-medium text-foreground">
                      {detection.label}
                    </span>
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

          {/* Actions after filter selection */}
          {isAnalyzed && (
            <div className="pt-2 lg:pt-4">
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1 gap-2"
                  onClick={() => {
                    toast({
                      title: '공유 준비 완료',
                      description: '공유할 앱을 선택해주세요.',
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
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  {isSaving ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isPricingOpen} onOpenChange={setIsPricingOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>AI 자연스럽게 지우기는 Pro 기능이에요</DialogTitle>
            <DialogDescription>
              자연스러운 복원과 고해상도 내보내기를 포함한 업그레이드 플랜을
              선택해보세요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                name: 'Basic',
                price: '무료',
                period: '',
                description: '개인 사용자를 위한 기본 보호',
                features: [
                  '블러/모자이크 필터',
                  '표준 감지 옵션',
                  '저장 · 공유 지원',
                ],
                cta: '현재 이용 중',
                variant: 'secondary' as const,
                disabled: true,
              },
              {
                name: 'Pro',
                price: '12,000원',
                period: '/월',
                description: 'AI가 알아서 자연스럽게 복원',
                features: [
                  'AI 자연스럽게 지우기',
                  '무제한 감지 및 토글',
                  '고해상도 내보내기',
                ],
                cta: 'Pro로 업그레이드',
                highlight: true,
                variant: 'primary' as const,
              },
              {
                name: 'Enterprise',
                price: '맞춤 상담',
                period: '',
                description: '팀과 보안을 위한 전담 지원',
                features: [
                  '팀 좌석 · 접근 제어',
                  '보안 규정 맞춤 설정',
                  '전담 매니저 및 SLA',
                ],
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
                    <p className="text-lg font-bold text-foreground">
                      {plan.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  {plan.highlight && (
                    <span className="rounded-full bg-primary text-primary-foreground px-2 py-1 text-[11px] font-semibold">
                      추천
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm font-semibold text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
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
                    if (plan.name === 'Pro') {
                      handleProUpgrade();
                      return;
                    }
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
