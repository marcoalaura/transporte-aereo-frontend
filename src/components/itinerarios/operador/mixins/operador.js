'use strict';

export default {
  methods: {
    getOperadores (filter, prop = null, todos = false) {
      this.$service.graphql({
        query: `
          query getOperadores {
            operadores(estado: ACTIVO, order: "tipo") {
              count
              rows {
                id
                sigla
                razon_social
              }
            }
          }
        `
      }).then(response => {
        if (response) {
          let items = response.operadores.rows;
          let operadores = [];
          items.map(item => {
            operadores.push({ value: item.id, text: item.sigla });
          });
          if ((filter || filter === 0) && this.filters[filter] && this.filters[filter].items) {
            if (todos) {
              let items = operadores.slice();
              items.unshift({ value: '', text: 'TODOS' });
              this.filters[filter].items = items;
            } else {
              this.filters[filter].items = operadores;
            }
          }
          if (prop) {
            this[prop] = operadores;
          }
        }
      });
    }
  }
};
