export interface VideoPlayerState {
  isVideoError: boolean;
  isOnline: boolean;
  isPlaying: boolean;
  volumeLevel: string;
  playbackRates: number[];
  currentPlaybackRateIndex: number;
  currentTime: string;
  duration: string;
  showSpeedOptions: boolean;
  chapters: { name: string; startTime: number; endTime: number }[];
  activeChapterIndex: number | null;
}
