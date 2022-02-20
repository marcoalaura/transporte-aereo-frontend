'use strict';

// Mixin pendiente, la idea es que se pueda directamente aqui importar leaflit-easyprint,
// agregarlo al objeto `map' del componente que lo llama y ademas agregar el tamanyo
// carta para impresion

export default {
  methods: {
    $botonImprimirMapa (position = 'bottomleft') {
      let sizeModes = ['A4Portrait', 'A4Landscape'];

      // personalizado para carta (requiere un svg y una clase css ver https://github.com/rowanwins/leaflet-easyPrint#custom-print-sizes)
      // let cartaSizePortrait = {
      //   width: 2550,
      //   height: 3308,
      //   className: 'LetterPortrait',
      //   tooltip: 'Carta Vertical'
      // };
      // let cartaSizeLandscape = {
      //   width: 3308,
      //   height: 2550,
      //   className: 'LetterLandscape',
      //   tooltip: 'Carta Horizontal'
      // };
      // in css
      // .easyPrintHolder .a3CssClass {
      //   background-image: url(data:image/svg+xml;utf8;base64,PD9...go=);

      var printPluginObj = ({
        hidden: false,
        sizeModes: sizeModes,
        exportOnly: true
      });
      return printPluginObj;
    }
  }
};
