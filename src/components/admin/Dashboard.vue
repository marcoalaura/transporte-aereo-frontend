<template>
  <section>
    <v-layout row>
      <v-flex md8>
        <h3 class="primary--text"><v-icon color="primary">airplanemode_active</v-icon> Vuelos</h3>
      </v-flex>
      <v-flex md4 offset-md2>
        <v-switch
          :label="nIntervalos ? 'Desactivar recarga de itinerarios nuevos en mapa.' : 'Activar recarga de itinerarios nuevos en mapa.'"
          v-model="nIntervalos"
          color="primary"
          hide-details
        ></v-switch>
      </v-flex>
    </v-layout>
    <v-card>
      <v-card-text>
        <v-autocomplete
          label="Aeropuerto"
          v-model="idAero"
          :items="aeropuertosNacionales"
          :cache-items="true"
          class="uppercase"
        ></v-autocomplete>
      </v-card-text>
      <v-tabs
        v-model="active"
        color="info"
        dark
        slider-color="warning"
      >
        <v-tab
          key="salidas"
          href="#salidas"
          ripple>
          <v-icon>flight_takeoff</v-icon> SALIDAS
        </v-tab>
        <v-tab
          v-on:click="listarVuelosLlegadaSegunAeropuerto(idAero)"
          key="llegadas"
          href="#llegadas"
          ripple>
          <v-icon>flight_land</v-icon> LLEGADAS
        </v-tab>
        <v-tab
          v-model="active"
          key="verTodosVuelos"
          href="#verTodosVuelos"
          ripple>
          <v-icon>map</v-icon> EN VUELO
        </v-tab>
        <v-tab-item
          key="salidas"
          id="salidas">
          <v-card flat class="table-itinerarios">
            <v-card-text>
              <table ref="tablaVuelosSalida">
                <thead>
                  <tr>
                    <th>Aerolínea</th>
                    <th>Vuelo</th>
                    <th>Hora real</th>
                    <th>Hora estimada</th>
                    <th>Nro. de puerta</th>
                    <th>Destino</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="vueloSalida in vuelosSalida.slice(0, 10)" :key="vueloSalida.id">
                    <td class="warning--text">{{ vueloSalida.operador_razon_social }}</td>
                    <td class="info--text">{{ vueloSalida.itinerario_nro_vuelo }}</td>
                    <td>
                      <span v-if="vueloSalida.reprogramacion">{{ vueloSalida.horaModificada }}</span> 
                    </td>
                    <td class="warning--text">{{ vueloSalida.itinerario_hora_despegue }}</td>
                    <td class="text-uppercase">{{ vueloSalida.puerta_salida_nro_puerta }}</td>
                    <td class="text-uppercase marquee-wap marquee">
                      {{ vueloSalida.itinerario_aeropuerto_llegada_ciudad }} 
                      <span v-if="vueloSalida.conexiones !== ' >> '">
                      {{ vueloSalida.conexiones }}
                      </span>
                    </td>
                    <td><span v-html="vueloSalida.estadoVuelo"></span></td>
                  </tr>
                  <tr v-if="!vuelosSalida.length">
                    <td colspan="7">No hay vuelos de salida registrados en la siguiente hora.</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th colspan="7">Última actualización: {{ fechaHoraActualPanel }}</th>
                  </tr>
                </tfoot>
              </table>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item
          key="llegadas"
          id="llegadas">
          <v-card flat class="table-itinerarios">
            <v-card-text>
              <table>
                <thead>
                  <tr>
                    <th>Aerolínea</th>
                    <th>Vuelo</th>
                    <th>Hora real</th>
                    <th>Hora estimada</th>
                    <th>Sala</th>
                    <th>Origen</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="vueloLlegada in vuelosLlegada.slice(0, 10)" :key="vueloLlegada.id">
                    <td class="warning--text">{{ vueloLlegada.operador_razon_social }}</td>
                    <td class="info--text">{{ vueloLlegada.itinerario_nro_vuelo }}</td>
                    <td>
                      <span v-if="vueloLlegada.reprogramacion">{{ vueloLlegada.horaModificada }}</span> 
                    </td>
                    <td class="warning--text">{{ vueloLlegada.itinerario_hora_aterrizaje }}</td>
                    <td class="text-uppercase">{{ vueloLlegada.puerta_llegada_nro_puerta }}</td>
                    <td>{{ vueloLlegada.itinerario_aeropuerto_salida_ciudad }}</td>
                    <td><span v-html="vueloLlegada.estadoVuelo"></span></td>
                  </tr>
                  <tr v-if="!vuelosLlegada.length">
                    <td colspan="7">No hay vuelos de llegada registrados en la siguiente hora.</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th colspan="7">Última actualización: {{ fechaHoraActualPanel }}</th>
                  </tr>
                </tfoot>
              </table>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item key="verTodosVuelos" id="verTodosVuelos">
          <div class="map-container">
            <mapa-vuelos
              :nIntervalos="intervalosMapa"
              v-if="mostrarMapa"
            ></mapa-vuelos>
          </div>
        </v-tab-item>
      </v-tabs>
    </v-card>
  </section>
