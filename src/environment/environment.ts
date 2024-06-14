import { HttpHeaders } from "@angular/common/http";

export const API_URL: string = 'http://localhost:8083';
export const API_URL_MEDIA: string = 'http://localhost:8083/media/';

export const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8'
    })
};

export const CALENDAR_ES = {
    firstDayOfWeek: 1,
    dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    today: 'Hoy',
    clear: 'Borrar',
    dateFormat: 'mm/dd/yyyy',
}

export const CALENDAR_EN = {
    firstDayOfWeek: 1,
    dayNames: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    dayNamesShort: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    dayNamesMin: ['S', 'M', 'T', 'W ', 'T', 'F', 'S'],
    monthNames: ['january', 'february', 'march', 'april', 'may', 'jun', 'july', 'august', 'september', 'october', 'november', 'december'],
    monthNamesShort: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'],
    today: 'Today',
    clear: 'Clear',
    dateFormat: 'mm/dd/yyyy',
}

export const CALENDAR_IT = {
    firstDayOfWeek: 1,
    dayNames: ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'],
    dayNamesShort: ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'G', 'V', 'S'],
    monthNames: ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'augusto', 'settembre', 'ottobre', 'novembre', 'dicembre'],
    monthNamesShort: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'aug', 'set', 'ott', 'nov', 'dic'],
    today: 'Oggi',
    clear: 'Cancella',
    dateFormat: 'mm/dd/yyyy',
}

export const CALENDAR_FR = {
    firstDayOfWeek: 1,
    dayNames: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
    dayNamesShort: ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'],
    dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    monthNames: ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'august', 'septembre', 'octobre', 'novembre', 'decembre'],
    monthNamesShort: ['jan', 'fev', 'mar', 'avr', 'mai', 'juin', 'juil', 'aug', 'sept', 'oct', 'nov', 'dec'],
    today: 'Aujourd\'hui',
    clear: 'Effacer',
    dateFormat: 'mm/dd/yyyy',
}