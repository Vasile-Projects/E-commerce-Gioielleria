export const IMAGE_FALLBACK_SRC = '/images/jewelry-placeholder.svg';

export function onImageError(event: Event): void {
  (event.target as HTMLImageElement).src = IMAGE_FALLBACK_SRC;
}
