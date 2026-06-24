import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Category } from '../../models/ui.models';
import { CategoryChip } from '../category-chip/category-chip';

@Component({
  selector: 'app-filter-select',
  imports: [CategoryChip],
  templateUrl: './filter-select.html',
  styleUrl: './filter-select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSelect {
  categories     = input.required<Category[]>();
  activeId       = input<number | null>(null);
  allLabel       = input<string>('Tutti');
  placeholder    = input<string>('Seleziona...');

  categoryChange = output<Category | null>();

  readonly allCategory = computed<Category>(() => ({ id: 0, name: this.allLabel(), description: null }));
  readonly isAllActive = computed(() => this.activeId() === null);

  onAllSelect(): void {
    this.categoryChange.emit(null);
  }

  onSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (!value) {
      this.categoryChange.emit(null);
      return;
    }
    const cat = this.categories().find(c => c.id === Number(value));
    this.categoryChange.emit(cat ?? null);
  }
}
