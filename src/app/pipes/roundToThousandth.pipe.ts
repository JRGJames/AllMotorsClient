import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundToThousandth'
})
export class RoundToThousandthPipe implements PipeTransform {
  transform(value: number | string): string {
    const numericValue: number = typeof value === 'string' ? parseFloat(value) : value as number;

    if (isNaN(numericValue)) {
      return '';  // Devuelve una cadena vacía si el valor no es un número válido
    }

    const roundedValue = Math.round(numericValue / 1000) * 1000;

    return roundedValue.toLocaleString('es-ES');
  }
}
