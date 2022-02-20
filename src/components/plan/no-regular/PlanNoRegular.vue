<template>
  <section>
    <h3 class='primary--text'><v-icon color='primary'>local_airport</v-icon> Plan de Vuelos No Regulares</h3>
    <v-card>
      <v-tabs
        v-model="active"
        class="tab-listado"
        color="info"
        dark
        slider-color="warning">

        <!-- tabs -->
        <v-tab
          key="planes"
          href="#planes"
          id="planes"
          ripple>
          <v-icon>local_airport</v-icon> Planes No Regulares
        </v-tab>
        <v-tab-item key="planes" id="planes">
          <v-card-text>
            <div class="filter-container mb-3">
              <v-container grid-list-md class="p-0 m-0">
                <!-- filtros -->
                <v-layout row wrap>
                  <v-flex md3>
                    <!-- fecha -->
                    <v-menu
                      ref="menu1"
                      :close-on-content-click="false"
                      v-model="menu1"
                      :nudge-right="40"
                      lazy
                      transition="scale-transition"
                      offset-y
                      full-width
                      max-width="290px"
                      min-width="290px"
                    >
                      <v-text-field
                        slot="activator"
                        v-model="fechaBusqueda"
                        label="En Fecha"
                        placeholder="AAAA-MM-DD"
                        prepend-icon="event"
                      ></v-text-field>
                      <v-date-picker v-model="fechaBusqueda" no-title @input="menu1 = false"></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <!-- aeropuerto codigo iata -->
                  <v-flex md3>
                    <v-text-field
                      label-model="search['Aed_Origen']"
                      label="Aeropuerto Origen"
                    ></v-text-field>
                  </v-flex>
                  <v-flex md3>
                    <v-text-field
                      v-model="search['Matricula']"
                      label="Matrícula"
                    ></v-text-field>
                  </v-flex>
                  <v-flex md3>
                    <v-text-field
                      v-model="search['Cod_PlanVuelo']"
                      label="código de plan de vuelo"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </div>
            <!-- renderizado de objetos -->
            <v-data-table
              :headers="headers"
              :items="filtrados"
              :loading="cargandoLista"
              :rows-per-page-items="[20, 50, 150]"
              noResultsText="No se encontraron registros que coincidan"
              noDataText="No hay resultados"
            >
              <template slot="items" slot-scope="props">
                <td> {{ props.item.Cod_PlanVuelo }} </td>
                <td>
                  <v-tooltip bottom>
                    <v-btn
                      slot="activator"
                      small
                      @click="verDetallePlanVuelo(props.item)">
                      <v-icon>playlist_add_check</v-icon> Ver detalles
                    </v-btn>
                    <span>Ver detalles del plan de vuelo no regular</span>
                  </v-tooltip>
                </td>
                <td>
                  <v-chip
                    label
                    v-if="props.item.estado"
                    :color="estados[adaptarEstado(props.item.estado)].bg"
                    :text-color="estados[adaptarEstado(props.item.estado)].color"
                  >
                    {{ estados[adaptarEstado(props.item.estado)].text }}
                  </v-chip>
                  <v-chip
                    label
                    v-else
                    :color="estados['CREADO'].bg"
                    :text-color="estados['CREADO'].color"
                  >
                    NO ATENDIDO
                  </v-chip>
                </td>
                <td>{{ props.item.Fecha_registro }}</td>
                <!-- <td> {{ props.item.codaerodromo.detalle }}</td> -->
                <td>{{ props.item.Aed_Origen }}</td>
                <td>{{ props.item.Aed_Dest }}</td>
                <td>{{ props.item.Matricula }}</td>
                <!-- <td>{{ formatoHora(props.item.Hora) }}</td> -->
                <td>{{ props.item.Hora }}</td>
              </template>
            </v-data-table>
          </v-card-text>
        </v-tab-item>
      </v-tabs>
    </v-card>
    <v-dialog v-model="$store.state.modal7" max-width="700" persistent>
      <plan-vuelo-no-regular
        :planVuelo="planVuelo"
        :listaProps="listaProps"
        :camposExcluidos="['apmaterno', 'appaterno', 'nrocelular', 'selvassuperviviencia', 'codusuario', 'login', 'nrolicencia', 'tipousuario', 'correo', 'nombre', 'telefono', 'clave', 'codusuarioaroais', '_user_created', '_user_updated', '_created_at', '_updated_at']"
        :pendientesAprobacion="planVueloPendientesAprobacion"
        :puedeAprobar="planVueloPuedeAprobar"
      ></plan-vuelo-no-regular>
    </v-dialog>
  </section>
