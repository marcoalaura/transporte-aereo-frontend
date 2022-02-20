<template>
  <v-card>
    <v-card-title class="headline">
      <v-icon>add</v-icon> Agregar itinerario(s)
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <v-btn
          slot="activator"
          color="success"
          :disabled="itinerarios.length >= max"
          @click="agregar"><v-icon color="white">add</v-icon> Agregar itinerario</v-btn>
        <span>Agregar una nueva fila a la tabla</span>
      </v-tooltip>
      <v-btn icon @click="$store.commit('closeModal', 3)">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text class="pt-0 pb-0">
      <v-alert outline color="info" icon="info" :value="true">
        Agregue los itinerarios que necesite con el botón <strong>Agregar itinerario</strong> y para guardarlos presione el botón <strong>Guardar todo</strong>, puede ir agregando solo los que necesita y continuar llenando más adelante. Si toda tabla se llena de datos esta generará una nueva fila automáticamente. <strong>Elimine</strong> las filas que no necesite llenar con el botón de color rojo de cada fila.
      </v-alert>
    </v-card-text>
    <v-form
      ref="formAdd"
      @submit.prevent="guardar"
      lazy-validation>
      <v-card-text class="pt-0">
        <div class="itinerario-items">
          <div class="itinerario-container" v-for="(item, index) in itinerarios" :key="item.id">
            <itinerario-item
              :aeronaves="aeronaves"
              :itinerario="item"
              :placeholder="true"
              :cache="true">
            </itinerario-item>
            <div class="itinerario-buttons" v-if="index">
              <v-tooltip bottom>
                <v-btn slot="activator" color="error" @click="eliminar(item.id)" small><v-icon>delete</v-icon></v-btn>
                <span>Eliminar fila</span>
              </v-tooltip>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-icon color="info">info</v-icon>
        <div class="subheading info--text">
          <strong>VLO:</strong> Vuelo
        </div>
        <div class="subheading info--text">
          <strong>ORI:</strong> Origen
        </div>
        <div class="subheading info--text">
          <strong>DES:</strong> Destino
        </div>
        <div class="subheading info--text">
          <strong>ETD:</strong> Hora de despegue
        </div>
        <div class="subheading info--text">
          <strong>ETA:</strong> Hora de aterrizaje (+1 indica un dia después. ej: 08:00+1)
        </div>
        <v-spacer></v-spacer>
        <v-btn @click.native="$store.commit('closeModal', 3)"><v-icon>cancel</v-icon> {{ $t('common.cancel') }}</v-btn>
        <v-btn color="primary" type="submit"><v-icon dark>check</v-icon> Guardar todo</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import ItinerarioItem from './ItinerarioItem';

const itinerario = {
  id: '',
  id_aeronave: '',
  nro_vuelo: '',
  id_aeropuerto_salida: '',
  id_aeropuerto_llegada: '',
  hora_despegue: '',
  hora_aterrizaje: '',
  dia_semana: '',
  id_solicitud: ''
};

export default {
  props: {
    aeronaves: {
      type: Array,
      default: () => []
    },
    idSolicitud: {
      type: Number,
      default: 0
    }
    // iataOperador: {
    //   type: String,
    //   default: null
    // },
    // icaoOperador: {
    //   type: String,
    //   default: null
    // }
  },
  components: {
    ItinerarioItem
  },
  mounted () {
    setTimeout(() => {
      if (this.aeronaves.length === 0) {
        this.$alert('No tiene aeronaves asignadas a su operador, asignelas antes de crear itinerarios.', () => {
          this.$store.commit('setAction', { action: 'agregar', sleep: 1500 });
          this.$router.push('/aeronaves');
        });
      }
    }, 1000);
    this.itinerarios = Array(2).fill().map((_, i) => {
      let item = Object.assign({}, itinerario);
      item.id = i + 1;
      item.id_solicitud = this.idSolicitud;
      return item;
    });
  },
  data () {
    return {
      itinerarios: [],
      deleted: false,
      max: 50
    };
  },
  methods: {
    guardar () {
      if (this.$refs.formAdd.validate()) {
        this.$service.post('itinerario/itinerario/save-all', { itinerarios: this.itinerarios })
          .then(response => {
            if (response) {
              this.$store.commit('setAction', { action: 'validar', sleep: 100 });
              this.$message.success('Itinerarios agregados');
              this.$store.commit('closeModal', 3);
            }
          });
      }
    },
    agregar () {
      if (this.itinerarios.length < this.max) {
        let item = Object.assign({}, itinerario);
        item.id = this.itinerarios[this.itinerarios.length - 1].id + 1;
        item.id_solicitud = this.idSolicitud;
        this.itinerarios.push(item);
      } else {
        this.$message.show('Demasiados itinerarios para llenar');
      }
    },
    eliminar (id) {
      this.deleted = true;
      for (let i in this.itinerarios) {
        if (parseInt(this.itinerarios[i].id) === id) {
          this.itinerarios.splice(i, 1);
          break;
        }
      }
      setTimeout(() => {
        this.deleted = false;
      }, 1000);
    }
  },
  watch: {
    'itinerarios': {
      handler (items) {
        if (!this.deleted) {
          let fill = true;
          for (let i in items) {
            const item = items[i];
            for (let key in item) {
              if (this.$filter.empty(item[key])) {
                fill = false;
                break;
              }
            }
          }
          if (fill) {
            this.agregar();
          }
        }
      },
      deep: true
    }
  }
};
</script>

<style lang="scss">
.itinerario-items {
  counter-reset: section;
  margin-top: 30px;

  .itinerario-container {
    position: relative;
  }

  .itinerario-buttons {
    position: absolute;
    right: 8px;
    top: 16px;

    .v-btn {
      min-width: 42px;
    }
  }

  .itinerario-item {
    position: relative;
    padding: 0 50px 0 30px;

    &::before {
      position: absolute;
      counter-increment: section;
      content: counter(section) ".";
      left: 5px;
      top: 26px;
      font-size: 1rem;
    }
  }
}
</style>
