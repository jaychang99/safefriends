import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  CalendarDays,
  Clock3,
  CreditCard,
  ExternalLink,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  SquareStack,
  Undo2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  buildImageUrl,
  DetectCategory,
  fetchHistory,
  fetchHistoryDetail,
  FilterType,
  HistoryItem,
  isUsingMockHistoryApi,
} from '@/lib/history';
import usePageTitle from '@/hooks/usePageTitle';

type FilterTab = FilterType | 'ALL';
type CategoryTab = DetectCategory | 'ALL';

const filterLabels: Record<FilterType, string> = {
  AI: 'AI 자연 삭제',
  BLUR: '블러',
  MOSAIC: '모자이크',
};

const categoryLabels: Record<DetectCategory, string> = {
  QRBARCODE: 'QR/바코드',
  TEXT: '개인정보 텍스트',
  LOCATION: '위치 정보',
  FACE: '얼굴',
  ETC: '기타',
};

const categoryTone: Record<DetectCategory, string> = {
  QRBARCODE: 'bg-orange-100 text-orange-800 border-orange-200',
  TEXT: 'bg-blue-100 text-blue-800 border-blue-200',
  LOCATION: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  FACE: 'bg-purple-100 text-purple-800 border-purple-200',
  ETC: 'bg-slate-100 text-slate-800 border-slate-200',
};

const formatDate = (value: string) =>
  format(new Date(value), 'yyyy.MM.dd HH:mm');

