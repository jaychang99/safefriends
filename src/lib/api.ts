import axios from 'axios';
import {
  AUTH_EXPIRED_EVENT,
  AUTH_FORBIDDEN_EVENT,
  clearAuthSession,
  getAuthToken,
} from './auth';

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
  pii_type?: string;
}

export interface UploadResponse {
  imageUuid: string;
}

export interface SignupRequest {
  username: string;
  password: string;
  nickname: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  nickname: string;
  memberId?: number;
}

export interface MeResponse {
  id: number;
  nickname: string;
  username?: string;
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
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    // @ts-expect-error TODO: resolve error and assign a proper type
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      clearAuthSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
      }
    }
    if (status === 403 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_FORBIDDEN_EVENT));
    }
    return Promise.reject(error);
  },
);

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Array<{ message?: string }> }
      | undefined;
    if (data?.message) return data.message;
    const nestedMessage = data?.errors?.[0]?.message;
    if (nestedMessage) return nestedMessage;

    if (error.response?.status === 401) {
      return '아이디 또는 비밀번호가 올바르지 않아요.';
    }
    if (error.response?.status === 400) {
      return '입력값을 다시 확인해주세요.';
    }
    if (error.response?.status === 403) {
      return '접근 권한이 없어요.';
    }
  }

  return fallback;
};

export const signup = async (payload: SignupRequest) => {
  const { data } = await apiClient.post<AuthResponse>('/auth/signup', payload);
  return data;
};

export const login = async (payload: LoginRequest) => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const getMe = async () => {
  const { data } = await apiClient.get<MeResponse>('/users/me');
  return data;
};

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
