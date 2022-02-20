<template>
  <div class="map" id="map"></div>
</template>

<script>
import 'leaflet';
import 'leaflet-easyprint';
import '../../../assets/polylineDecorator/L.PolylineDecorator.js';
import '../../../assets/leaflet-curve/leaflet-curve.js';
import '../../../common/mixins/printMapTools';
import imgAirplane from '../../../assets/images/icon_plane.png';
import imgMarker from '../../../assets/images/marker-icon.png';

var myIcon = window.L.icon({
  iconUrl: imgMarker,
  iconSize: [24, 24]
});

export default {
  // mixins: [ printMapTools ],
  props: {
    idSolicitud: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      map: null,
      tileLayer: null,
      puntoSalida: [],
      arrow: null,
      arrowHead: null,
      pathPattern: null,
      curved_line: null,
      layers: [
        {
          id: 0,
          name: `Aeropuertos`,
          active: false,
          features: []
        }
      ]
    };
  },
  mounted () {
    this.cargarRutas();
  },
  methods: {
    cargarRutas () {
      this.$service.graphql({
        query: `
          query {
            itinerarios(id_solicitud: ${this.idSolicitud}) {
              count
              rows {
                id
                dia_1
                dia_2
                dia_3
                dia_4
                dia_5
                dia_6
                dia_7
                aeronave_matricula
                aeropuerto_salida_codigo_iata
                aeropuerto_salida_lat_decimal
                aeropuerto_salida_lon_decimal
                aeropuerto_llegada_codigo_iata
                aeropuerto_llegada_lat_decimal
                aeropuerto_llegada_lon_decimal
                aeropuerto_llegada_nombre
                aeropuerto_salida_nombre
              }
            }
          }
        `,
        variables: { pais: 'BOLIVIA' }
      }).then(response => {
        if (response) {
          let items = response.itinerarios.rows;
          let capaVuelos = [];
          let capaAeropuertos = [];

          let arrayRutasLat = [];
          let arrayRutasLon = [];

          items.map(item => {
            let puntoAeropuertoLlegada = {
              type: 'marker',
              name: item.aeropuerto_llegada_nombre,
              coords: [item.aeropuerto_llegada_lat_decimal, item.aeropuerto_llegada_lon_decimal]
            };
            let puntoAeropuertoSalida = {
              type: 'marker',
              name: item.aeropuerto_salida_nombre,
              coords: [item.aeropuerto_salida_lat_decimal, item.aeropuerto_salida_lon_decimal]
            };
            let rutaVuelos = [
              [item.aeropuerto_salida_lat_decimal, item.aeropuerto_salida_lon_decimal],
              [item.aeropuerto_llegada_lat_decimal, item.aeropuerto_llegada_lon_decimal]
            ];

            capaVuelos.push(rutaVuelos);
            capaAeropuertos.push(puntoAeropuertoSalida, puntoAeropuertoLlegada);
          });

          var uniqRutas = new Set(capaVuelos.map(e => JSON.stringify(e)));
          let rutasUnicas = Array.from(uniqRutas).map(e => JSON.parse(e));
          var uniqAeropuertos = new Set(capaAeropuertos.map(e => JSON.stringify(e)));
          let aeropuertos = Array.from(uniqAeropuertos).map(e => JSON.parse(e));

          for (var i in rutasUnicas) {
            arrayRutasLat.push(rutasUnicas[i][0]);
            arrayRutasLon.push(rutasUnicas[i][1]);
          }
          this.puntoSalida = capaVuelos[0][0];
          this.layers[0].features = aeropuertos;
          this.initMap(rutasUnicas, arrayRutasLat, arrayRutasLon);
          this.initLayers();
          this.layerChanged(0, true);
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
    initLayers () {
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

          feature.leafletObject.on('mouseover', function (event) {
            feature.leafletObject.openPopup();
          });

          feature.leafletObject.on('mouseout', function (event) {
            feature.leafletObject.closePopup();
          });
        });

        polygonFeatures.forEach(feature => {
          feature.leafletObject = window.L.polygon(feature.coords).bindPopup(
            feature.name
          );
        });
      });
    },
    initMap (lineas, arrayRutasLat, arrayRutasLon) {
      this.map = window.L.map('map', {
        // center: [-17.99, -64.25],
        center: this.puntoSalida,
        zoom: 7,
        layers: [
          window.L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          })
        ]
      });

      this.pathPattern = window.L.polylineDecorator(lineas, {
        patterns: [
          {
            offset: 0,
            repeat: 10,
            symbol: window.L.Symbol.dash({
              pixelSize: 5,
              pathOptions: {
                color: '#000',
                weight: 1,
                opacity: 0.85
              }
            })
          },
          {
            offset: '25%',
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
      }).addTo(this.map);

      window.L.easyPrint({
        hidden: false,
        sizeModes: ['A4Portrait', 'A4Landscape'],
        exportOnly: true
      }).addTo(this.map);
    }
  }
};
</script>
<style lang="scss">
@import '../aeropuerto/mapa.scss';
</style>
