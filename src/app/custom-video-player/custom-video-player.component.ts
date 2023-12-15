import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-custom-video-player',
  templateUrl: './custom-video-player.component.html',
  styleUrls: ['./custom-video-player.component.scss'],
})
export class CustomVideoPlayerComponent {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  @ViewChild('volumeSlider') volumeSlider!: ElementRef;
  @ViewChild('videoContainer') videoContainer!: ElementRef;

  @ViewChild('muteButton') muteButton!: ElementRef;
  @ViewChild('volumeHighIcon') volumeHighIcon!: ElementRef;
  @ViewChild('volumeLowIcon') volumeLowIcon!: ElementRef;
  @ViewChild('volumeMutedIcon') volumeMutedIcon!: ElementRef;
  @ViewChild('timelineIndicator') timelineIndicator!: ElementRef;
  // @ViewChild('timelineContainer') timelineContainer!: ElementRef;
  @ViewChild('timeline', { static: true }) timeline!: ElementRef;
  @ViewChild('currentTimeElem') currentTimeElem!: ElementRef;
  @ViewChild('totalTimeElem') totalTimeElem!: ElementRef;

  isPlaying = false;
  volumeLevel = 'high';
  playbackRates = [1, 1.25, 1.5, 2];
  currentPlaybackRateIndex = 0;
  currentTime = '0:00';
  duration = '0:00';

  constructor(private renderer: Renderer2) {}
  ngAfterViewInit(): void {
    this.videoPlayer.nativeElement.addEventListener('timeupdate', () => {
      this.updateTimeDisplay();
    });
    this.videoPlayer?.nativeElement.addEventListener('volumechange', () => {
      this.updateVolume();
    });

    this.videoPlayer.nativeElement.addEventListener('loadedmetadata', () => {
      this.duration = this.formatDuration(
        this.videoPlayer.nativeElement.duration
      );
    });
    // this.videoPlayer.nativeElement.addEventListener('timeupdate', () => {
    //   this.currentTime = this.formatDuration(
    //     this.videoPlayer.nativeElement.currentTime
    //   );

    //   const percent =
    //     (this.videoPlayer.nativeElement.currentTime /
    //       this.videoPlayer.nativeElement.duration) *
    //     100;
    //   this.renderer.setStyle(
    //     this.timeline.nativeElement,
    //     '--progress-position',
    //     `${100 - percent}%`
    //   );
    // });
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
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.videoPlayer.nativeElement.play();
      !this.isPlaying;
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

  changePlaybackSpeed(): void {
    this.currentPlaybackRateIndex =
      (this.currentPlaybackRateIndex + 1) % this.playbackRates.length;
    const newPlaybackRate = this.playbackRates[this.currentPlaybackRateIndex];
    this.videoPlayer.nativeElement.playbackRate = newPlaybackRate;
  }
  updateTimeDisplay(): void {
    this.currentTime = this.formatDuration(
      this.videoPlayer.nativeElement.currentTime
    );
  }
  formatDuration(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
}
