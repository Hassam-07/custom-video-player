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

// class initialVideoPlayerState {
//   isVideoError: boolean = false;
//   isOnline = navigator.onLine;
//   isPlaying: boolean = false;
//   volumeLevel: string = 'high';
//   playbackRates: number[] = [2, 1.5, 1, 0.75, 0.5];
//   currentPlaybackRateIndex: number = 2;
//   currentTime: string = '0:00';
//   duration: string = '0:00';
//   showSpeedOptions: boolean = false;
//   chapters: { name: string; startTime: number; endTime: number }[] = [
//     { name: 'Downloading', startTime: 0, endTime: 30 },
//     { name: 'Installing', startTime: 30, endTime: 60 },
//     { name: 'Completed', startTime: 60, endTime: 68 },
//   ];
//   activeChapterIndex: number | null = null;
// }
@Component({
  selector: 'app-custom-video-player',
  templateUrl: './custom-video-player.component.html',
  styleUrls: ['./custom-video-player.component.scss'],
})
export class CustomVideoPlayerComponent {
  // initialVideoPlayerState: initialVideoPlayerState = new initialVideoPlayerState();
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('volumeSlider') volumeSlider!: ElementRef;
  @ViewChild('videoContainer') videoContainer!: ElementRef;

  @ViewChild('muteButton') muteButton!: ElementRef;
  @ViewChild('volumeHighIcon') volumeHighIcon!: ElementRef;
  @ViewChild('volumeLowIcon') volumeLowIcon!: ElementRef;
  @ViewChild('volumeMutedIcon') volumeMutedIcon!: ElementRef;
  @ViewChild('timelineIndicator') timelineIndicator!: ElementRef;
  @ViewChild('timelineProgress') timelineProgress!: ElementRef;
  @ViewChild('timeline', { static: true }) timeline!: ElementRef;
  @ViewChild('currentTimeElem') currentTimeElem!: ElementRef;
  @ViewChild('totalTimeElem') totalTimeElem!: ElementRef;
  @ViewChild('rangeSlider') rangeSlider!: ElementRef;
  @ViewChild('speedOptions') speedOptions!: ElementRef;
  @ViewChild('playbackSpeed') playbackSpeed!: ElementRef;

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
    this.videoPlayer.nativeElement.addEventListener('timeupdate', () => {
      this.updateTimeDisplay();
      this.updateTimeline();
    });
    this.videoPlayer?.nativeElement.addEventListener('volumechange', () => {
      this.updateVolume();
    });
    this.videoPlayer.nativeElement.addEventListener('ended', () => {
      this.initialVideoPlayerState.isPlaying = false;
    });

