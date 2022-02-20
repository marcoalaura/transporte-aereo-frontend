'use strict';

import pad from './pad';

export default {
  install: Vue => {
    let instance = new Vue();
    const Util = instance.$util;

    const DatetimeService = {
      formatDate: 'dd/MM/YYYY',
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      days: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
      dayslong: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],

      transform (date) {
        if (date && typeof date === 'string') {
          date = date.split('-');
          if (date.length === 3) {
            return new Date(date[0], date[1] - 1, date[2], 0, 0, 0);
          }
        }
        return date;
      },

      format2 (date) {
        if (this.isDate(date)) {
          return this.sanitizeDateString(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`, 'date');
        }
        return date;
      },

      now (typeDate = false, format) {
        const now = new Date();
        let date = this.sanitizeDateString(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`, 'date');
        console.log('Date now', date);
        if (format && format === 'SIN_FORMATO') {
          return date;
        }
        date = date.split('-');
        date = new Date(date[0], date[1] - 1, date[2], 0, 0, 0);
        if (typeDate) {
          return date;
        }
        return this.replace(date, format || this.formatDate);
      },

      isDate (date) {
        if (Util.toType(date) === 'string') {
          date = this.convert(date);
        }
        return this.isValid(date);
      },

      isValid (date) {
        if (Util.toType(date) !== 'date') {
          return false;
        }
        return !isNaN(date.getTime());
      },

      convert (date, separator = '/', format) {
        if (date) {
          format = format || this.formatDate;
          date = date.split(separator);
          if (format === 'dd/MM/YYYY') {
            return new Date(date[2], date[1] - 1, date[0], 0, 0, 0);
          } else if (format === 'MM/dd/YYYY') {
            return new Date(date[2], date[0] - 1, date[1], 0, 0, 0);
          } else {
            return new Date(date[0], date[1] - 1, date[2], 0, 0, 0);
          }
        }
        return date;
      },

      sanitizeDateString (dateString, type = 'date') {
        const [year, month = 1, date = 1] = dateString.split('-');
        return `${year}-${pad(month)}-${pad(date)}`.substr(0, { date: 10, month: 7, year: 4 }[type]);
      }
    };

    Vue.prototype.$datetime = DatetimeService;
  }
};
