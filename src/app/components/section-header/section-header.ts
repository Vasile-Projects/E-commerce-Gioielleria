import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  imports: [],
  templateUrl: './section-header.html',
  styleUrl: './section-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeader {
  label       = input<string>('');
  title       = input.required<string>();
  align       = input<'start' | 'center'>('start');
  showDivider = input<boolean>(true);
}
