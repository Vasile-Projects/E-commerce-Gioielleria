import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Category } from '../../models/ui.models';
import { CategoryChip } from '../category-chip/category-chip';

@Component({
  selector: 'app-filter-bar',
  imports: [CategoryChip],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBar {
  categories = input.required<Category[]>();
  activeId   = input<number | null>(null);
  allLabel   = input<string>('Tutti');
  size       = input<'md' | 'sm'>('md');

  categoryChange = output<Category | null>();

  readonly allCategory = computed<Category>(() => ({ id: 0, name: this.allLabel(), description: null }));
  readonly isAllActive = computed(() => this.activeId() === null);

  onCategorySelect(category: Category): void {
    this.categoryChange.emit(category.id === 0 ? null : category);
  }
}
