import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Category } from '../../models/ui.models';

@Component({
  selector: 'app-category-tile',
  imports: [],
  templateUrl: './category-tile.html',
  styleUrl: './category-tile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryTile {
  category = input.required<Category>();

  selected = output<Category>();
}
