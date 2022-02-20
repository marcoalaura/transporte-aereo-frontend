# Componente SelectDate
 El SelectDate, es un componente independiente que se puede utilizar en los formularios, ofrece una representación visual de las fechas de manera separada y tipo texto de la siguiente manera:

    Dia / Mes / Año
 
## Características

- Almacenamiento de la variable **model** en el store de Vuex, esto hace posible que el  valor del campo se pueda utilizar en cualquier parte del proyecto.
- Hace uso del plugin **$filter** para las validaciones de los campos introducidos en el componente.
- Utiliza el plugin **$datetime** de manera interna para el manejo de fechas.
- Actualiza el valor de los campos de manera reactiva gracias al manejo de estados con **$store**.
- Realiza validaciones para los valores máximos de días, meses y años de manera interna.


## Propiedades
Atributo | Descripción | Tipo | Valor por defecto
--- | --- | --- | ---
**label** | Título del componente, que se mostrará | `String` | `''`
**required** | Determina que los campos sean requeridos para validaciones en formulario | `Boolean` | `false`
**disabled** | Determina si los campos estarán habilitados o no | `Boolean` | `false`
**model** | Modelo al cual estará asociado en el store de vuex | `String` | `''`
**store** | Nombre del atributo del store al cual estará asociado en vuex | `String` | `''`
**maxYear** | Configurar año máximo al cual se podrá llegar en el campo Año | `Number` | `2100`
**value** | Valor actual en base al campo model configurado | `Date` | `null`

## Uso del Componente

1. Importar el componente

    ```js
      import SelectDate from '@/common/util/SelectDate'
    ```

2. Añadir a los `components` para usar en el template de Vue

    ```js
      components: {
        SelectDate
        ...
      }
    ```

3. Definición del template (ejemplo)


    *Template*
    ```html
    <select-date
      label="Fecha de nacimiento"
      model="form.fecha_nacimiento"
      :store="store"
      :required="true"
      class="required"
      :disabled="false"
      :max-year="parseInt(maxYear)"
      :value="value">
    </select-date>
    ```

    *Script*
    ```js
    export default {
      data () {
        return {
          store: 'persona',
          maxYear: '2025',
          value: '01/12/2018'
        }
      }
    }
    ```

<br>

> Ir a [README](../../README.md)