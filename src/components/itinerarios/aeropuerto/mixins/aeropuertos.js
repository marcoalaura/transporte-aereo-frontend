export default {
  methods: {
    buscar (valor, prop, loading, key, item) {
      if (!this.$filter.empty(valor)) {
        this[loading] = true;
        this.$service.graphql({
          query: `
            query search($valor: String) {
              aeropuertos(codigo_iata: $valor, limit: 20) {
                count
                rows {
                  id
                  codigo_iata
                  estado
                }
              }
            }
          `,
          variables: { valor }
        }).then(response => {
          this[loading] = false;
          if (response) {
            let items = response.aeropuertos.rows;
            let aeropuertos = [];
            items.map(item => {
              aeropuertos.push({ value: item.id, text: item.codigo_iata });
            });
            this[prop] = aeropuertos;
            if (item && key) {
              setTimeout(() => {
                console.log('set data', item[key]);
                item[key] = item[key];
              }, 1000);
            }
          } else {
            this[prop] = [];
          }
        });
      }
    }
  }
};
