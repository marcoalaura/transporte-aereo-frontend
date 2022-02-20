<template>
  <section>
    <h3 class="primary--text"><v-icon color="primary">flight_takeoff</v-icon> Seguimiento de Vuelos</h3>
    <v-card>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="vuelos"
          :loading="cargandoLista"
          :rows-per-page-items="[10, 25, 50]"
          :pagination.sync="paginacionLista"
          :total-items="tamListaTotal"
        >
          <template slot="items" slot-scope="props">
            <td>
              <v-tooltip bottom>
                <v-btn
                  slot="activator"
                  small
                  @click="verDetalles(props.item)">
                  <v-icon>place</v-icon> Ver detalles
                </v-btn>
                <span>Ver detalles del vuelo</span>
              </v-tooltip>
            </td>
            <td>{{ props.item.numero_vuelo }}</td>
            <td>
              <span v-if="props.item.piloto">{{ props.item.piloto.nombres }} {{ props.item.piloto.primer_apellido }} {{ props.item.piloto.segundo_apellido }} <br>
                <em><small><strong>LICENCIA:</strong> {{ props.item.piloto.numero_licencia }}</small></em></span>
            </td>
            <td>
              <span v-if="props.item.aeronave">
                <strong>MATRÍCULA:</strong> {{ props.item.aeronave.numero_matricula }} <br>
                <em><small><strong>MODELO:</strong> {{ props.item.aeronave.modelo }}</small></em>
              </span>
            </td>
            <td>{{ $datetime.format(props.item.inicio, 'dd/MM/YYYY hrs. HH:mm') }}</td>
            <td>{{ $datetime.format(props.item.fin, 'dd/MM/YYYY hrs. HH:mm') }}</td>
          </template>
          <!-- </crud-table> -->
        </v-data-table>
      </v-card-text>
    </v-card>
    <v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-toolbar-title>
            <v-icon>flight_takeoff</v-icon> <strong>VUELO:</strong>
            <span v-if="vuelo"><strong>{{ vuelo.numero_vuelo }}</strong> / <small>Del {{ $datetime.format(vuelo.inicio, 'dd/MM/YYYY hrs. HH:mm') }} al {{ $datetime.format(vuelo.fin, 'dd/MM/YYYY hrs. HH:mm') }}</small></span>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark @click.native="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text v-if="vuelo">
          <v-container fluid grid-list-md grid-list-xs class="detalles-vuelo p-0">
            <v-layout>
              <v-flex md6>
                <v-alert color="info" outline :value="true" class="mb-0">
                  <h3 class="primary--text">Datos de la aeronave</h3>
                  <v-layout>
                    <v-flex md6>
                      <p><strong>Número de matricula:</strong> {{ vuelo.aeronave.numero_matricula }}</p>
                      <p><strong>Número de serie:</strong> {{ vuelo.aeronave.numero_serie }}</p>
                      <p><strong>Marca:</strong> {{ vuelo.aeronave.marca }}</p>
                      <p><strong>Modelo:</strong> {{ vuelo.aeronave.modelo }}</p>
                    </v-flex>
                    <v-flex md6>
                      <p><strong>Fecha de inscripción:</strong> {{ vuelo.aeronave.fecha_inscripcion }}</p>
                      <p><strong>Propietario:</strong> {{ vuelo.aeronave.propietario }}</p>
                      <p><strong>Estado:</strong> {{ vuelo.aeronave.estado }}</p>
                      <!-- <p><strong>Volumen referencial:</strong> {{ vuelo.aeronave.volumen_referencial }}</p> -->
                    </v-flex>
                  </v-layout>
                </v-alert>
              </v-flex>
              <v-flex md6>
                <v-alert :color="vuelo.piloto ? 'info' : 'warning'" outline :value="true" class="mb-0">
                  <h3 class="primary--text" v-if="vuelo.piloto">Datos del piloto</h3>
                  <h4 v-else class="m-0">No existe información del piloto</h4>
                  <v-layout v-if="vuelo.piloto">
                    <v-flex xs12 md6>
                      <p><strong>Nombres:</strong> {{ vuelo.piloto.nombres }}</p>
                      <p><strong>Primer apellido:</strong> {{ vuelo.piloto.primer_apellido }}</p>
                      <p><strong>Segundo apellido:</strong> {{ vuelo.piloto.segundo_apellido }}</p>
                      <p><strong>Número de licencia:</strong> {{ vuelo.piloto.numero_licencia }}</p>
                    </v-flex>
                    <v-flex xs12 md6>
                      <p><strong>Ciudad:</strong> {{ vuelo.piloto.ciudad }}</p>
                      <p><strong>Título:</strong> {{ vuelo.piloto.titulo }}</p>
                      <p><strong>Fecha de expiración:</strong> {{ vuelo.piloto.fecha_expiracion }}</p>
                    </v-flex>
                  </v-layout>
                </v-alert>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-divider></v-divider>
        <div class="map-container map-rutas">
          <mapa :id-solicitud="1"
                :lista-coordenadas="vueloCoordenadas"
                v-if="showMapa"></mapa>
        </div>
      </v-card>
    </v-dialog>
  </section>
