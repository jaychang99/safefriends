import { QueryFunction } from "@tanstack/react-query";

export type FilterType = "BLUR" | "MOSAIC" | "AI";

export type DetectCategory =
  | "QRBARCODE"
  | "TEXT"
  | "LOCATION"
  | "FACE"
  | "ETC";

export interface Detection {
  detectId: number;
  category: DetectCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface HistoryItem {
  historyId: number;
  oldUuid: string;
  newUuid: string;
  filter: FilterType;
  createdAt: string;
  detections: Detection[];
}

export interface HistoryResponse {
  memberMeId: number;
  nickname: string;
  totalHistories: number;
  histories: HistoryItem[];
}

export interface HistoryDetailResponse {
  historyId: number;
  memberId: number;
  imageUuid: string;
  editedImageUrl: string;
  filter: FilterType;
  createdAt: string;
  detections: Detection[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.example.com/v1";
const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE_URL ?? "https://image.example.com/v1";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const mockHistoryResponse: HistoryResponse = {
  memberMeId: 12345,
  nickname: "safefriends_user",
  totalHistories: 6,
  histories: [
    {
      historyId: 789,
      oldUuid: "550e8400-e29b-41d4-a716-446655440000",
      newUuid: "550e8400-e29b-41d4-a716-446655440001",
      filter: "AI",
      createdAt: "2025-12-26T14:30:25Z",
      detections: [
        {
          detectId: 1001,
          category: "FACE",
          x: 120,
          y: 200,
          width: 150,
          height: 180,
          confidence: 0.9523,
        },
        {
          detectId: 1002,
          category: "TEXT",
          x: 50,
          y: 450,
          width: 200,
          height: 30,
          confidence: 0.8721,
        },
      ],
    },
    {
      historyId: 788,
      oldUuid: "4f1c6647-1209-4d4a-afc8-4a10953b0a11",
      newUuid: "4f1c6647-1209-4d4a-afc8-4a10953b0a12",
      filter: "BLUR",
      createdAt: "2025-12-25T10:15:00Z",
      detections: [
        {
          detectId: 1000,
          category: "QRBARCODE",
          x: 300,
          y: 100,
          width: 80,
          height: 80,
          confidence: 0.9912,
        },
      ],
    },
    {
      historyId: 777,
      oldUuid: "760f0c39-4fcd-447e-8e0e-158414c5c002",
      newUuid: "760f0c39-4fcd-447e-8e0e-158414c5c099",
      filter: "MOSAIC",
      createdAt: "2025-12-23T08:00:00Z",
      detections: [
        {
          detectId: 1003,
          category: "LOCATION",
          x: 88,
          y: 320,
          width: 160,
          height: 100,
          confidence: 0.9133,
        },
        {
          detectId: 1004,
          category: "TEXT",
          x: 40,
          y: 260,
          width: 120,
          height: 40,
          confidence: 0.8421,
        },
      ],
    },
    {
      historyId: 776,
      oldUuid: "9012e268-290a-41da-b3d6-0c76d4f556b5",
      newUuid: "9012e268-290a-41da-b3d6-0c76d4f556c1",
      filter: "BLUR",
      createdAt: "2025-12-22T18:25:00Z",
      detections: [
        {
          detectId: 1005,
          category: "FACE",
          x: 110,
          y: 180,
          width: 140,
          height: 170,
          confidence: 0.937,
        },
      ],
    },
    {
      historyId: 775,
      oldUuid: "c1b64a0f-3b9c-4f4c-b2b8-7f418a0cf1ba",
      newUuid: "c1b64a0f-3b9c-4f4c-b2b8-7f418a0cf1bb",
      filter: "AI",
      createdAt: "2025-12-21T15:00:00Z",
      detections: [
        {
          detectId: 1006,
          category: "FACE",
          x: 70,
          y: 150,
          width: 120,
          height: 120,
          confidence: 0.901,
        },
        {
          detectId: 1007,
          category: "LOCATION",
          x: 200,
          y: 320,
          width: 140,
          height: 120,
          confidence: 0.876,
        },
      ],
    },
    {
      historyId: 774,
      oldUuid: "a4cd2c26-4a89-4cb9-93d0-4a66f4154804",
      newUuid: "a4cd2c26-4a89-4cb9-93d0-4a66f4154805",
      filter: "MOSAIC",
      createdAt: "2025-12-20T11:00:00Z",
      detections: [
        {
          detectId: 1008,
          category: "ETC",
          x: 150,
          y: 250,
          width: 100,
          height: 100,
          confidence: 0.802,
        },
      ],
    },
  ],
};

const mockHistoryDetail: HistoryDetailResponse = {
  historyId: 789,
  memberId: 12345,
  imageUuid: "550e8400-e29b-41d4-a716-446655440000",
  editedImageUrl: `${IMAGE_BASE}/edited/550e8400-e29b-41d4-a716-446655440001.jpg`,
  filter: "AI",
  createdAt: "2025-12-26T14:30:25Z",
  detections: mockHistoryResponse.histories[0].detections,
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const buildImageUrl = (uuid: string, type: "original" | "edited") => {
  const suffix = type === "edited" ? "edited" : "original";
  return `${IMAGE_BASE}/${suffix}/${uuid}.jpg`;
};

export const isUsingMockHistoryApi = USE_MOCK;

export const fetchHistory: QueryFunction<HistoryResponse, ["history", number]> = async ({
  queryKey,
}) => {
  const [, memberId] = queryKey;

  if (USE_MOCK) {
    await delay(300);
    return mockHistoryResponse;
  }

  const response = await fetch(`${API_BASE}/history/${memberId}`);

  if (!response.ok) {
    throw new Error("Failed to load history data");
  }

  return response.json();
};

export const fetchHistoryDetail: QueryFunction<
  HistoryDetailResponse,
  ["history-detail", number]
> = async ({ queryKey }) => {
  const [, historyId] = queryKey;

  if (USE_MOCK) {
    await delay(200);
    return { ...mockHistoryDetail, historyId };
  }

  const response = await fetch(`${API_BASE}/history/detail/${historyId}`);

  if (!response.ok) {
    throw new Error("Failed to load history detail");
  }

  return response.json();
};
