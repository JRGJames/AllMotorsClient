import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thousandSeparator'
})
export class ThousandSeparatorPipe implements PipeTransform {
  transform(value: number | string): string {
    if (typeof value === 'string') {
      value = parseFloat(value);
    }

    if (isNaN(value)) {
      return '';
    }

    const formattedValue = value.toLocaleString('es-ES');
    return `${formattedValue}`;
  }
}
