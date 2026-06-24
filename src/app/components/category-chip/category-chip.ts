import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Category } from '../../models/ui.models';

@Component({
  selector: 'app-category-chip',
  imports: [],
  templateUrl: './category-chip.html',
  styleUrl: './category-chip.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryChip {
  category = input.required<Category>();
  active   = input<boolean>(false);
  size     = input<'md' | 'sm'>('md');

  selected = output<Category>();
}
