# Componente PdfView

El componente PdfView es un visor de pdf integrado a la plataforma basado en la librería [PDF.js](https://www.npmjs.com/package/pdfjs-dist), en el que se podrá ver, recorrer y descargar el documento pdf asignado al componente en un contenedor.


## Características
- Renderización del documento pdf en un contenedor en la vista.
- Descarga del documento pdf mediante URL o localStorage.
- Almacenamiento del documento en localStorage con su identificador.


## Propiedades

Atributo | Descripción | Tipo | Valor por defecto
--- | --- | --- | ---
**data** | Documento Pdf en base64 | `String` | `null`
**id** | ID del elemento canvas donde se renderizará el documento pdf | `String` | `app-pdf-viewer`
**url** | Dirección URL en el backend para descargar el documento pdf | `String` | `''`
**storage** | Indice que servirá para su almacenamiento en localStorage | `Number` | `0`



## Uso del componente

1. Importar el componente

    ```js
      import PdfView from '@/common/util/PdfView'
    ```


2. Añadir a los `components` en la instancia de Vue para usar en el template

    ```js
      components: {
        PdfView
        ...
      }

    ```


3. Uso del template

    *Template*
    ```html
      <pdf-view
        :data="dataPdfBase64"
        :storage="number"
        :url="PATH_FILE_FROM_BACKEND"
      ></pdfview>
    ```

    *Script*
    ```js
      data () {
        return {
          dataPdfBase64: `CONTENIDO_PDF_BASE_64`,
          number: 1,
          url: 'http://localhost/api/download/pdf'
        }
      }
    ```


<br>

>Ir a [README](../../README.md)