</template>

<script>
import Mapa from './Mapa';

export default {
  components: {
    Mapa
  },
  data () {
    return {
      vuelo: null,
      vueloCoordenadas: [],
      showMapa: false,
      dialog: false,
      headers: [
        { text: this.$t('common.actions'), sortable: false },
        { text: 'Nro. Vuelo', value: 'numero_vuelo' },
        { text: 'Piloto', value: 'piloto' },
        { text: 'Aeronave', value: 'aeronave' },
        { text: 'Inicio', value: 'inicio' },
        { text: 'Fin', value: 'fin' }
      ],
      paginacionLista: { 'sortBy': 'inicio' },
      cargandoLista: true,
      tamListaTotal: 0,
      tamPag: 10,
      numPag: 1,
      campoLista: 'inicio',
      ordAsc: false,
      urlListaVuelos: 'vuelo/mopsv/oopp/reporte/vuelos/lista',
      urlDetalleVuelo: 'vuelo/mopsv/oopp/reporte/vuelos/detalle/',
      urlCoordenadasVuelo: 'vuelo/mopsv/oopp/reporte/vuelos/coordenadas/',
      urlPaginacionVuelos: 'vuelo/mopsv/oopp/reporte/vuelos/lista/',
      vuelos: []
    };
  },
  methods: {
    verDetalles (vuelo) {
      this.dialog = true;
      this.vuelo = vuelo;
      this.listaCoordenadas(vuelo.numero_vuelo);
      this.showMapa = false;
      setTimeout(() => {
        this.showMapa = true;
      }, 500);
    },
    token () {
      // funcion temporal
      this.$service.get('vuelo/mopsv/oopp/reporte/token').then(response => {
        console.log(`obtener token: ${response}`);
      });
    },
    listaVuelos () {
      this.$service.get(this.urlListaVuelos).then(response => {
        if (response) {
          this.vuelos = response;
        }
      });
    },
    listaVuelosPaginada () {
      this.$loading.show('Consultando servicio externo');
      const { sortBy, descending, page, rowsPerPage } = this.paginacionLista;
      this.tamPag = rowsPerPage;
      this.ordAsc = descending;
      this.numPag = page;
      this.ordCampo = sortBy;
      // ejemplo: /mopsv/oopp/reporte/vuelos/lista/tamPag/10/numPag/1/ordCampo/inicio/ordAsc/1
      let url = `${this.urlPaginacionVuelos}tamPag/${this.tamPag}/numPag/${this.numPag}/ordCampo/${this.ordCampo}/ordAsc/${this.ordAsc}`;
      this.cargandoLista = true;
      this.$service.get(url).then(response => {
        if (response) {
          this.vuelos = response.results;
          this.tamListaTotal = response.count;
        }
        setTimeout(() => {
          this.cargandoLista = false;
        }, 500);
      });
    },
    listaCoordenadas (numVuelo) {
      this.$service.get(`${this.urlCoordenadasVuelo}${numVuelo}`).then(response => {
        if (response) {
          this.vueloCoordenadas = response;
        }
      });
    }
  },
  watch: {
    paginacionLista: {
      handler () {
        this.listaVuelosPaginada();
      },
      deep: true
    }
  },
  mounted () {
    // this.listaVuelos();
    this.listaVuelosPaginada(this.tamPag, this.numPag, this.campoLista, this.ordenAscendente);
  }
};
</script>

<style lang="scss">
.detalles-vuelo {
  h3 {
    margin: 0 0 5px;
  }
  p {
    margin-bottom: 5px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
