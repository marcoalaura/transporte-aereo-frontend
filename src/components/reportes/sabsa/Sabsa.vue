<template>
  <section class="app-reportes">
    <h3 class="primary--text"><v-icon color="primary">assessment</v-icon> Reportes - SABSA</h3>
    <v-card color="grey darken-3">
      <v-card-text>
        <v-container grid-list-md>
          <v-layout>
            <v-flex md4>
              <v-select
                v-model="reporteSeleccionado"
                label="Seleccione un tipo de reporte"
                :items="reporteOpciones"
                hide-details
                dark
              ></v-select>
            </v-flex>
            <v-flex md4>
              <v-select
                v-model="anyoInicio"
                label="Año de inicio"
                :items="reporteRangoInicio"
                hide-details
                dark
              ></v-select>
            </v-flex>
            <v-flex md4>
              <v-select
                v-model="anyoFin"
                label="Año de finalización"
                :items="reporteRangoFin"
                hide-details
                dark
              ></v-select>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card-text>
      <!-- probando charts -->
      <v-card
        v-if="reporteSeleccionado === 'Aterrizajes'"
      >
        <v-card-text>
          <h4 class="primary--text">Reporte de aterrizajes del {{ anyoInicio }} al {{ anyoFin }}</h4>

          <h5>{{ datos.grafico1.titulo }}</h5>
          <aterrizajes-por-gestion
            tipoGrafico="grafico1"
            v-if="datos.grafico1.cargado"
            :titulo="datos.grafico1.titulo"
            :labels="datos.grafico1.labels"
            :datasets="datos.grafico1.datasets"
            :width="datos.grafico1.width"
            :height="datos.grafico1.height"
          >
          </aterrizajes-por-gestion>

          <h5>{{ datos.grafico2.titulo }}</h5>
          <aterrizaje-por-aeropuerto
            tipoGrafico="grafico2"
            v-if="datos.grafico2.cargado"
            :titulo="datos.grafico2.titulo"
            :labels="datos.grafico2.labels"
            :datasets="datos.grafico2.datasets"
            :width="datos.grafico2.width"
            :height="datos.grafico2.height"
          >
          </aterrizaje-por-aeropuerto>

          <h5>{{ datos.grafico3.titulo }}</h5>
          <aterrizajes-acumulados
            tipoGrafico="grafico3"
            v-if="datos.grafico3.cargado"
            :titulo="datos.grafico3.titulo"
            :labels="datos.grafico3.labels"
            :datasets="datos.grafico3.datasets"
            :width="datos.grafico3.width"
            :height="datos.grafico3.height"
          >
          </aterrizajes-acumulados>
        </v-card-text>

        <!-- cuadro de datos estadisticos -->
      </v-card>

      <v-card
        v-if="reporteSeleccionado === 'Pasajeros'"
      >
        <v-card-text>
          <!-- reporte pasajeros -->
          <h4 class="primary--text">Reporte de pasajeros del {{ anyoInicio }} al {{ anyoFin }}</h4>

          <h5>{{ datos.grafico4.titulo }}</h5>

          <pasajeros-por-gestion
            tipoGrafico="grafico4"
            v-if="datos.grafico4.cargado"
            :labels="datos.grafico4.labels"
            :datasets="datos.grafico4.datasets"
            :width="datos.grafico4.width"
            :height="datos.grafico4.height"
          >
          </pasajeros-por-gestion>

          <h5>{{ datos.grafico5.titulo }}</h5>
          <pasajeros-acumulados
            tipoGrafico="grafico5"
            v-if="datos.grafico5.cargado"
            :labels="datos.grafico5.labels"
            :datasets="datos.grafico5.datasets"
            :width="datos.grafico5.width"
            :height="datos.grafico5.height"
            ref="g5"
          >
          </pasajeros-acumulados>
        </v-card-text>
      </v-card>

      <!-- antiguo combo box para reportes en iframe de SABAS -->
      <!-- <v-card-text>
        <v-select
          v-model="reporte"
          label="(SABSA) seleccione un tipo de reporte"
          :items="reportes"
        ></v-select>
      </v-card-text>
      <iframe class="reporte-iframe" :src="iframe" v-if="iframe"></iframe> -->

    </v-card>
  </section>
</template>

<script>
import AterrizajePorAeropuerto from '@/components/reportes/sabsa/AterrizajesPorAeropuerto.js';
import AterrizajesPorGestion from '@/components/reportes/sabsa/AterrizajesPorGestion.js';
import AterrizajesAcumulados from '@/components/reportes/sabsa/AterrizajesAcumulados.js';
import PasajerosPorGestion from '@/components/reportes/sabsa/PasajerosPorGestion.js';
import PasajerosAcumulados from '@/components/reportes/sabsa/PasajerosAcumulados.js';

