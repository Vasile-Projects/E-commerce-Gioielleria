import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Button } from '../button/button';

@Component({
  selector: 'app-hero-section',
  imports: [Button],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  title    = input.required<string>();
  subtitle = input<string>('');
  imageUrl = input.required<string>();

  ctaClick = output<void>();

  onCtaClick(): void {
    this.ctaClick.emit();
  }
}
