import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'timeOnly'
})
export class TimeOnlyPipe implements PipeTransform {

  constructor(private datePipe: DatePipe) {}

  transform(value: any): any {
    // Formatea la fecha para obtener solo la hora y el minuto
    return this.datePipe.transform(value, 'HH:mm');
  }
}
