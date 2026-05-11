// Camera API types based on backend response

export interface Ward {
  id: number;
  name: string;
  districtId: number;
  district: District | null;
}

export interface District {
  id: number;
  name: string;
  cityId: number;
  city: City | null;
}

export interface City {
  id: number;
  name: string;
}

export interface Stream {
  id: number;
  cameraId: number;
  streamUrl: string;
  quality: string;
  isActive: boolean;
}

export interface StatusLog {
  id: number;
  cameraId: number;
  status: string;
  timestamp: string;
  note: string | null;
}

export interface Camera {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  wardId: string;
  ward?: Ward | null;
  streamUrl: string | null;
  streams?: Stream[] | null;
  statusLogs?: StatusLog[] | null;
  status: string;
}

export interface CameraListResponse {
  total: number;
  page: number;
  pageSize: number;
  data: Camera[];
}

export interface CameraApiParams {
  page?: number;
  pageSize?: number;
  search?: string;
  /** Field name to sort by, e.g. "name", "status" */
  sortBy?: string;
}
