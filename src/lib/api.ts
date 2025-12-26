import axios from 'axios';

export type FilterType = 'BLUR' | 'MOSAIC' | 'AI';

export type DetectCategory = 'QRBARCODE' | 'TEXT' | 'LOCATION' | 'FACE' | 'ETC';

export interface DetectionRegion {
  category: DetectCategory;
  x: number;
  y: number;
  width: number;
  height: number;
  detectId?: number;
  confidence?: number;
}

export interface UploadResponse {
  imageUuid: string;
}

export interface DetectRequest {
  imageUuid: string;
  detectTargets: DetectCategory[];
}

export interface DetectResponse {
  imageUuid: string;
  detections: DetectionRegion[];
  totalDetections: number;
}

export interface EditRequest {
  imageUuid: string;
  memberId: number;
  regions: DetectionRegion[];
  filter: FilterType;
}

export interface EditResponse {
  historyId: number;
  newUrl?: string;
  oldUrl?: string;
  newUuid: string;
  oldUuid: string;
  filter: FilterType;
  editedRegions: DetectionRegion[];
  createdAt: string;
}

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://192.168.68.196:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<UploadResponse>(
    '/images/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

  return data;
};

export const requestDetect = async (payload: DetectRequest) => {
  const { data } = await apiClient.post<DetectResponse>('/detect', payload);
  return data;
};

export const requestEdit = async (payload: EditRequest) => {
  const { data } = await apiClient.post<EditResponse>('/edit', payload);
  return data;
};
