# Componente CrudTable
Componente CrudTable que nos sirve para representar datos significativos de la aplicación en forma de tabla.

## Características
- Filtros y Buscador avanzado por tipo de variable
- Paginación
- Peticion de datos mediante [GraphQL](https://graphql.org/) y RESTful
- mixins para la implementación de CRUD

## Propiedades

Atributo | Descripción | Tipo | Valor por defecto
--- | --- | --- | ---
**headers** | cabeceras de la tabla | `Array` | `[]`
**url** | ruta de la Api para obtener los datos | `String` | `this.$apiUrl`
**filter** | Activar o desactivar los filtros | `Boolean` | `false`
**idRefresh** | Identificador del botón que se encargará de actualizar los datos de la tabla | `String` | `btn-refresh-list`
**idFilter** | Identificador del botón que se encargará de mostrar los filtros de datos | `String` | `btn-filter`
**filters** | Array de los tipos de filtros que tendrá la tabla | `Array` | `[]`
**order** | Array de dos variables, la primera variable indicará el valor por el cual se desea ordenar la tabla y la segunda variable determinará si lo hace de manera ascendente o descendente | `Array` | `[]`
**widthModal** | Tamaño del modal integrado para la implementación de acciones tipo CRUD | `Number` | `480`
**graphql** | Variable de decisión para consumir la data de la tabla mediante **GraphQL** | `Boolean` | `false`
**dataGraphql** | Esquema de datos GraphQL del cual se desea obtener información | `String` | `''`
**showFilter** | Muestra los filtros de la tabla | `Boolean` | `false`
**successList** | Funcion que se ejecuta una vez concluida la peticion de datos mediante graphql | `Function` | `null`
**checkbox** | Muestra los checkbox para cada fila | `Boolean` | `false`
**checkboxHide** | Permite ocultar el checkbox en base a un atributo y su valor determinado en un array de dos valores | `Array` | `null`

## Uso del Componente

1. Importar el componente
    ```js
    import CrudTable from '@/common/util/crud-table/CrudTable'
    ```

2. Añadir a los `components` para usar en el template de Vue
    ```js
    components: {
      CrudTable
      ...
    }
    ```
    
3. Uso del template

    *Template*
    ```html
    <crud-table
      :headers="headers"
      :url="url"
      :filters="filters"
      :graphql="graphql"
      :dataGraphql="dataGraphql"
      :widthModal="800"
      :checkbox="true">
    </crud-table>
    ```

    *Script*
    ```js
      data () {
        return {
          headers: [
            { text: 'Dato 1', value: 'dato1' },
            { text: 'Dato 2', value: 'dato2' },
            ...
          ],
          url: 'datos',
          filters: [{
            field: 'dato1',
            label: 'Ordenar por dato 1',
            type: 'text',
            typeG: 'String'
          },
          ...],
          graphql: true,
          dataGraphql: `
            dato1
            dato2
          `
        }
      }
    ```

<br>

>Ir a [README](../../README.md)