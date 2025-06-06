import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';

@Injectable()
export class PaginatorI18nService implements MatPaginatorIntl {
  changes = new Subject<void>();

  itemsPerPageLabel = 'Elementos por página';
  nextPageLabel = 'Siguiente página';
  previousPageLabel = 'Página anterior';
  firstPageLabel = 'Primera página';
  lastPageLabel = 'Última página';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;
    
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  }
}