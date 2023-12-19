import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
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
  @ViewChild('rangeSlider') rangeSlider!: ElementRef;
  @ViewChild('speedOptions') speedOptions!: ElementRef;
  @ViewChild('playbackSpeed') playbackSpeed!: ElementRef;

  isPlaying = false;
  volumeLevel = 'high';
  playbackRates = [2, 1.5, 1, 0.75, 0.5];
  currentPlaybackRateIndex = 2;
  currentTime = '0:00';
  duration = '0:00';
  showSpeedOptions = false;

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
  toggleSpeedOptions(): void {
    this.showSpeedOptions = !this.showSpeedOptions;
  }

  setPlaybackRate(rate: number): void {
    if (this.videoPlayer) {
      this.videoPlayer.nativeElement.playbackRate = rate;
    }
    this.currentPlaybackRateIndex = this.playbackRates.indexOf(rate);

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
    this.showSpeedOptions = false;
  }

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target?.classList?.contains('playback-speed')) {
      this.showSpeedOptions = true;
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent): void {
    if (!this.speedOptions.nativeElement.contains(event.relatedTarget)) {
      this.showSpeedOptions = false;
    }
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
