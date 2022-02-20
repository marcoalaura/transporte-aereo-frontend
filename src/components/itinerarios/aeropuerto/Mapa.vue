<template>
  <div class="row">
    <div class="col-md-9">
      <div class="map" id="map"></div>
    </div>
  </div>
</template>

<script>
import 'leaflet';
import imgMarker from '../../../assets/images/marker-icon.png';

var myIcon = window.L.icon({
  iconUrl: imgMarker,
  iconSize: [24, 24]
});

export default {
  data () {
    return {
      map: null,
      tileLayer: null,
      layers: [
        {
          id: 0,
          name: `Aeropuertos`,
          active: false,
          features: []
        }
      ],
      marker: window.L.latLng(-16.79, -65.25)
    };
  },
  mounted () {
    this.cargarAeropuertos();
  },
  methods: {
    cargarAeropuertos () {
      this.$service.graphql({
        query: `
          query search($pais: String) {
            aeropuertos(pais: $pais, mapa: true) {
              count
              rows {
                id
                codigo_iata
                nombre
                lat_decimal
                lat_grados
                lat_minutos
                lat_segundos
                lon_decimal
                lon_grados
                lon_minutos
                lon_segundos
              }
            }
          }
        `,
        variables: { pais: 'BOLIVIA' }
      }).then(response => {
        if (response) {
          let items = response.aeropuertos.rows;
          let aeropuertos = [];
          items.map(item => {
            let punto = {
              name: item.nombre + ' (' + item.codigo_iata + ')',
              type: 'marker',
              coords: [item.lat_decimal, item.lon_decimal]
            };
            aeropuertos.push(punto);
          });
          this.layers[0].features = aeropuertos;
          this.initMap();
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
    initMap () {
      this.map = window.L.map('map').setView([-16.79, -63.25], 6);
      this.tileLayer = window.L.tileLayer(
        'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
        {
          maxZoom: 18,
          attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>'
        }
      );
      this.tileLayer.addTo(this.map);
    }
  }
};
</script>

<style lang="scss">
@import './mapa.scss';
</style>
