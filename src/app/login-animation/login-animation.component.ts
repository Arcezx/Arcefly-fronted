import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-login-animation',
  standalone: true,
  imports: [CommonModule, LottieComponent],
  template: `
    <ng-lottie 
      [options]="options"
      (complete)="handleAnimationComplete()"
      class="fullscreen-animation"
    ></ng-lottie>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: white;
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .fullscreen-animation {
      width: 100%;
      height: 100%;
    }
  `]
})
export class LoginAnimationComponent {
  @Output() animationFinished = new EventEmitter<void>();

  options: AnimationOptions = {
    path: 'assets/animations/animacion.json',
    autoplay: true,
    loop: false
  };

  handleAnimationComplete() {
    this.animationFinished.emit(); // ✅ Se emite solo cuando termina la animación real
  }
}
