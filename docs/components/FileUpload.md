# Componente FileUpload
El componente FileUpload sirve para la carga de archivos en el sistema, con la funcionalidad de poder arrastrar y soltar el archivo a subir, está basado en el plugin  [Vue2Dropzone](https://rowanwins.github.io/vue-dropzone/docs/dist/#/installation).

## Características
- Arrastrar y soltar el archivo a subir.
- Configurar el tipo de archivo que va ser procesado.
- Funciones que se pueden ejecutar en el componente padre al obtener éxito o error en la subida del archivo.
- Asociación como atributo a un formulario de manera interna.
- La subida del archivo está asociada al token del usuario.

## Propiedades
Atributo | Descripción | Tipo | Valor por defecto
--- | --- | --- | ---
**url** | Dirección en el backend que se encargará de subir el archivo al servidor | `String` | `http://localhost/upload`
**label** | Título del componente que será mostrado como cabecera | `String` | `'Arrastra tus archivos aquí'`
**name** | Nombre del componente para ser identificado en el formulario | `String` | `'file'`
**types** | Tipo de archivo que se va a subir | `String` | `'application/pdf'`
**onSuccess** | Función que se ejecutará desde el componente padre cuando el archivo se haya subido exitosamente | `Function` | `null`
**onError** | Función que se ejecutará desde el componente padre cuando la subida del archivo haya resultado en un error | `Function` | `null`
**form** | Objeto de tipo formulario al cual se asociará el archivo como atributo | `Object` | `null`

## Uso del componente
1. Importar el componente

    ```js
      import FileUpload from '@/common/util/FileUpload'
    ```

2. Añadir a los `components` para usar en el template de Vue

    ```js
      components: {
        FileUpload
        ...
      }
    ```

3. Definicion del template


    *Template*
    ```html
    <file-upload
      :url="urlFile"
      types=".csv"
      name="csvFile"
      :form="form"
      :on-success="onSuccess"
      label="Arrastre su archivo CSV aquí">
    </file-upload>
    ```

    *Script*
    ```js
    export default {
      data () {
        return {
          urlFile: 'http://localhost/api/upload',
          form: {
            atributo1: '',
            atributo2: ''
          }
        }
      },
      method {
        onSuccess (file) {
          console.log('Archivo subido con éxito ');
        }
      }
    }
    ```

<br>

>Ir a [README](../../README.md)