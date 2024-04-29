import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'birthdate'
})
export class BirthdatePipe implements PipeTransform {

  transform(fecha: string): string {
    // Creamos un objeto Date a partir de la cadena de fecha proporcionada
    const fechaObj = new Date(fecha);

    // Obtenemos el día, el mes y el año de la fecha
    const dia = fechaObj.getDate();
    const mes = fechaObj.getMonth() + 1; // Los meses van de 0 a 11, por eso sumamos 1
    const año = fechaObj.getFullYear();

    // Formateamos el día, el mes y el año con dos dígitos cada uno
    const diaFormateado = dia < 10 ? `0${dia}` : dia.toString(); // Agregamos un cero si el día es menor que 10
    const mesFormateado = mes < 10 ? `0${mes}` : mes.toString(); // Agregamos un cero si el mes es menor que 10
    const añoFormateado = año.toString();

    // Concatenamos el día, el mes y el año con las barras en el formato deseado
    return `${diaFormateado}-${mesFormateado}-${añoFormateado}`;
  }

}