const memberId = 1;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
    null,
  );
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
  const [categoryTab, setCategoryTab] = useState<CategoryTab>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [thumbFallback, setThumbFallback] = useState<Record<number, boolean>>(
    {},
  );

  usePageTitle('히스토리 대시보드');

  const historyQuery = useQuery({
    queryKey: ['history', memberId],
    queryFn: fetchHistory,
  });

  const detailQuery = useQuery({
    queryKey: ['history-detail', selectedHistoryId ?? 0],
    queryFn: fetchHistoryDetail,
    enabled: selectedHistoryId !== null,
  });

  const sortedFilteredHistories = useMemo(() => {
    if (!historyQuery.data) return [];

    return [...historyQuery.data.histories]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .filter((item) => {
        if (filterTab !== 'ALL' && item.filter !== filterTab) return false;
        if (
          categoryTab !== 'ALL' &&
          !item.detections.some((d) => d.category === categoryTab)
        )
          return false;
        if (!searchTerm) return true;

        const term = searchTerm.toLowerCase().trim();
        return (
          item.oldUuid.toLowerCase().includes(term) ||
          item.newUuid.toLowerCase().includes(term) ||
          filterLabels[item.filter].toLowerCase().includes(term)
        );
      });
  }, [historyQuery.data, filterTab, categoryTab, searchTerm]);

  const activeDetail = useMemo(
    () =>
      sortedFilteredHistories.find(
        (item) => item.historyId === selectedHistoryId,
      ),
    [sortedFilteredHistories, selectedHistoryId],
  );

  const totalDetections =
    historyQuery.data?.histories.reduce(
      (sum, h) => sum + h.detections.length,
      0,
    ) ?? 0;
  const aiEdits =
    historyQuery.data?.histories.filter((h) => h.filter === 'AI').length ?? 0;
  const latestHistory = sortedFilteredHistories[0];

  const fallbackThumbUrl = (seed: number) =>
    `https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&auto=format&fit=crop&q=60&sig=${seed}`;

  const getThumbSrc = (item: HistoryItem) =>
    thumbFallback[item.historyId]
      ? fallbackThumbUrl(item.historyId)
      : item.newUrl ?? buildImageUrl(item.newUuid, 'edited');

  const renderDetectionBadges = (item: HistoryItem) => (
    <div className="flex flex-wrap gap-2">
      {item.detections.map((det) => (
        <Badge
          key={det.detectId ?? `${det.category}-${det.x}-${det.y}`}
          className={categoryTone[det.category]}
          variant="outline"
        >
          {categoryLabels[det.category]}
        </Badge>
      ))}
    </div>
  );

  const emptyState =
    historyQuery.isLoading ||
    historyQuery.isError ||
    sortedFilteredHistories.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/10 via-background to-background">
      <Header
        title="히스토리 대시보드"
        rightContent={
          <div className="flex items-center gap-2">
            {isUsingMockHistoryApi && (
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800 border-amber-200"
              >
                Mock data
              </Badge>
            )}
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <Link to="/billing">
                <CreditCard className="w-4 h-4" />
                요금제
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => historyQuery.refetch()}
              disabled={historyQuery.isFetching}
            >
              {historyQuery.isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              새로고침
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="gap-2"
              onClick={() => navigate('/')}
            >
              <Sparkles className="w-4 h-4" />새 편집
            </Button>
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-10 space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              AI가 안전하게 보호한 기록
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              보호 내역 대시보드
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            {historyQuery.isFetching
              ? '데이터 동기화 중...'
              : '최근 데이터 기준'}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card/70 border border-border/60 shadow-md">
            <CardHeader className="pb-2">
              <CardDescription>총 처리 이미지</CardDescription>
              <CardTitle className="text-3xl">
                {historyQuery.data?.totalHistories ?? '-'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <SquareStack className="w-4 h-4" />
                최근 {historyQuery.data?.histories?.length ?? 0}건 표시 중
              </div>
              <Badge variant="outline">
                member #{historyQuery.data?.memberMeId ?? memberId}
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-lg">
            <CardHeader className="pb-2">
              <CardDescription>AI 자연 삭제 사용</CardDescription>
              <CardTitle className="text-3xl text-primary">{aiEdits}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-primary">
                <Sparkles className="w-4 h-4" />
                프리미엄 필터 적용 횟수
              </div>
              <Badge variant="secondary">AI</Badge>
            </CardContent>
          </Card>

          <Card className="bg-card/70 border border-border/60 shadow-md">
            <CardHeader className="pb-2">
              <CardDescription>감지된 개인정보</CardDescription>
              <CardTitle className="text-3xl">{totalDetections}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                {latestHistory
                  ? `${formatDistanceToNow(new Date(latestHistory.createdAt), {
                      addSuffix: true,
                    })} 업데이트`
                  : '업데이트 대기'}
              </div>
              <Badge variant="outline">감지 + 보호</Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-border/60 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xl">히스토리</CardTitle>
                <CardDescription>
                  편집한 이미지를 필터/검색하고 상세를 확인하세요.
                </CardDescription>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Tabs
                    value={filterTab}
                    onValueChange={(value) => setFilterTab(value as FilterTab)}
                  >
                    <TabsList>
                      <TabsTrigger value="ALL">전체</TabsTrigger>
                      <TabsTrigger value="AI">AI</TabsTrigger>
                      <TabsTrigger value="BLUR">블러</TabsTrigger>
                      <TabsTrigger value="MOSAIC">모자이크</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex items-center gap-2">
                  <Tabs
                    value={categoryTab}
                    onValueChange={(value) =>
                      setCategoryTab(value as CategoryTab)
                    }
                  >
                    <TabsList>
                      <TabsTrigger value="ALL">전체 감지</TabsTrigger>
                      <TabsTrigger value="FACE">얼굴</TabsTrigger>
                      <TabsTrigger value="TEXT">텍스트</TabsTrigger>
                      <TabsTrigger value="LOCATION">위치</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="UUID 또는 필터 검색"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {historyQuery.isLoading && (
              <div className="space-y-3">
                {[...Array(4)].map((_, idx) => (
                  <Skeleton key={idx} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            )}

            {historyQuery.isError && (
              <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                히스토리를 불러오지 못했습니다. 다시 시도해주세요.
              </div>
            )}

            {!historyQuery.isLoading && !historyQuery.isError && (
              <>
                {emptyState ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground gap-3">
                    <Clock3 className="w-8 h-8" />
                    <p className="text-sm">표시할 히스토리가 없습니다.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-border/60">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow>
                          <TableHead className="w-[120px]">썸네일</TableHead>
                          <TableHead className="min-w-[160px]">
                            편집 시간
                          </TableHead>
                          <TableHead>필터</TableHead>
                          <TableHead>감지 영역</TableHead>
                          <TableHead className="hidden lg:table-cell">
                            UUID
                          </TableHead>
                          <TableHead className="w-32 text-right">
                            액션
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedFilteredHistories.map((item) => (
                          <TableRow
                            key={item.historyId}
                            className="hover:bg-primary/5"
                          >
                            <TableCell>
                              <div className="overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                                <AspectRatio ratio={4 / 3} className="bg-muted">
                                  <img
                                    src={getThumbSrc(item)}
                                    alt="편집된 이미지 썸네일"
                                    className="h-full w-full object-cover"
                                    onError={() =>
                                      setThumbFallback((prev) => ({
                                        ...prev,
                                        [item.historyId]: true,
                                      }))
                                    }
                                  />
                                </AspectRatio>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground">
                                  {formatDate(item.createdAt)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(
                                    new Date(item.createdAt),
                                    { addSuffix: true },
                                  )}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="gap-2">
                                <Sparkles className="w-3 h-3" />
                                {filterLabels[item.filter]}
                              </Badge>
                            </TableCell>
                            <TableCell>{renderDetectionBadges(item)}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <div className="text-xs text-muted-foreground">
                                <p>원본: {item.oldUuid.slice(0, 8)}...</p>
                                <p>편집: {item.newUuid.slice(0, 8)}...</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary"
                                onClick={() =>
                                  setSelectedHistoryId(item.historyId)
                                }
                              >
                                <ExternalLink className="w-4 h-4" />
                                상세보기
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      <Sheet
        open={selectedHistoryId !== null}
        onOpenChange={(open) => !open && setSelectedHistoryId(null)}
      >
        <SheetContent side="right" className="w-full max-w-2xl">
          <SheetHeader>
            <SheetTitle>히스토리 상세</SheetTitle>
            <SheetDescription>
              이미지 서버에서 반환하는 UUID를 기반으로 원본·편집본을 조회합니다.
            </SheetDescription>
          </SheetHeader>

          {detailQuery.isLoading && (
            <div className="mt-6 space-y-4">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          )}

          {detailQuery.data && activeDetail && (
            <div className="mt-4 space-y-4">
              {(() => {
                const original =
                  activeDetail.oldUrl ??
                  (detailQuery.data.imageUuid
                    ? buildImageUrl(detailQuery.data.imageUuid, 'original')
                    : buildImageUrl(activeDetail.oldUuid, 'original'));
                const edited =
                  detailQuery.data.editedImageUrl ??
                  activeDetail.newUrl ??
                  buildImageUrl(activeDetail.newUuid, 'edited');

                return (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border bg-muted/30 p-2">
                      <p className="text-xs text-muted-foreground mb-2">원본</p>
                      <AspectRatio
                        ratio={4 / 3}
                        className="overflow-hidden rounded-lg bg-background"
                      >
                        <img
                          src={original}
                          alt="원본 이미지"
                          className="h-full w-full object-cover"
                        />
                      </AspectRatio>
                    </div>
                    <div className="rounded-xl border bg-muted/30 p-2">
                      <p className="text-xs text-muted-foreground mb-2">
                        편집본
                      </p>
                      <AspectRatio
                        ratio={4 / 3}
                        className="overflow-hidden rounded-lg bg-background"
                      >
                        <img
                          src={edited}
                          alt="편집된 이미지"
                          className="h-full w-full object-cover"
                        />
                      </AspectRatio>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">편집 ID</p>
                  <p className="text-lg font-semibold text-foreground">
                    #{detailQuery.data.historyId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(detailQuery.data.createdAt)} ·{' '}
                    {filterLabels[detailQuery.data.filter]}
                  </p>
                </div>
                <Badge variant="secondary" className="gap-2">
                  <Clock3 className="w-3 h-3" />
                  {formatDistanceToNow(new Date(detailQuery.data.createdAt), {
                    addSuffix: true,
                  })}
                </Badge>
              </div>

              <div className="rounded-xl border border-border/60 bg-card">
                <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-semibold">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  감지된 영역
                </div>
                <ScrollArea className="max-h-56">
                  <div className="divide-y">
                    {detailQuery.data.detections.map((det) => (
                      <div
                        key={
                          det.detectId ?? `${det.category}-${det.x}-${det.y}`
                        }
                        className="flex items-start justify-between px-4 py-3"
                      >
                        <div className="space-y-1">
                          <Badge
                            className={categoryTone[det.category]}
                            variant="outline"
                          >
                            {categoryLabels[det.category]}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            위치: x{det.x}, y{det.y} · 크기: {det.width}×
                            {det.height}
                          </p>
                        </div>
                        {typeof det.confidence === 'number' && (
                          <span className="text-xs text-foreground font-semibold">
                            신뢰도 {(det.confidence * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  API: GET /history/detail/{detailQuery.data.historyId}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => setSelectedHistoryId(null)}
                >
                  <Undo2 className="w-4 h-4" />
                  닫기
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Dashboard;
