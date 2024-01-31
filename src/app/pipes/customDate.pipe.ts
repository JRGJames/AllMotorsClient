import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {}

  transform(value: any): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;

    if (!(date instanceof Date)) {
      console.error(`Invalid date format: ${value}`);
      return '';
    }

    return this.datePipe.transform(date, 'MM/yyyy') || '';
  }
}
