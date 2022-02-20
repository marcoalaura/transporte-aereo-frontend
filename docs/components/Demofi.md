# Componente Demofi
El componente Demofi permite integrar un contenedor para la firma digital de documentos.

## Características
- Integración con el aplicativo Demofi
- Firma del documento solicitado
- Input de verificación del pin del token
- Alerta de integración con Demofi fallida

## Propiedades
Atributo | Descripción | Tipo | Valor por defecto
--- | --- | --- | ---
**solicitud** | Documento solicitado a ser firmado digitalmente | `Object` | `{}`
**onSuccess** | Función que se ejecuta cuando el documento ya ha sido firmado por todos los firmantes | `Function` | `null`

## Uso del componente

1. Importar el componente
    ```js
      import Demofi from '@/common/util/Demofi'
    ```


2. Añadir a los `components` en la instancia de Vue para su uso en el template
    ```js
      components: {
        Demofi
        ...
      }
    ```


3. Definicion del template

    *Template*
    ```html
      <demofi></demofi>
    ```



<br>

>Ir a [README](../../README.md)