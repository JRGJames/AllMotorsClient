import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thousandSeparator'
})
export class ThousandSeparatorPipe implements PipeTransform {
  transform(value: number | string): string {
    let numericValue: number;

    if (typeof value === 'string') {
      // Intenta extraer el valor numérico de la cadena
      numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
    } else {
      numericValue = value as number;
    }

    if (isNaN(numericValue)) {
      return '';
    }

    const formattedValue = this.addThousandSeparator(numericValue);
    return formattedValue;
  }

  private addThousandSeparator(value: number): string {
    const stringValue = value.toFixed(0); // Convierte a entero y garantiza que no haya decimales

    return this.addSeparator(stringValue);
  }

  private addSeparator(value: string): string {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
}
