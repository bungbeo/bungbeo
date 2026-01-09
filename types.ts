
export type Resolution = '720p' | '1080p';
export type AspectRatio = '16:9' | '9:16';

export interface GenerationSettings {
  resolution: Resolution;
  aspectRatio: AspectRatio;
  prompt: string;
}

export enum SlotStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  READY = 'READY',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface VideoSlotState {
  id: number;
  status: SlotStatus;
  imageUrl: string | null;
  imageBytes: string | null;
  videoUrl: string | null;
  progress: string;
  error: string | null;
  settings: GenerationSettings;
}
