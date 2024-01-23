import {
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
// import { initialVideoPlayerState } from './initialVideoPlayerState';
import { VideoPlayerState } from './VideoPlayerState';
@Component({
  selector: 'app-custom-video-player',
  templateUrl: './custom-video-player.component.html',
  styleUrls: ['./custom-video-player.component.scss'],
})
export class CustomVideoPlayerComponent {
  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('volumeSlider') volumeSliderRef!: ElementRef;
  @ViewChild('videoContainer') videoContainerRef!: ElementRef;
  @ViewChild('timelineIndicator') timelineIndicatorRef!: ElementRef;
  @ViewChild('timelineProgress') timelineProgressRef!: ElementRef;
  @ViewChild('timeline', { static: true }) timelineRef!: ElementRef;
  @ViewChild('currentTimeElem') currentTimeElemRef!: ElementRef;
  @ViewChild('totalTimeElem') totalTimeElemRef!: ElementRef;
  @ViewChild('rangeSlider') rangeSliderRef!: ElementRef;
  @ViewChild('speedOptions') speedOptionsRef!: ElementRef;
  @ViewChild('playbackSpeed') playbackSpeedRef!: ElementRef;

  videoPlayer!: HTMLVideoElement;
  volumeSlider!: ElementRef;
  videoContainer!: ElementRef;
  timelineIndicator!: ElementRef;
  timelineProgress!: ElementRef;
  timeline!: ElementRef;
  currentTimeElem!: ElementRef;
  totalTimeElem!: ElementRef;
  rangeSlider!: ElementRef;
  speedOptions!: ElementRef;
  playbackSpeed!: ElementRef;
  duration!: number;

  initialVideoPlayerState: VideoPlayerState = {
    isVideoError: false,
    isOnline: navigator.onLine,
    isPlaying: false,
    volumeLevel: 'high',
    playbackRates: [2, 1.5, 1, 0.75, 0.5],
    currentPlaybackRateIndex: 2,
    currentTime: '0:00',
    duration: '0:00',
    showSpeedOptions: false,
    chapters: [
      { name: 'Downloading', startTime: 0, endTime: 30 },
      { name: 'Installing', startTime: 30, endTime: 60 },
      { name: 'Completed', startTime: 60, endTime: 68 },
    ],
    activeChapterIndex: null,
  };
  constructor(
    private renderer: Renderer2,
    private zone: NgZone,
    private snackBar: MatSnackBar
  ) {}
  ngAfterViewInit(): void {
    if (
      this.videoPlayerRef &&
      this.volumeSliderRef &&
      this.videoContainerRef &&
      this.timelineIndicatorRef &&
      this.timelineProgressRef &&
      this.timelineRef &&
      this.currentTimeElemRef &&
      this.totalTimeElemRef &&
      this.rangeSliderRef &&
      this.speedOptionsRef &&
      this.playbackSpeedRef
    ) {
      this.videoPlayer = this.videoPlayerRef.nativeElement;
      this.timeline = this.timelineRef.nativeElement;
      this.timelineIndicator = this.timelineIndicatorRef.nativeElement;
      this.timelineProgress = this.timelineProgressRef.nativeElement;
      this.currentTimeElem = this.currentTimeElemRef.nativeElement;
      this.totalTimeElem = this.totalTimeElemRef.nativeElement;
      this.rangeSlider = this.rangeSliderRef.nativeElement;

      this.videoPlayer = this.videoPlayerRef.nativeElement;
      this.volumeSlider = this.volumeSliderRef.nativeElement;
      this.videoContainer = this.videoContainerRef.nativeElement;
      this.timelineIndicator = this.timelineIndicatorRef.nativeElement;
      this.timelineProgress = this.timelineProgressRef.nativeElement;
      this.timeline = this.timelineRef.nativeElement;
      this.currentTimeElem = this.currentTimeElemRef.nativeElement;
      this.totalTimeElem = this.totalTimeElemRef.nativeElement;
      this.rangeSlider = this.rangeSliderRef.nativeElement;
      this.speedOptions = this.speedOptionsRef.nativeElement;
      this.playbackSpeed = this.playbackSpeedRef.nativeElement;
      this.onVolumeChange();
    }
  }
  onVolumeChange(): void {
    // const volumeSlider = document.querySelector('.volume-slider') as HTMLInputElement;
    const volumeValue = parseFloat(this.rangeSliderRef.nativeElement.value);

    const fillPercentage = (volumeValue * 100).toFixed(2);
    const backgroundGradient = `linear-gradient(to right, #fff 0%, #fff ${fillPercentage}%, #a3a3a3 ${fillPercentage}%, #a3a3a3 100%)`;

    this.rangeSliderRef.nativeElement.style.background = backgroundGradient;
  }

  statusBarClick($event: MouseEvent) {
    const el = $event.target as HTMLElement;
    const clickX = $event.offsetX;
    const totalWidth = el.offsetWidth;

    const percentComplete = clickX / totalWidth;
    const duration = this.videoPlayerRef.nativeElement.duration;

    // Seek to the corresponding time
    this.videoPlayerRef.nativeElement.currentTime = duration * percentComplete;
  }

  togglePlayPause(): void {
    this.initialVideoPlayerState.isPlaying =
      !this.initialVideoPlayerState.isPlaying;
    if (this.initialVideoPlayerState.isPlaying) {
      this.videoPlayerRef.nativeElement.play();
      !this.initialVideoPlayerState.isPlaying;
    } else {
      this.videoPlayerRef.nativeElement.pause();
    }
  }

  toggleMute(): void {
    this.videoPlayerRef.nativeElement.muted =
      !this.videoPlayerRef.nativeElement.muted;

    this.toggleVolumeIcons();
  }
  private toggleVolumeIcons(): void {
    if (this.videoPlayerRef.nativeElement.muted) {
      this.initialVideoPlayerState.volumeLevel = 'muted';
    } else if (this.videoPlayerRef.nativeElement.volume >= 0.5) {
      this.initialVideoPlayerState.volumeLevel = 'high';
    } else {
      this.initialVideoPlayerState.volumeLevel = 'low';
    }
  }
  @HostListener('input', ['$event'])
  onVolumeSliderChange(event: any): void {
    const volumeValue = event.target.value;
    this.videoPlayerRef.nativeElement.volume = volumeValue;
    this.videoPlayerRef.nativeElement.muted = volumeValue === '0';

    // Update volume level and apply it to the container dataset
    this.updateVolume();
  }

  updateVolume(): void {
    const volumeLevel = this.calculateVolumeLevel();
    this.videoContainerRef.nativeElement.dataset.volumeLevel = volumeLevel;
  }

  calculateVolumeLevel(): string {
    const volume = this.videoPlayerRef.nativeElement.volume;

    if (this.videoPlayerRef.nativeElement.muted || volume === 0) {
      // this.volumeSlider.value = '0';
      this.toggleVolumeSliderIcons('muted');
      return 'muted';
    } else if (volume >= 0.5) {
      // this.volumeSlider.value = '0';
      this.toggleVolumeSliderIcons('high');
      return 'high';
    } else {
      this.toggleVolumeSliderIcons('low');
      return 'low';
    }
  }

  toggleVolumeSliderIcons(level: string): void {
    switch (level) {
      case 'muted':
        this.initialVideoPlayerState.volumeLevel = 'muted';
        break;
      case 'high':
        this.initialVideoPlayerState.volumeLevel = 'high';
        break;
      case 'low':
        this.initialVideoPlayerState.volumeLevel = 'low';
        break;
      default:
        break;
    }
  }
  toggleSpeedOptions(): void {
    this.initialVideoPlayerState.showSpeedOptions =
      !this.initialVideoPlayerState.showSpeedOptions;
  }

  setPlaybackRate(rate: number): void {
    if (this.videoPlayerRef) {
      this.videoPlayerRef.nativeElement.playbackRate = rate;
    }
    this.initialVideoPlayerState.currentPlaybackRateIndex =
      this.initialVideoPlayerState.playbackRates.indexOf(rate);

    // Remove 'active' class from all li elements
    this.speedOptionsRef.nativeElement
      .querySelectorAll('li')
      .forEach((li: HTMLElement) => {
        this.renderer.removeClass(li, 'active');
      });
    const clickedLi = this.speedOptionsRef.nativeElement.querySelector(
      `[data-speed="${rate}"]`
    );
    if (clickedLi) {
      this.renderer.addClass(clickedLi, 'active');
    }
    this.initialVideoPlayerState.showSpeedOptions = false;
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target?.classList?.contains('playback-speed')) {
      this.initialVideoPlayerState.showSpeedOptions = true;
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent): void {
    if (!this.speedOptionsRef.nativeElement.contains(event.relatedTarget)) {
      this.initialVideoPlayerState.showSpeedOptions = false;
    }
  }
  updateTimeDisplay(): void {
    this.initialVideoPlayerState.currentTime = this.formatDuration(
      this.videoPlayerRef.nativeElement.currentTime
    );
    this.updateActiveChapter();
  }
  formatDuration(time: number): string {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    const formattedHours = hours > 0 ? `${hours}:` : '';
    const formattedMinutes = `${
      minutes < 10 && hours > 0 ? '0' : ''
    }${minutes}`;
    const formattedSeconds = `${seconds < 10 ? '0' : ''}${seconds}`;

    return `${formattedHours}${formattedMinutes}:${formattedSeconds}`;
  }
  skip(duration: any): void {
    this.videoPlayerRef.nativeElement.currentTime += duration;
  }

  toggleFullScreen(): void {
    if (this.videoPlayerRef.nativeElement.requestFullscreen) {
      this.videoPlayerRef.nativeElement.requestFullscreen();
    }
    // else if (this.videoPlayerRef.nativeElement.requestFullScreen) {
    //   this.videoPlayerRef.nativeElement.mozRequestFullScreen();
    // } else if (this.videoPlayerRef.nativeElement.webkitRequestFullscreen) {
    //   this.videoPlayerRef.nativeElement.webkitRequestFullscreen();
    // } else if (this.videoPlayerRef.nativeElement.msRequestFullscreen) {
    //   this.videoPlayerRef.nativeElement.msRequestFullscreen();
    // }
  }

  updateTimeline(): void {
    const percentComplete =
      (this.videoPlayerRef.nativeElement.currentTime /
        this.videoPlayerRef.nativeElement.duration) *
      100;

    // Move the timeline indicator
    this.renderer.setStyle(
      this.timelineIndicatorRef.nativeElement,
      'left',
      percentComplete + '%'
    );

    // Divide the timeline into parts based on chapters
    const timelineParts = this.initialVideoPlayerState.chapters.map(
      (chapter) => {
        const partStart =
          (chapter.startTime / this.videoPlayerRef.nativeElement.duration) *
          100;
        const partEnd =
          (chapter.endTime / this.videoPlayerRef.nativeElement.duration) * 100;
        return { partStart, partEnd };
      }
    );

    const borderSize = 0.2; // Adjust the border size as needed

    // Create a linear gradient with black border between parts
    let gradient = `linear-gradient(to right, `;
    timelineParts.forEach((part, index) => {
      gradient += `#a3a3a3 ${part.partStart}%, #a3a3a3 ${
        part.partStart + borderSize
      }%, `;
      gradient += `#fff ${part.partStart + borderSize}%, #fff ${
        part.partEnd - borderSize
      }%, `;
      gradient += `#a3a3a3 ${part.partEnd - borderSize}%, #a3a3a3 ${
        part.partEnd
      }%`;

      if (index !== timelineParts.length - 1) {
        gradient += `, `;
      }
    });

    // Update the timeline progress
    this.renderer.setStyle(
      this.timelineRef.nativeElement,
      'background',
      gradient
    );
  }

  updateActiveChapter(): void {
    const currentTime = this.videoPlayerRef.nativeElement.currentTime;

    for (let i = 0; i < this.initialVideoPlayerState.chapters.length; i++) {
      const chapter = this.initialVideoPlayerState.chapters[i];
      if (currentTime >= chapter.startTime && currentTime < chapter.endTime) {
        this.initialVideoPlayerState.activeChapterIndex = i;
        return;
      }
    }

    // No active chapter found, reset index
    this.initialVideoPlayerState.activeChapterIndex = null;
  }
  calculateChapterWidth(chapterIndex: number): number {
    const chapter = this.initialVideoPlayerState.chapters[chapterIndex];
    const totalDuration = this.videoPlayerRef.nativeElement.duration;
    return ((chapter.endTime - chapter.startTime) / totalDuration) * 100;
  }

  @HostListener('window:online', ['$event'])
  onOnlineEvent(event: Event): void {
    this.zone.run(() => {
      this.initialVideoPlayerState.isOnline = navigator.onLine;
      this.initialVideoPlayerState.isOnline = true;
      // this.currentState = 'ONLINE';
      // Show a snackbar or perform any other actions when back online
    });
  }

  @HostListener('window:offline', ['$event'])
  onOfflineEvent(event: Event): void {
    this.zone.run(() => {
      this.initialVideoPlayerState.isOnline = false;
      // this.currentState = 'OFFLINE';
      this.showSnackbar();
    });
  }

  handleVideoError() {
    this.initialVideoPlayerState.isVideoError = true;
    // Disable other controls or perform additional actions as needed
  }
  showSnackbar(): void {
    const message = 'Internet issue. Try again';
    const action = 'Try Again';
    const config = new MatSnackBarConfig();
    config.panelClass = ['custom-snackbar-class'];
    config.duration = 5000;
    const snackBarRef = this.snackBar.open(message, action, config);
  }

  onTimeUpdate(): void {
    this.updateTimeDisplay();
    this.updateTimeline();
  }

  onVolumeUpdate(): void {
    this.updateVolume();
  }

  onVideoEnded(): void {
    this.initialVideoPlayerState.isPlaying = false;
  }

  onVideoLoadedMetadata(): void {
    this.initialVideoPlayerState.duration = this.formatDuration(
      // this.videoPlayer.duration
      (this.duration = this.videoPlayerRef.nativeElement.duration)
    );
  }
}
