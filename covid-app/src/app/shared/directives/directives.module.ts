import { NgbdSortableHeader } from 'src/app/shared/directives/sortable.directive';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [NgbdSortableHeader],
  imports: [
    CommonModule
  ],
  exports:[NgbdSortableHeader]
})
export class DirectivesModule { }
