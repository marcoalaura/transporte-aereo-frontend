<template>
  <div class="map" id="map"></div>
</template>

<script>
import 'leaflet';
import '@/assets/polylineDecorator/L.PolylineDecorator.js';
import '@/assets/leaflet-curve/leaflet-curve.js';
import imgAirplane from '@/assets/images/icon_plane.png';
import imgMarkerIni from '@/assets/images/inicio-marker-icon.png';
import imgMarker from '@/assets/images/semi-marker-icon.png';

var myIcon = window.L.icon({
  iconUrl: imgMarker,
  iconSize: [8, 8]
});

var inicioIcon = window.L.icon({
  iconUrl: imgMarkerIni,
  iconSize: [16, 16]
});

var airPlaneIcon = window.L.icon({
  iconUrl: imgAirplane,
  iconSize: [28, 28]
});

export default {
  props: {
    idSolicitud: {
      type: Number,
      default: 0
    },
    listaCoordenadas: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      chg: 0,
      map: null,
      tileLayer: null,
      arrow: null,
      arrowHead: null,
      pathPattern: null,
      curved_line: null,
      puntoActual: [],
      zoom: 7,
      layers: [
        {
          id: 0,
          name: `Rutas`,
          active: false,
          features: []
        }
      ]
    };
  },
  mounted () {
    this.cargarCoordenadas();
  },
  methods: {
    cargarCoordenadas () {
      let capaMarcadores = [];
      let capaRutas = [];
      let len = this.listaCoordenadas.length;
      for (let i = 0; i < len; i++) {
        let icon;
        let label;
        if (i === 0) {
          icon = inicioIcon;
          label = `p. Salida: ${this.listaCoordenadas[i].fecha}`;
        } else if (i === len - 1) {
          icon = airPlaneIcon;
          label = `p. Último: ${this.listaCoordenadas[i].fecha}`;
        } else {
          icon = myIcon;
          label = `p.${i}: ${this.listaCoordenadas[i].fecha}`;
        }
        capaMarcadores.push({
          type: 'marker',
          name: label,
          coords: [this.listaCoordenadas[i].lat, this.listaCoordenadas[i].lng],
          icon: icon
        });
        capaRutas.push(
          [this.listaCoordenadas[i].lat, this.listaCoordenadas[i].lng]
        );
      }
      if (len !== 0) {
        this.puntoActual = [this.listaCoordenadas[len - 1].lat, this.listaCoordenadas[len - 1].lng];
      } else {
        this.puntoActual = [-17.99, -64.25];
      }
      this.layers[0].features = capaMarcadores;
      this.initMap(capaRutas);
      this.initLayers();
      this.layerChanged(0, true);
    },
    puntosMaxMinx (rutas) {
      // determinando maximos y minimos
      let maxLat = -90;
      let minLat = 90;
      let maxLng = -180;
      let minLng = 180;
      rutas.forEach(coor => {
        if (coor[0] > maxLat) {
          maxLat = coor[0];
        }
        if (coor[0] < minLat) {
          minLat = coor[0];
        }
        if (coor[1] > maxLng) {
          maxLng = coor[1];
        }
        if (coor[1] < minLng) {
          minLng = coor[1];
        }
      });
      return [[minLat, minLng], [maxLat, maxLng]];
      // return window.L.latLngBounds(window.L.latLng(minLat, minLng), window.L.latLng(maxLat, maxLng));
    },
    calcularPuntoCentral (rutas) {
      let lat = 0;
      let lng = 0;
      rutas.forEach(coor => {
        lat += parseFloat(coor[0]);
        lng += parseFloat(coor[1]);
      });
      lat /= rutas.length;
      lng /= rutas.length;
      return [lat, lng];
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
          if (feature.icon) {
            feature.leafletObject = window.L.marker(feature.coords, { icon: feature.icon }).bindPopup(
              feature.name
            );
          } else {
            feature.leafletObject = window.L.marker(feature.coords, { icon: myIcon }).bindPopup(
              feature.name
            );
          }

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
    initMap (lineas) {
      this.map = window.L.map('map', {
        // center: this.puntoActual,
        center: this.calcularPuntoCentral(lineas),
        zoom: this.zoom,
        layers: [
          window.L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          })
        ]
      });

      // polilinea
      this.pathPattern = window.L.polyline(lineas, {
        color: 'blue', opacity: 0.70 }
      ).addTo(this.map);

      // ajustando area del mapa
      this.map.fitBounds(this.puntosMaxMinx(lineas));
    }
  }
};
</script>
<style lang="scss">
@import '../../itinerarios/aeropuerto/mapa.scss';
</style>