</template>
<script>

import MapaVuelos from './Mapa.vue';

export default {
  components: {
    MapaVuelos
  },
  data () {
    return {
      mostrarMapa: false,
      tablaVuelosSalida: '',
      aeropuerto: 1,
      itinerarios: null,
      active: 'salidas',
      interval: null,
      vuelosSalida: [],
      vuelosLlegada: [],
      idAeropuerto: 0,
      idAero: '',
      item: [],
      vue: null,
      selected: null,
      time: 10000,
      nIntervalos: true,
      intervalosMapa: 10,
      fechaHoraActualPanel: '',
      certificadoAerodromo: 'INTERNACIONAL',
      aeropuertosInternacionales: [],
      aeropuertosNacionales: [],
      parametroPostDespegue: 0
    };
  },
  created () {
    let dt = new Date();
    this.dashFechaActual = this.$datetime.format(dt, 'YYYY-MM-dd');
    this.interval = window.setInterval(() => {
      this.listarVuelosSalidaSegunAeropuerto(this.idAero);
      this.listarVuelosLlegadaSegunAeropuerto(this.idAero);
    }, this.time);
  },
  destroyed () {
    window.clearInterval(this.interval);
  },
  mounted () {
    this.obtenerParametros();
    this.listarAeropuertosNacionales();
    this.fechaActualPanel();
  },
  methods: {
    obtenerParametros () {
      this.$service.graphql({
        query: `
          query cosultar {
            parametroBuscar(name: "TIEMPO_DESPEGUE_VUELO") {
              valor
            }
          }
        `
      }).then(response => {
        this.parametroPostDespegue = parseInt(response.parametroBuscar.valor);
      });
    },
    dynamicSort (property) {
      var sortOrder = 1;
      if (property[0] === '-') {
        sortOrder = -1;
        property = property.substr(1);
      }
      return function (a, b) {
        if (sortOrder === -1) {
          return b[property].localeCompare(a[property]);
        } else {
          return a[property].localeCompare(b[property]);
        }
      };
    },
    fechaActualPanel () {
      let anhoMesDiaHHmmSS = new Date();
      this.fechaHoraActualPanel = this.$datetime.datetimeLiteral(anhoMesDiaHHmmSS);
    },
    listarVuelosSalidaSegunAeropuerto (idAero) {
      if (!this.$filter.empty(this.idAero)) {
        this.$service.graphql({
          query: `
            query cosultar($fecha_despegue: String, $id: Int) {
              vuelosConexiones(fecha_despegue: $fecha_despegue, id_aeropuerto_salida: $id) {
                count
                rows {
                  id
                  fecha_despegue
                  hora_etd
                  hora_eta
                  estado
                  operador_razon_social
                  itinerario_nro_vuelo
                  itinerario_aeropuerto_llegada_nombre
                  itinerario_hora_despegue
                  itinerario_aeropuerto_salida_nombre
                  itinerario_hora_aterrizaje
                  itinerario_aeropuerto_llegada_ciudad
                  itinerario_id_aeropuerto_salida
                  itinerario_id_aeropuerto_llegada
                  id_puerta_salida
                  puerta_salida_nro_puerta
                  id_puerta_llegada
                  puerta_llegada_nro_puerta
                  conexiones
                }
              }
            }
          `,
          variables: {
            fecha_despegue: this.dashFechaActual,
            id: this.idAero
          }
        }).then(response => {
          let items = response.vuelosConexiones.rows;
          let salidas = [];
          items = items.sort(this.dynamicSort('hora_etd'));
          items.map(item => {
            this.vsHora = this.$datetime.time(new Date());
            let minutos = this.$datetime.diffTime(this.vsHora, item.hora_etd);
            if (minutos >= -this.parametroPostDespegue) {
              if (minutos <= 0) {
                item.estadoVuelo = '<span class="blink red-blink"></span> CERRADO';
              } else if (minutos < 30 && minutos > 0) {
                item.estadoVuelo = '<span class="blink green-blink blink-animated"></span> ABORDANDO';
              } else if (minutos >= 30 && minutos < 60) {
                item.estadoVuelo = '<span class="blink green-blink"></span> PRE EMBARQUE';
              } else if (minutos >= 60) {
                item.estadoVuelo = '<span class="blink green-blink"></span> EN HORARIO';
              }
              if (minutos >= 120 && item.hora_etd !== item.itinerario_hora_despegue) {
                item.estadoVuelo = '<span class="blink red-blink blink-animated"></span> DEMORADO';
                salidas.push(item);
              }
              if (item.hora_etd === item.itinerario_hora_despegue) {
                item.horaModificada = item.itinerario_hora_despegue;
              } else {
                item.horaModificada = item.hora_etd;
                item.reprogramacion = true;
              }
              if (item.conexiones) {
                // eslint-disable-next-line
                item.conexiones = ' >> ' + item.conexiones.replace(/[\[\]']+/g,'').replace(/['"]+/g, '').replace(/,/g, ' >> ');
              }
              salidas.push(item);
            }
            // <span class="blink red-blink blink-animated"></span> ABORDANDO ROJO
            // <span class="blink green-blink blink-animated"></span> ABORDANDO VERDE
            // <span class="blink green-blink"></span> PRE EMBARQUE VERDE
            // <span class="blink red-blink"></span> DEMORADO ROJO
            // <span class="blink red-blink"></span> CERRADO ROJO
            // <span class="blink green-blink"></span> EN HORARIO VERDE
          });
          this.vuelosSalida = salidas;
        });
      }
    },
    listarVuelosLlegadaSegunAeropuerto (idAero) {
      if (!this.$filter.empty(this.idAero)) {
        this.$service.graphql({
          query: `
            query cosultar($fecha_despegue: String, $id: Int) {
              vuelos(fecha_despegue: $fecha_despegue, id_aeropuerto_llegada: $id) {
                count
                rows {
                  id
                  fecha_despegue
                  hora_etd
                  hora_eta
                  estado
                  operador_razon_social
                  itinerario_nro_vuelo
                  itinerario_aeropuerto_llegada_nombre
                  itinerario_hora_despegue
                  itinerario_aeropuerto_salida_nombre
                  itinerario_hora_aterrizaje
                  itinerario_aeropuerto_llegada_ciudad
                  itinerario_id_aeropuerto_salida
                  itinerario_id_aeropuerto_llegada
                  itinerario_aeropuerto_salida_ciudad
                  id_puerta_salida
                  puerta_salida_nro_puerta
                  id_puerta_llegada
                  puerta_llegada_nro_puerta
                }
              }
            }
          `,
          variables: {
            fecha_despegue: this.dashFechaActual,
            id: this.idAero
          }
        }).then(response => {
          let llegadas = [];
          let items = response.vuelos.rows;
          items = items.sort(this.dynamicSort('hora_eta'));
          items.map(item => {
            this.vllHora = this.$datetime.time(new Date());
            let minutos = this.$datetime.diffTime(this.vllHora, item.hora_eta);
            if (minutos >= -this.parametroPostDespegue) {
              if (minutos < 0) {
                item.estadoVuelo = '<span class="blink green-blink"></span> EN TIERRA';
              } else if (minutos >= 0 && minutos <= 60) {
                item.estadoVuelo = '<span class="blink green-blink blink-animated"></span> EN HORARIO';
              } else if (minutos > 60) {
                item.estadoVuelo = '<span class="blink green-blink"></span> CONFIRMADO';
              }
              if (item.hora_eta === item.itinerario_hora_aterrizaje) {
                item.horaModificada = item.itinerario_hora_aterrizaje;
              } else {
                item.horaModificada = item.hora_eta;
                item.reprogramacion = true;
              }
              if (item.vconexiones) {
                item.vconexiones = item.conexiones.replace(/[[\]]/g, '').replace(/['"]+/g, '');
              }
              llegadas.push(item);
            }
            return item;
          });
          this.vuelosLlegada = llegadas;
        });
      }
    },
    listarAeropuertosNacionales () {
      this.$service.graphql({
        query: `
         query cosultar($pais: String) {
            aeropuertos(pais: $pais) {
              count
              rows {
                id
                nombre
                codigo_icao
                codigo_iata
                ciudad
                certificado_aerodromo
              }
            }
          }
        `,
        variables: {
          pais: 'BOLIVIA'
        }
      }).then(response => {
        this.loading = false;
        if (response) {
          let items = response.aeropuertos.rows;
          let aeropuertosSinAerodromoInternacional = [];
          let aeropuertosAerodromoInternacional = [];
          items.map(item => {
            if (item.codigo_iata !== 'N/A' && item.certificado_aerodromo !== this.certificadoAerodromo) {
              aeropuertosSinAerodromoInternacional.push({ value: item.id, text: item.codigo_icao + ' - ' + item.nombre });
            } else if (item.codigo_iata !== 'N/A' && item.certificado_aerodromo === this.certificadoAerodromo) {
              aeropuertosAerodromoInternacional.push({ value: item.id, text: item.codigo_icao + ' - ' + item.nombre });
            }
          });
          aeropuertosSinAerodromoInternacional = aeropuertosSinAerodromoInternacional.sort(this.dynamicSort('text'));
          aeropuertosAerodromoInternacional = aeropuertosAerodromoInternacional.sort(this.dynamicSort('text'));
          this.aeropuertosNacionales = aeropuertosAerodromoInternacional.concat(aeropuertosSinAerodromoInternacional);
          this.idAero = this.aeropuertosNacionales[0].value;
        } else {
          this.aeropuertos = [];
        }
      });
    },
    loadMapa () {
      this.mostrarMapa = false;
      setTimeout(() => {
        this.mostrarMapa = true;
      }, 500);
    }
  },
  watch: {
    'idAero': function (newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.listarVuelosSalidaSegunAeropuerto(newVal);
        this.listarVuelosLlegadaSegunAeropuerto(newVal);
      }
    },
    'aeropuerto': function (val) {
      console.log('id aeropuerto: ', val);
      if (val) {
        this.$loading.show('Cargando vuelos');
        this.listarItinerariosTiempoReal(val);
      }
    },
    'nIntervalos': function (val) {
      if (val) {
        this.intervalosMapa = 10;
      } else {
        this.intervalosMapa = 9000;
      }
    },
    active: function (val) {
      if (val === 'verTodosVuelos') {
        this.loadMapa();
      }
    }
  }
};
</script>

<style lang="scss">
.table-itinerarios {
  background-image: url(../../assets/images/logos/airplane.jpg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  .v-card__text {
    background-color: rgba(0, 0, 0, .8);
  }

  table {
    width: 100%;

    thead {
      th {
        text-align: left;
        color: white;
        padding-bottom: 10px;
        font-size: 1.2rem;
      }
    }

    tbody {
      td {
        color: #ddd;
        font-size: 1.05rem;
      }
    }

    tfoot {
      th {
        padding-top: 50px;
        text-align: right;
        font-style: italic;
        font-weight: 500;
        font-size: 1rem;
        color: #aaa;
      }
    }
  }

  .uppercase {
    text-transform: uppercase;
  }

  .blink {
    content: ' ';
    position: relative;
    display: inline-block;
    width: 10px;
    height: 10px;
    margin: 0 20px;
    border-radius: 50%;
  }

  .blink-animated{
    -webkit-animation-name: flash;
    animation-name: flash;
    -webkit-animation-duration: 1s;
    animation-duration: 1s;
    -webkit-animation-iteration-count: infinite;
    animation-iteration-count: infinite;
  }

  .blink:before {
    content: ' ';
    position: absolute;
    top: -5px;
    left: -5px;
    display: inline-block;
    width: 20px;
    height: 20px;
    opacity: 0.1;
    border-radius: 50%;
  }

  .red-blink, .red-blink:before {
    background-color: #EE000C;
  }

  .yellow-blink, .yellow-blink:before {
    background-color: #eec000;
  }

  .green-blink, .green-blink:before {
    background-color: #4caf50;
  }

  .purple-blink, .purple-blink:before {
    background-color: #800080;
  }

  .blue-blink, .blue-blink:before {
    background-color: #000FFF;
  }

  .white-blink, .white-blink:before {
    background-color: #ffffff;
  }

  @keyframes flash {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
}
</style>
