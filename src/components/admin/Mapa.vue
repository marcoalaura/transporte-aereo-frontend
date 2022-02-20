<template>
  <div class="map" id="map">
  </div>
</template>

<script>
import 'leaflet';
import 'leaflet-easyprint';
import '../../assets/polylineDecorator/L.PolylineDecorator.js';
import '../../assets/leaflet-curve/leaflet-curve.js';
import imgAirplane from '../../assets/images/icon_plane.png';
import imgMarker from '../../assets/images/marker-icon.png';
import avionBoA from '../../assets/images/avion_BoA.jpg';

var myIcon = window.L.icon({
  iconUrl: imgMarker,
  iconSize: [24, 24]
});

export default {
  props: {
    nIntervalos: {
      type: Number
    }
  },
  data () {
    return {
      map: null,
      tileLayer: null,
      arrow: null,
      arrowHead: null,
      pathPattern: null,
      realTime: null,
      layers: [
        {
          id: 0,
          name: `Aeropuertos`,
          active: false,
          features: []
        }
      ],
      capaVuelos: [],
      horas: [],
      vuelosFiltrados: [],
      timeRedibujarVuelos: 10000,
      cIntervalos: 0,
      interval: null,
      loading: true
    };
  },
  mounted () {
    this.actualizarMapaVuelos();
    this.actualizarMapa();
    this.interval = window.setInterval(() => (this.actualizarMapa()), this.timeRedibujarVuelos);
  },
  methods: {
    actualizarMapaVuelos () {
      this.removeMap();
      let dt = new Date();
      this.fechaActual = this.$datetime.format(dt, 'YYYY-MM-dd');
      this.$service.graphql({
        query: `
          query consultar($fecha_despegue: String) {
            vuelosDashboard(fecha_despegue: $fecha_despegue) {
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
                itinerario_aeropuerto_llegada_pais
                itinerario_aeropuerto_salida_pais
                itinerario_aeropuerto_llegada_lat_decimal
                itinerario_aeropuerto_llegada_lon_decimal
                itinerario_aeropuerto_salida_lat_decimal
                itinerario_aeropuerto_salida_lon_decimal
                itinerario_aeronave_matricula
                itinerario_aeronave_marca
                itinerario_aeronave_modelo
              }
            }
          }
        `,
        variables: {
          fecha_despegue: this.fechaActual
        }
      }).then(response => {
        if (response) {
          let items = response.vuelosDashboard.rows;
          let capaVuelos = [];
          let capaAeropuertos = [];
          let horas = [];
          let vuelosFiltrados = [];
          let pais = 'BOLIVIA';
          items.map(item => {
            if (item.itinerario_aeropuerto_salida_pais === pais || item.itinerario_aeropuerto_llegada_pais === pais) {
              let rangoHoraVuelo = this.porcentaje(item.hora_etd, item.hora_eta);
              if (rangoHoraVuelo >= -10 && rangoHoraVuelo <= 110) {
                vuelosFiltrados.push(item);
                let puntoAeropuertoLlegada = {
                  type: 'marker',
                  name: item.itinerario_aeropuerto_llegada_nombre,
                  coords: [item.itinerario_aeropuerto_llegada_lat_decimal, item.itinerario_aeropuerto_llegada_lon_decimal]
                };
                let puntoAeropuertoSalida = {
                  type: 'marker',
                  name: item.itinerario_aeropuerto_salida_nombre,
                  coords: [item.itinerario_aeropuerto_salida_lat_decimal, item.itinerario_aeropuerto_salida_lon_decimal]
                };
                let rutaVuelos = [
                  [item.itinerario_aeropuerto_salida_lat_decimal, item.itinerario_aeropuerto_salida_lon_decimal],
                  [item.itinerario_aeropuerto_llegada_lat_decimal, item.itinerario_aeropuerto_llegada_lon_decimal]
                ];
                capaAeropuertos.push(puntoAeropuertoSalida, puntoAeropuertoLlegada);
                capaVuelos.push(rutaVuelos);
                horas.push({ inicio: item.hora_etd, fin: item.hora_eta });
              }
            }
          });

          var uniq = new Set(capaAeropuertos.map(e => JSON.stringify(e)));
          let aeropuertos = Array.from(uniq).map(e => JSON.parse(e));

          this.layers[0].features = aeropuertos;
          this.initLayers();
          this.initMap(capaVuelos, horas, vuelosFiltrados);
          // this.redibujar(capaVuelos, horas, vuelosFiltrados);
          this.layerChanged(0, true);
          // actualizando arrays para vuelos
          this.vuelosFiltrados = [];
          Object.assign(this.vuelosFiltrados, vuelosFiltrados);
          this.horas = [];
          Object.assign(this.horas, horas);
          this.capaVuelos = [];
          Object.assign(this.capaVuelos, capaVuelos);
          this.redibujarVuelos(this.capaVuelos, this.horas, this.vuelosFiltrados);
        }
      });
    },
    layerChanged (layerId, active) {
      const layer = this.layers.find(layer => layer.id === layerId);
      layer.features.forEach(feature => {
        if (active) {
          feature.leafletObject.addTo(this.map);
        } else {
          feature.leafletObject.removeFrom(this.map);
        }
      });
    },
    porcentaje (inicio, fin) {
      let horaActual = this.$datetime.time(new Date());
      return (this.$datetime.diffTime(inicio, horaActual) * 100) / (this.$datetime.diffTime(inicio, fin));
    },
    initLayers () {
      // inicializa las capas asignando al objeto leaflet propiedades como iconos, etiquetas y popups
      this.layers.forEach(layer => {
        const markerFeatures = layer.features.filter(
          feature => feature.type === 'marker'
        );
        const polygonFeatures = layer.features.filter(
          feature => feature.type === 'polygon'
        );
        markerFeatures.forEach(feature => {
          feature.leafletObject = window.L.marker(feature.coords, { icon: myIcon }).bindPopup(
            feature.name
          );
        });
        polygonFeatures.forEach(feature => {
          feature.leafletObject = window.L.polygon(feature.coords).bindPopup(
            feature.name
          );
        });
      });
    },
    initMap (lineas, horas, vuelosFiltrados) {
      // ajusta el objeto mapa para consumir el servicios tile.osm.org
      this.map = window.L.map('map', {
        center: [-16.79, -63.25],
        zoom: 6,
        layers: [
          window.L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          })
        ]
      });
      // boton imprimir
      let cartaLandscape = {
        width: 1700,
        height: 2000,
        tooltip: 'Carta horizontal'
      };
      window.L.easyPrint({
        sizeModes: ['A4Portrait', 'A4Landscape', cartaLandscape],
        exportOnly: true
      }).addTo(this.map);
    },
    removeMap () {
      if (this.map) {
        this.map.remove();
      }
    },
    renderVuelos (lineas, horas, vuelosFiltrados) {
      let avion = `<img src="${avionBoA}" width="300px" title="By Venkat Mangudi - P1171060, CC BY 2.0">`;
      this.totalVuelos = window.L.layerGroup();
      for (let i in lineas) {
        let porcentaje = this.porcentaje(horas[i].inicio, horas[i].fin);
        if (porcentaje >= -10 && porcentaje < 0) {
          porcentaje = 0;
        } else if (porcentaje > 100 && porcentaje <= 110) {
          porcentaje = 100;
        }
        if ((porcentaje >= -10 && porcentaje <= 110)) {
          window.L.polylineDecorator([lineas[i]], {
            patterns: [
              {
                offset: 0,
                repeat: 10,
                symbol: window.L.Symbol.dash(
                  {
                    pixelSize: 5,
                    pathOptions: {
                      // color: '#000', weight: 1, opacity: 0.85
                      color: this.colorLineas(i),
                      weigth: 0.75,
                      opacity: 0.85
                    }
                  }
                )
              },
              {
                offset: porcentaje + '%',
                repeat: '100%',
                symbol: window.L.Symbol.marker({
                  rotate: true,
                  markerOptions: {
                    icon: window.L.icon({
                      iconUrl: imgAirplane,
                      iconAnchor: [16, 16]
                    })
                  }
                })
              }
            ]
          }).bindPopup(vuelosFiltrados[i].operador_razon_social +
                       ' <b>VUELO:</b> ' + vuelosFiltrados[i].itinerario_nro_vuelo +
                       ' <br><b>HORA SALIDA-LLEGADA:</b> ' + vuelosFiltrados[i].hora_etd + '-' + vuelosFiltrados[i].hora_eta +
                       ' <b>MATRÍCULA:</b> ' + vuelosFiltrados[i].itinerario_aeronave_matricula + avion).addTo(this.totalVuelos);
        }
      }
      this.totalVuelos.addTo(this.map);
    },
    borrarAviones () {
      if (!this.totalVuelos) {
        return;
      }
      this.map.removeLayer(this.totalVuelos);
    },
    redibujarVuelos (lineas, horas, vuelosFiltrados) {
      this.borrarAviones();
      this.renderVuelos(lineas, horas, vuelosFiltrados);
    },
    colorLineas (i) {
      /* Retorna un color codificado #RRGGBB segun el indice */
      let r = ((i + 9) * 3) % 255;
      let g = ((i + 3) * 4) % 255;
      let b = ((r + g) * 3) % 255;
      return '#' + ('00' + r).slice(-2) + ('00' + g).slice(-2) + ('00' + b).slice(-2);
    },
    actualizarMapa (intervalos = this.nIntervalos) {
      if (this.cIntervalos % intervalos === 0) {
        // recarga mapas (vuelve a consultar la BD)+
        this.loading = true;
        this.$loading.show('Actualizando mapa de vuelos');
        this.actualizarMapaVuelos();
        this.loading = false;
      } else {
        this.redibujarVuelos(this.capaVuelos, this.horas, this.vuelosFiltrados);
      }
      this.cIntervalos += 1;
    }
  },
  destroyed () {
    window.clearInterval(this.interval);
  }
};
</script>
<style lang="scss">
@import '../itinerarios/aeropuerto/mapa.scss';
</style>