const colores = [
  '#5867dd', // primary
  '#36a3f7', // info
  '#ffb822', // warning
  '#f4516c', // error
  '#34bfa3', // success
  '#D20AB2',
  '#7387c0',
  '#d8d8ff',
  '#506A34',
  '#3E3EA8',
  '#004a93',
  '#5cb700',
  '#daffb4',
  '#A3FF22'
];

export default {
  data () {
    return {
      colores,
      iframe: null,
      reporte: null,
      reportes: [
        {
          value: 'todo',
          text: 'Todos los reportes',
          url: 'http://181.188.190.50/reports0/Pages/Folder.aspx?ItemPath=%2fMOPSV'
        },
        {
          value: 'aterrizajes',
          text: 'Aterrizajes por año',
          url: 'http://181.188.190.50/Reports0/Pages/Report.aspx?ItemPath=%2fMOPSV%2fATERRIZAJES+POR+AÑO'
        },
        {
          value: 'pasajeros',
          text: 'Pasajeros por año',
          url: 'http://181.188.190.50/Reports0/Pages/Report.aspx?ItemPath=%2fMOPSV%2fPASAJEROS+POR+A%C3%91O'
        }
      ],
      serviciosConsulta: [
        {
          value: 'Aterrizajes',
          text: 'Datos de aterrizajes por año',
          url: 'vuelo/sabsa/reporte/aterrizajes/'
        },
        {
          value: 'Pasajeros',
          text: 'Datos de pasajeros',
          url: 'vuelo/sabsa/reporte/pasajeros/'
        }
      ],
      reporteRangoInicio: [],
      reporteRangoFin: [],
      reporteOpciones: [
        {
          value: 'Aterrizajes',
          text: 'Datos de aterrizajes por año'
        },
        {
          value: 'Pasajeros',
          text: 'Datos de pasajeros'
        }
      ],
      reporteSeleccionado: null,
      datosAterrizajes: {},
      datosPasajeros: {},
      anyoInicio: new Date().getFullYear() - 1,
      anyoFin: new Date().getFullYear(),
      datos: {
        grafico1: {
          cargado: false,
          tipoGrafico: 'Line',
          titulo: 'ATZ (Aterrizajes por año)',
          labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
          height: 500,
          width: 500,
          options: [],
          datasets: []
        },
        grafico2: {
          cargado: false,
          tipoGrafico: 'HorizontalBar',
          titulo: 'ATZ (Aterrizajes por Aeropuerto)',
          labels: [],
          datasets: [],
          options: {},
          height: 400,
          width: 400
        },
        grafico3: {
          cargado: false,
          tipoGrafico: 'HorizontalBar',
          titulo: 'ATZ ACUMULADOS / AEROPUERTO (Aterrizajes por Aeropuerto)',
          labels: [],
          datasets: [],
          height: 500,
          width: 500,
          options: {}
        },
        grafico4: {
          cargado: false,
          tipoGrafico: 'Line',
          titulo: 'Pasajeros / GESTIÓN / (Embarcados+Desembarcados)',
          labels: [],
          datasets: [],
          height: 500,
          width: 500,
          options: {}
        },
        grafico5: {
          cargado: false,
          tipoGrafico: 'HorizontalBar',
          titulo: 'Pasajeros TOTALES / GESTIÓN / (Embarcados+Desembarcados)',
          labels: [],
          datasets: [],
          options: {},
          height: 900,
          width: 600
        }
      }
    };
  },
  mounted () {
    let inicio = [];
    let gestion = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      inicio.push(gestion);
      gestion--;
    }
    this.reporteRangoInicio = inicio;
    this.reporteRangoFin = inicio;
  },
  methods: {
    getDatosAterrizajes (inicio, fin) {
      const ini = inicio !== undefined ? inicio : String(this.anyoInicio);
      const fn = fin !== undefined ? fin : String(this.anyoFin);
      let url = this.serviciosConsulta[0].url + ini + '/' + fn;

      console.log('Consulta de servicios URL', url);
      this.$service.get(url).then(response => {
        if (response) {
          Object.assign(this.datosAterrizajes, response);
          this.aterrizajesPorAeropuerto();
          this.aterrizajesPorAnyo();
          this.aterrizajesAcumulados();
        }
      });
    },
    getDatosPasajeros (inicio, fin) {
      const ini = inicio !== undefined ? inicio : String(this.anyoInicio);
      const fn = fin !== undefined ? fin : String(this.anyoFin);
      let url = this.serviciosConsulta[1].url + ini + '/' + fn;

      console.log('Consulta de servicios URL', url);
      this.$service.get(url).then(response => {
        if (response) {
          Object.assign(this.datosPasajeros, response);
          this.pasajerosPorGestion();
          this.pasajerosAcumulados();
        }
      });
    },
    /* funciones para preparar los datos para los graficos */
    aterrizajesPorAnyo () {
      let nacionales = [];
      let internacionales = [];
      let datasets = [];
      for (let gestion = this.anyoInicio; gestion <= this.anyoFin; gestion++) {
        /* NOTA importante: si no se crean nuevos objetos (en este caso arrays) por cada
           iteracion, al modificarse un objeto se modifican todos ya que son realmente el
           mismo objeto que se cpia duplicado en el array de arrays.
         */
        let ceros1 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        nacionales.push(ceros1);
        let ceros2 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        internacionales.push(ceros2);
      }

      // se cuenta los aterrizajes por en cada gestion (1 elemento del array por mes del anyo)
      for (let i = 0; i < nacionales.length; i++) {
        let gestionActual = this.anyoInicio + i;
        for (let clave in this.datosAterrizajes) {
          if (gestionActual === this.datosAterrizajes[clave]['GESTION']) {
            let indice = this.datosAterrizajes[clave]['MES'] - 1;
            if (this.datosAterrizajes[clave]['TIPO'] === 'Internacional') {
              internacionales[i][indice] += this.datosAterrizajes[clave]['ATZ'];
            } else if (this.datosAterrizajes[clave]['TIPO'] === 'Nacional') {
              nacionales[i][indice] += this.datosAterrizajes[clave]['ATZ'];
            }
          }
        }
        datasets.push({
          label: String(gestionActual) + ' nacional',
          data: nacionales[i],
          backgroundColor: this.colores[gestionActual % this.colores.length],
          borderColor: this.colores[(gestionActual) % this.colores.length],
          fill: false
        });
        datasets.push({
          label: String(gestionActual) + ' internacional',
          data: internacionales[i],
          backgroundColor: this.colores[(gestionActual + 10) % this.colores.length],
          borderColor: this.colores[(gestionActual + 10) % this.colores.length],
          fill: false
        });
      }
      this.datos.grafico1.datasets = [];
      Object.assign(this.datos.grafico1.datasets, datasets);
      this.datos.grafico1.cargado = true;
    },
    aterrizajesPorAeropuerto () {
      let aeropuertos = [];
      // procesando aeropuertos
      for (let clave in this.datosAterrizajes) {
        if (aeropuertos.indexOf(this.datosAterrizajes[clave]['AEROPUERTO']) === -1) {
          aeropuertos.push(this.datosAterrizajes[clave]['AEROPUERTO']);
        }
      }
      let labels = [];
      for (let gestion = this.anyoInicio; gestion <= this.anyoFin; gestion++) {
        labels.push(String(gestion));
      }
      let datasets = [];
      aeropuertos.map(aeropuerto => {
        // creando array para almecenar contadores de aterrizajes (1 elemento por gestion)
        let arrData = [];
        for (let i = this.anyoInicio; i <= this.anyoFin; i++) {
          arrData.push(0);
        }
        let label = aeropuerto;
        for (let clave in this.datosAterrizajes) {
          if (aeropuerto === this.datosAterrizajes[clave]['AEROPUERTO']) {
            let indice = this.anyoFin - this.datosAterrizajes[clave]['GESTION'];
            arrData[indice] += this.datosAterrizajes[clave]['ATZ'];
          }
        }
        let backgroundColor = this.colores[aeropuerto.length % this.colores.length]; // escogiendo un color
        datasets.push({
          label: label,
          backgroundColor: backgroundColor,
          data: arrData
        });
      });
      Object.assign(this.datos.grafico2.datasets, datasets);
      this.datos.grafico2.labels = [];
      Object.assign(this.datos.grafico2.labels, labels);
      this.datos.grafico2.cargado = true;
    },
    aterrizajesAcumulados () {
      // para grafico de aterrizajes Acumulados
      let aeropuertos = [];
      for (let clave in this.datosAterrizajes) {
        if (aeropuertos.indexOf(this.datosAterrizajes[clave]['AEROPUERTO']) === -1) {
          aeropuertos.push(this.datosAterrizajes[clave]['AEROPUERTO']);
        }
      }
      let labels = [];
      for (let gestion = this.anyoInicio; gestion <= this.anyoFin; gestion++) {
        labels.push(String(gestion));
      }
      let datasets = [];
      aeropuertos.map(aeropuerto => {
        let arrDataN = [];
        let arrDataI = [];
        for (let i = this.anyoInicio; i <= this.anyoFin; i++) {
          arrDataN.push(0);
          arrDataI.push(0);
        }
        for (let clave in this.datosAterrizajes) {
          if (aeropuerto === this.datosAterrizajes[clave]['AEROPUERTO']) {
            let indice = this.anyoFin - this.datosAterrizajes[clave]['GESTION'];
            if (this.datosAterrizajes[clave]['TIPO'] === 'Nacional') {
              arrDataN[indice] += this.datosAterrizajes[clave]['ATZ'];
            } else if (this.datosAterrizajes[clave]['TIPO'] === 'Internacional') {
              arrDataI[indice] += this.datosAterrizajes[clave]['ATZ'];
            }
          }
        }
        datasets.push({
          label: aeropuerto + ' Nacional',
          backgroundColor: this.colores[0],
          data: arrDataN
        });
        datasets.push({
          label: aeropuerto + ' Internacional',
          backgroundColor: this.colores[5],
          data: arrDataI
        });
      });
      Object.assign(this.datos.grafico3.datasets, datasets);
      this.datos.grafico3.labels = [];
      Object.assign(this.datos.grafico3.labels, labels);
      this.datos.grafico3.cargado = true;
    },
    pasajerosPorGestion () {
      let labels = [];
      let internacionales = [];
      let domesticos = [];
      let datasets = [];
      for (let gestion = this.anyoInicio; gestion <= this.anyoFin; gestion++) {
        internacionales.push(0);
        domesticos.push(0);
        labels.push(String(gestion));
      }
      for (let clave in this.datosPasajeros) {
        for (let gestion = this.anyoInicio; gestion <= this.anyoFin; gestion++) {
          if (gestion === this.datosPasajeros[clave]['GESTION']) {
            let indice = gestion - this.anyoInicio;
            if (this.datosPasajeros[clave]['TIPO'] === 'INTERNACIONALES') {
              internacionales[indice] += this.datosPasajeros[clave]['PAX'];
            } else if (this.datosPasajeros[clave]['TIPO'] === 'DOMESTICOS') {
              domesticos[indice] += this.datosPasajeros[clave]['PAX'];
            }
          }
        }
      }
      datasets.push({
        label: 'Internacional',
        data: internacionales,
        backgroundColor: this.colores[4],
        borderColor: this.colores[4],
        fill: false
      });
      datasets.push({
        label: 'Domesticos',
        data: domesticos,
        backgroundColor: this.colores[0],
        borderColor: this.colores[0],
        fill: false
      });
      Object.assign(this.datos.grafico4.datasets, datasets);
      this.datos.grafico4.labels = [];
      Object.assign(this.datos.grafico4.labels, labels);
      this.datos.grafico4.cargado = true;
    },
    pasajerosAcumulados () {
      this.datos.grafico5.labels = [];
      Object.assign(this.datos.grafico5.labels, this.datos.grafico4.labels);
      Object.assign(this.datos.grafico5.datasets, this.datos.grafico4.datasets);
      this.datos.grafico5.cargado = true;
    },
    redibujarReportes () {
      this.$loading.show('Cargando reportes');
      setTimeout(this.$loading.hide, 1500);
      this.datos.grafico1.cargado = false;
      this.datos.grafico2.cargado = false;
      this.datos.grafico3.cargado = false;
      this.datos.grafico4.cargado = false;
      this.datos.grafico5.cargado = false;
      this.$nextTick(() => {
        this.getDatosAterrizajes(this.anyoInicio, this.anyoFin);
        this.getDatosPasajeros(this.anyoInicio, this.anyoFin);
      });
    }
  },
  watch: {
    reporte: function (val) {
      if (val) {
        this.iframe = false;
        this.$nextTick(() => {
          for (let i in this.reportes) {
            if (this.reportes[i].value === val) {
              this.iframe = this.reportes[i].url;
              break;
            }
          }
        });
      }
    },
    reporteSeleccionado: function (val) {
      if (val) {
        this.redibujarReportes();
      }
    },
    anyoInicio: function (val) {
      if (this.anyoFin < this.anyoInicio) {
        this.anyoFin = this.anyoInicio;
      }
      // this.reporteRangoFin = this.reporteRangoInicio.slice(this.reporteRangoInicio.indexOf(this.anyoInicio));
      this.redibujarReportes();
    },
    anyoFin: function (val) {
      if (this.anyoFin < this.anyoInicio) {
        this.anyoFin = this.anyoInicio;
      }
      // this.reporteRangoFin = this.reporteRangoInicio.slice(this.reporteRangoInicio.indexOf(this.anyoInicio));
      this.redibujarReportes();
    }
  },
  components: {
    AterrizajesPorGestion,
    AterrizajePorAeropuerto,
    AterrizajesAcumulados,
    PasajerosPorGestion,
    PasajerosAcumulados
  }
};
</script>

<style lang="scss">
.reporte-iframe {
  padding: 0 15px 15px;
  margin: 0;
  width: 100%;
  border: none;
  background: transparent;
  height: 680px;
  box-sizing: border-box;
}
.app-reportes {
  h4 {
    text-align: center;
    font-size: 1.6rem;
    margin: 0;
  }
  h5 {
    margin-top: 40px;
    text-align: center;
    font-size: 1.2rem;
    margin-bottom: 15px;
  }
}
</style>