</template>

<script>
import CrudTable from '@/common/util/crud-table/CrudTable';
// import crud from '@/common/util/crud-table/mixins/crud-table';
import PlanVueloNoRegular from '@/components/plan/no-regular/PlanVueloNoRegular';

const estados = {
  CREADO: { text: 'CREADO', color: 'black', bg: 'default' },
  OBSERVADO: { text: 'OBSERVADO', color: 'white', bg: 'orange' },
  RECHAZADO: { text: 'RECHAZADO', color: 'white', bg: 'error' },
  APROBADO_FELCN: { text: 'APROBADO FELCN', color: 'white', bg: 'info' },
  APROBADO: { text: 'APROBADO', color: 'white', bg: 'success' }
};

export default {
  components: {
    CrudTable,
    PlanVueloNoRegular
  },
  created () {
    this.headers = [
      { text: 'Cod.', value: 'Cod_PlanVuelo' },
      { text: 'Acciones', sortable: false },
      { text: 'Estado', value: 'estado' },
      { text: 'Fecha Registro', value: 'fecharegistro' },
      { text: 'Origen', value: 'codaerodromo.detalle' },
      { text: 'Destino', value: 'aerodromodestino' },
      { text: 'Matrícula aeronave', value: 'identificacionaeronave' },
      { text: 'Hora salida', value: 'hora' }
    ];
  },
  data () {
    return {
      estados,
      headers: [],
      // url: 'plan/planesVueloNoRegular/inicio/fin',
      url: 'plan/planesVueloNoRegular/', // lista completa
      filters: [],
      order: ['fecharegistro', 'DESC'],
      graphql: false,
      dataGraphql: `
        id
        cod_plan_vuelo
        detalle
        estado
      `,
      active: 'planes',
      codPlanVuelo: null,
      // consultaFechaInicio:
      headersConsultas: [
        {
          text: 'Actions',
          value: ''
        },
        {
          text: 'Código Plan de Vuelo',
          sortable: false,
          value: 'codplanvuelo'
        },
        { text: 'Aeródromo Alterno', value: 'aerodromoalterno' },
        { text: 'Aeródromo Destino', value: 'aerodromodestino' },
        { text: 'Codigo Aeródromo', value: 'codaerodromo' },
        { text: 'Aeronave', value: 'identificacionaeronave' }
      ],
      // Lista de planes de vuelos regulares
      listaProps: [],
      planVuelos: [],
      // Plan de vuelo regular por ID
      planVuelo: {},
      planVueloPendientesAprobacion: [],
      planVueloPuedeAprobar: false,
      cargandoLista: true,
      // varios
      menu1: false,
      fechaBusqueda: '',
      search: {},
      aeropuerto: '',
      matricula: '',
      codigoPlanVuelo: ''
    };
  },
  mounted () {
    this.cargarLista();
  },
  computed: {
    filtrados () {
      // console.log('>>>>>>>>', JSON.stringify(this.search), Object.keys(this.search).length);

      if (Object.keys(this.search).length > 0) {
        let lista = [];
        for (let i = 0; i < this.planVuelos.length; i++) {
          // valores par filtrar de la lista de filtros
          let incluir = false;
          for (let key in this.search) {
            let val = this.search[key];
            if (val === '') {
              delete this.search[key];
              incluir = true;
              // ya no hay mas llaves retornar la lista completa
              if (Object.keys(this.search).length === 0) {
                return this.planVuelos;
              }
              break;
            }
            // if (val.toLowerCase() === this.planVuelos[i][key].toLowerCase()) { // comparacion estricta
            if (this.planVuelos[i][key].toLowerCase().indexOf(val.toLowerCase()) !== -1) {
              incluir = true;
              break;
            }
          }
          if (incluir) {
            lista.push(this.planVuelos[i]);
          }
        }
        console.log(this.planVuelos.length);
        return lista;
      } else {
        console.log(this.planVuelos.length);
        return this.planVuelos;
      }
    }
  },
  methods: {
    verDetallePlanVuelo (item) {
      if (!item.Cod_PlanVuelo) {
        this.codPlanVuelo = item.codplanvuelo;
      } else {
        this.codPlanVuelo = item.Cod_PlanVuelo;
      }
      let url = `plan/planVueloNoRegular/consultar/${this.codPlanVuelo}`;
      this.$service.post(`${url}`, { fpl: item }).then(response => {
        if (response) {
          this.planVueloPuedeAprobar = response.puede_aprobar;
          this.planVueloPendientesAprobacion = response.pendientes;
          this.planVuelo = response.fpl;
          this.listaProps = this.listaAtributos(this.planVuelo, []);
          this.$store.commit('openModal', 7);
        } else {
          this.planVueloPuedeAprobar = false;
          this.planVueloPendientesAprobacion = [];
          // mostrar error ..
        }
      });
    },
    listaAtributos (obj, lista) {
      /* Esta funcion devuelve una lista con todos los atributos de un objeto  [{}, {}, {} ...] Hace recorrido en profundidad.
       */
      for (let prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          if (typeof obj[prop] === 'object') {
            // console.log('objeto:', prop, ':', obj);
            this.listaAtributos(obj[prop], lista);
          } else {
            let o = {};
            o[prop] = obj[prop];
            lista.push(o);
          }
        }
      }
      return lista;
    },
    cargarLista (aeropuerto, fecha) {
      this.cargandoLista = true;
      // TODO: filtrar por inicio y fin
      if (!aeropuerto) {
        aeropuerto = 'TODOS';
      }
      if (!fecha) {
        fecha = 'TODOS';
      }
      this.$service.get(`${this.url}${aeropuerto}/${fecha}`).then(response => {
        if (response) {
          this.planVuelos = [];
          for (let i = 0; i < response.length; i++) {
            this.planVuelos.push(response[i]);
          }
        }
        setTimeout(() => {
          this.cargandoLista = false;
        }, 500);
      });
    },
    adaptarEstado (estado) {
      if (estado.toUpperCase() === 'ACEPTADO') {
        return 'APROBADO';
      } else if (estado.toUpperCase() === 'REGISTRADO') {
        return 'CREADO';
      } else if (estado.toUpperCase() === 'RECHAZADO') {
        return 'RECHAZADO';
      }
      return estado.toUpperCase();
    },
    parseDateToSearch (date) {
      let [year, month, day] = date.split('-');
      return `${year}/${month}/${day}`;
    },
    formatoHora (hora) {
      let h = '' + hora;
      if (h.length === 2) {
        return '00:' + h;
      }
      if (h.length === 3) {
        return '0' + h.substring(0, 1) + ':' + h.substring(1, 3);
      }
      return ('00' + h.substring(0, 2) + ':' + h.substring(2, 4)).slice(-5);
    }
  },
  watch: {
    fechaBusqueda: function (fecha) {
      // verificando que cumpla YYYY-MM-DD
      if (!/^[0-9]{4}-(((0[13578]|(10|12))-(0[1-9]|[1-2][0-9]|3[0-1]))|(02-(0[1-9]|[1-2][0-9]))|((0[469]|11)-(0[1-9]|[1-2][0-9]|30)))$/.test(fecha)) {
        return this.cargarLista();
      }
      if (fecha !== '') {
        this.cargarLista('TODOS', fecha);
      } else {
        this.cargarLista();
      }
    }
  }
};
</script>