    this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
      this.initialVideoPlayerState.duration = this.formatDuration(
        this.videoPlayer.nativeElement.duration
      );
    });
    this.onVolumeChange();
  }
  onVolumeChange(): void {
    // const volumeSlider = document.querySelector('.volume-slider') as HTMLInputElement;
    const volumeValue = parseFloat(this.rangeSlider.nativeElement.value);

    const fillPercentage = (volumeValue * 100).toFixed(2);
    const backgroundGradient = `linear-gradient(to right, #fff 0%, #fff ${fillPercentage}%, #a3a3a3 ${fillPercentage}%, #a3a3a3 100%)`;

    this.rangeSlider.nativeElement.style.background = backgroundGradient;
  }

  statusBarClick($event: MouseEvent) {
    const el = $event.target as HTMLElement;
    const clickX = $event.offsetX;
    const totalWidth = el.offsetWidth;

    const percentComplete = clickX / totalWidth;
    const duration = this.videoPlayer.nativeElement.duration;

    // Seek to the corresponding time
    this.videoPlayer.nativeElement.currentTime = duration * percentComplete;
  }

  togglePlayPause(): void {
    this.initialVideoPlayerState.isPlaying =
      !this.initialVideoPlayerState.isPlaying;
    if (this.initialVideoPlayerState.isPlaying) {
      this.videoPlayer.nativeElement.play();
      !this.initialVideoPlayerState.isPlaying;
    } else {
      this.videoPlayer.nativeElement.pause();
    }
  }

  toggleMute(): void {
    this.videoPlayer.nativeElement.muted =
      !this.videoPlayer.nativeElement.muted;

    this.toggleVolumeIcons();
  }
  private toggleVolumeIcons(): void {
    const { volumeHighIcon, volumeLowIcon, volumeMutedIcon } = this;

    if (this.videoPlayer.nativeElement.muted) {
      // Display volume-muted-icon
      this.renderer.setStyle(volumeMutedIcon.nativeElement, 'display', 'block');
      // Hide volume-high-icon and volume-low-icon
      this.renderer.setStyle(volumeHighIcon.nativeElement, 'display', 'none');
      this.renderer.setStyle(volumeLowIcon.nativeElement, 'display', 'none');
    } else {
      // Display volume-high-icon
      this.renderer.setStyle(volumeHighIcon.nativeElement, 'display', 'block');
      // Hide volume-muted-icon and volume-low-icon
      this.renderer.setStyle(volumeMutedIcon.nativeElement, 'display', 'none');
      this.renderer.setStyle(volumeLowIcon.nativeElement, 'display', 'none');
    }
  }
  @HostListener('input', ['$event'])
  onVolumeSliderChange(event: any): void {
    const volumeValue = event.target.value;
    this.videoPlayer.nativeElement.volume = volumeValue;
    this.videoPlayer.nativeElement.muted = volumeValue === '0';

    // Update volume level and apply it to the container dataset
    this.updateVolume();
  }

  updateVolume(): void {
    const volumeLevel = this.calculateVolumeLevel();
    this.videoContainer.nativeElement.dataset.volumeLevel = volumeLevel;
  }

  calculateVolumeLevel(): string {
    const volume = this.videoPlayer.nativeElement.volume;

    if (this.videoPlayer.nativeElement.muted || volume === 0) {
      // this.volumeSlider.nativeElement.value = '0';
      this.toggleVolumeSliderIcons('muted');
      return 'muted';
    } else if (volume >= 0.5) {
      // this.volumeSlider.nativeElement.value = '0';
      this.toggleVolumeSliderIcons('high');
      return 'high';
    } else {
      this.toggleVolumeSliderIcons('low');
      return 'low';
    }
  }

  toggleVolumeSliderIcons(level: string): void {
    const { volumeHighIcon, volumeLowIcon, volumeMutedIcon } = this;

    switch (level) {
      case 'muted':
        this.renderer.setStyle(
          volumeMutedIcon.nativeElement,
          'display',
          'block'
        );
        this.renderer.setStyle(volumeHighIcon.nativeElement, 'display', 'none');
        this.renderer.setStyle(volumeLowIcon.nativeElement, 'display', 'none');
        break;
      case 'high':
        this.renderer.setStyle(
          volumeHighIcon.nativeElement,
          'display',
          'block'
        );
        this.renderer.setStyle(
          volumeMutedIcon.nativeElement,
          'display',
          'none'
        );
        this.renderer.setStyle(volumeLowIcon.nativeElement, 'display', 'none');
        break;
      case 'low':
        this.renderer.setStyle(volumeLowIcon.nativeElement, 'display', 'block');
        this.renderer.setStyle(volumeHighIcon.nativeElement, 'display', 'none');
        this.renderer.setStyle(
          volumeMutedIcon.nativeElement,
          'display',
          'none'
        );
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
    if (this.videoPlayer) {
      this.videoPlayer.nativeElement.playbackRate = rate;
    }
    this.initialVideoPlayerState.currentPlaybackRateIndex =
      this.initialVideoPlayerState.playbackRates.indexOf(rate);

    // Remove 'active' class from all li elements
    this.speedOptions.nativeElement
      .querySelectorAll('li')
      .forEach((li: HTMLElement) => {
        this.renderer.removeClass(li, 'active');
      });
    const clickedLi = this.speedOptions.nativeElement.querySelector(
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
    if (!this.speedOptions.nativeElement.contains(event.relatedTarget)) {
      this.initialVideoPlayerState.showSpeedOptions = false;
    }
  }
  updateTimeDisplay(): void {
    this.initialVideoPlayerState.currentTime = this.formatDuration(
      this.videoPlayer.nativeElement.currentTime
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
    this.videoPlayer.nativeElement.currentTime += duration;
  }

  toggleFullScreen(): void {
    if (this.videoPlayer.nativeElement.requestFullscreen) {
      this.videoPlayer.nativeElement.requestFullscreen();
    } else if (this.videoPlayer.nativeElement.mozRequestFullScreen) {
      this.videoPlayer.nativeElement.mozRequestFullScreen();
    } else if (this.videoPlayer.nativeElement.webkitRequestFullscreen) {
      this.videoPlayer.nativeElement.webkitRequestFullscreen();
    } else if (this.videoPlayer.nativeElement.msRequestFullscreen) {
      this.videoPlayer.nativeElement.msRequestFullscreen();
    }
  }

  updateTimeline(): void {
    const percentComplete =
      (this.videoPlayer.nativeElement.currentTime /
        this.videoPlayer.nativeElement.duration) *
      100;

    // Move the timeline indicator
    this.renderer.setStyle(
      this.timelineIndicator.nativeElement,
      'left',
      percentComplete + '%'
    );

    // Divide the timeline into parts based on chapters
    const timelineParts = this.initialVideoPlayerState.chapters.map(
      (chapter) => {
        const partStart =
          (chapter.startTime / this.videoPlayer.nativeElement.duration) * 100;
        const partEnd =
          (chapter.endTime / this.videoPlayer.nativeElement.duration) * 100;
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
    this.renderer.setStyle(this.timeline.nativeElement, 'background', gradient);
  }

  updateActiveChapter(): void {
    const currentTime = this.videoPlayer.nativeElement.currentTime;

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
    const totalDuration = this.videoPlayer.nativeElement.duration;
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
}
