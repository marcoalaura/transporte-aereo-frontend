<template>
  <div class="log-datos" v-if="datos">
    <div>
      Creado por <strong>{{ datos._user_created }}</strong>
      el <strong>{{ $datetime.datetimeLiteral(datos._created_at) }}</strong>
    </div>
    <div v-if="datos._user_updated">
      Última edición por <strong>{{ datos._user_updated }}</strong>
      el <strong>{{ $datetime.datetimeLiteral(datos._updated_at) }}</strong>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      datos: {
        _user_created: null,
        _created_at: null,
        _user_updated: null,
        _updated_at: null
      }
    };
  },
  mounted () {
    if (this.data) {
      this.getUsers();
    }
  },
  methods: {
    getUsers () {
      let query;
      let variables;
      if (this.data._user_updated) {
        query = `
          query usuarios($usuarioC: Int!, $usuarioU: Int!) {
            usuarioC: usuarioOnlyToken(id: $usuarioC) {
              usuario
            }
            usuarioU: usuarioOnlyToken(id: $usuarioU) {
              usuario
            }
          }
        `;
        variables = {
          usuarioC: this.data._user_created,
          usuarioU: this.data._user_updated
        };
      } else {
        query = `
          query usuarios($usuarioC: Int!) {
            usuarioC: usuarioOnlyToken(id: $usuarioC) {
              usuario
            }
          }
        `;
        variables = {
          usuarioC: this.data._user_created
        };
      }
      this.$service.graphql({ query, variables })
      .then(response => {
        if (response) {
          if (response.usuarioC) {
            this.datos._user_created = response.usuarioC.usuario;
            this.datos._created_at = this.data._created_at;
          }
          if (response.usuarioU) {
            this.datos._user_updated = response.usuarioU.usuario;
            this.datos._updated_at = this.data._updated_at;
          }
        }
      });
    }
  }
};
</script>

<style lang="scss">
.log-datos {
  background-color: #eee;
  border: 1px solid #dfdfdf;
  padding: 8px 10px;
  font-size: 12px;
  color: #555;
  font-style: italic;
}
</style>
