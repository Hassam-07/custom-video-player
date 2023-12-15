import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomVideoPlayerComponent } from './custom-video-player/custom-video-player.component';

@NgModule({
  declarations: [AppComponent, CustomVideoPlayerComponent],
  imports: [BrowserModule, ReactiveFormsModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
