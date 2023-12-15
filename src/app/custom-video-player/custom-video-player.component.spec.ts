import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomVideoPlayerComponent } from './custom-video-player.component';

describe('CustomVideoPlayerComponent', () => {
  let component: CustomVideoPlayerComponent;
  let fixture: ComponentFixture<CustomVideoPlayerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomVideoPlayerComponent]
    });
    fixture = TestBed.createComponent(CustomVideoPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
