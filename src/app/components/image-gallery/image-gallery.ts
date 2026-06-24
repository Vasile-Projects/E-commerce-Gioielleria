import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { onImageError } from '../../utilities/image-error';

@Component({
  selector: 'app-image-gallery',
  imports: [],
  templateUrl: './image-gallery.html',
  styleUrl: './image-gallery.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGallery {
  images = input.required<string[]>();
  alt    = input<string>('');

  readonly activeIndex = signal(0);

  setActive(index: number): void {
    this.activeIndex.set(index);
  }

  protected readonly onImageError = onImageError;
}
