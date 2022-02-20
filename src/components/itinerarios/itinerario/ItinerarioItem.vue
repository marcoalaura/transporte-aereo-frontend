<template>
  <v-container grid-list-md class="itinerario-item">
    <v-layout row wrap v-if="itinerario" :class="{ placeholder }">
      <v-flex xs2>
        <v-autocomplete
          label="Matrícula de vuelo"
          v-model="itinerario.id_aeronave"
          required
          class="required uppercase"
          :rules="$validate(['required'])"
          :items="aeronaves"
          item-value="value"
          :single-line="placeholder"
          item-text="text">
        </v-autocomplete>
      </v-flex>
      <v-flex xs2>
        <v-text-field
          label="VLO"
          v-model="itinerario.nro_vuelo"
          required
          class="required"
          :single-line="placeholder"
          :rules="$validate(['required'])"
          maxlength="5">
        </v-text-field>
      </v-flex>
      <v-flex xs2>
        <v-autocomplete
          label="ORI"
          v-model="itinerario.id_aeropuerto_salida"
          required
          class="required uppercase"
          :rules="$validate(['required'])"
          :cache-items="cache"
          :loading="loading"
          :items="aeropuertos"
          item-value="value"
          item-text="text"
          maxlength="3"
          :single-line="placeholder"
          :search-input.sync="buscarAeropuertos"
        ></v-autocomplete>
      </v-flex>
      <v-flex xs2>
        <v-autocomplete
          label="DES"
          v-model="itinerario.id_aeropuerto_llegada"
          required
          class="required uppercase"
          :rules="$validate(['required'])"
          :cache-items="cache"
          :loading="loading2"
          :items="aeropuertos2"
          item-value="value"
          item-text="text"
          maxlength="3"
          :single-line="placeholder"
          :search-input.sync="buscarAeropuertos2"
        ></v-autocomplete>
      </v-flex>
      <v-flex xs1>
        <!-- <v-text-field
          label="ETD"
          v-model="itinerario.hora_despegue"
          required
          class="required"
          :single-line="placeholder"
          :rules="$validate(['required', 'time'])"
          maxlength="5">
        </v-text-field> -->
        <time-picker
          model="hora_despegue"
          label="ETD"
          :data="itinerario"
          required
          :value="itinerario.hora_despegue"
          :single-line="placeholder"
          :rules="$validate(['required', 'time'])"
        ></time-picker>
      </v-flex>
      <v-flex xs1>
        <!-- <v-text-field
          label="ETA"
          v-model="itinerario.hora_aterrizaje"
          required
          class="required"
          :single-line="placeholder"
          :rules="[validarEtdEta]"
          maxlength="7">
        </v-text-field> -->
        <time-picker
          model="hora_aterrizaje"
          label="ETA"
          :data="itinerario"
          required
          plus
          :value="itinerario.hora_aterrizaje"
          :single-line="placeholder"
          :rules="[validarEtdEta]"
        ></time-picker>
      </v-flex>
      <v-flex xs2>
        <v-autocomplete
          label="Días de la semana"
          v-model="itinerario.dias_semana"
          :multiple="multiple"
          required
          class="required dia-autocomplete"
          :rules="$validate(['required'])"
          :items="dias"
          :single-line="placeholder"
          chips
          item-value="value"
          item-text="text">
          <template slot="selection" slot-scope="data">
            <v-chip
              :selected="data.selected"
              :disabled="data.disabled"
              :key="JSON.stringify(data.item.value)"
              class="chip--select-multi white--text"
              color="primary"
              small
              @input="data.parent.selectItem(data.item.value)"
            >
              {{ data.item.value }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import aeronaves from '@/components/itinerarios/aeronave/mixins/aeronaves';
import aeropuertos from '@/components/itinerarios/aeropuerto/mixins/aeropuertos';
import validate from '@/common/mixins/validate';
import TimePicker from '@/common/util/TimePicker';

const dias = [
  { value: '1', text: '(1) LUNES' },
  { value: '2', text: '(2) MARTES' },
  { value: '3', text: '(3) MIÉRCOLES' },
  { value: '4', text: '(4) JUEVES' },
  { value: '5', text: '(5) VIERNES' },
  { value: '6', text: '(6) SÁBADO' },
  { value: '7', text: '(7) DOMINGO' }
];

export default {
  components: {
    TimePicker
  },
  props: {
    itinerario: {
      type: Object,
      default: null
    },
    aeronaves: {
      type: Array,
      default: () => []
    },
    cache: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: Boolean,
      default: false
    }
  },
  mixins: [ aeronaves, aeropuertos, validate, TimePicker ],
  mounted () {
    if (this.itinerario) {
      if (this.itinerario.id_aeropuerto_salida) {
        this.aeropuertos = [{ value: this.itinerario.id_aeropuerto_salida, text: this.itinerario.aeropuerto_salida_codigo_iata }];
      }
      if (this.itinerario.id_aeropuerto_llegada) {
        this.aeropuertos2 = [{ value: this.itinerario.id_aeropuerto_llegada, text: this.itinerario.aeropuerto_llegada_codigo_iata }];
      }
    }
  },
  data () {
    return {
      multiple: true,
      aeropuertos: [],
      aeropuertos2: [],
      buscarAeropuertos: null,
      buscarAeropuertos2: null,
      dias,
      loading: false,
      loading2: false
    };
  },
  methods: {
    validarEtdEta () {
      let v1 = this.$validateTime(this.itinerario.hora_despegue);
      let v2 = this.$validateTimePlus(this.itinerario.hora_aterrizaje);
      // console.log('v1', v1, 'v2', v2);
      if (v1 !== true || v2 !== true) {
        return ('Formato de hora inválido.');
      }
      if (/(\+[1-9])$/.test(this.itinerario.hora_aterrizaje)) {
        return true;
      }
      let dIni = new Date();
      dIni.setHours(parseInt(this.itinerario.hora_despegue.split(':')[0]));
      dIni.setMinutes(parseInt(this.itinerario.hora_despegue.split(':')[1]));
      let dFin = new Date();
      dFin.setHours(parseInt(this.itinerario.hora_aterrizaje.split(':')[0]));
      dFin.setMinutes(parseInt(this.itinerario.hora_aterrizaje.split(':')[1]));
      if (dIni < dFin) {
        // aqui quizas agregar una comprobacion entre tiempo minimo de despegue y aterrizaje
        return true;
      }
      return 'Inválido. ETD debe ser menor a ETA';
    }
  },
  watch: {
    buscarAeropuertos (valor) {
      if (!this.itinerario || (this.itinerario && this.itinerario.aeropuerto_salida_codigo_iata !== valor)) {
        this.buscar(valor, 'aeropuertos', 'loading', 'id_aeropuerto_salida');
      }
    },
    buscarAeropuertos2 (valor) {
      if (!this.itinerario || (this.itinerario && this.itinerario.aeropuerto_llegada_codigo_iata !== valor)) {
        this.buscar(valor, 'aeropuertos2', 'loading2', 'id_aeropuerto_llegada');
      }
    }
  }
};
</script>

<style lang="scss">
.dia-autocomplete {
  margin-top: 6px;
  .v-chip {
    margin: 0 1px;
  }
}
</style>
