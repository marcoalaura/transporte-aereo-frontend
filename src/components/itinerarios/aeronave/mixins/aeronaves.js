export default {
  methods: {
    getAeronaves (idOperador) {
      this.$service.graphql({
        query: `
          query lista ($id: Int) {
            aeronaves(id_operador: $id, estado: ACTIVO) {
              count
              rows {
                id
                matricula
                estado
              }
            }
          }
        `,
        variables: {
          id: idOperador
        }
      }).then(response => {
        if (response) {
          let items = response.aeronaves.rows;
          let aeronaves = [];
          items.map(item => {
            aeronaves.push({ value: item.id, text: item.matricula });
          });
          this.aeronaves = aeronaves;
        }
      });
    }
  }
};
