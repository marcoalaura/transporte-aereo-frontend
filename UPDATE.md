## Plataforma Interinstitucional de transporte aéreo - Frontend

A continuación se detalla los pasos para actualizar la aplicación en PRODUCCIÓN

### Actualización de la Aplicación


Para actualizar el código fuente del repositorio ejecutar el siguiente comando:

```sh
$ git pull origin master
```

Instalar paquetes nuevos (en caso de haber nuevas librerías añadidas)
```sh
$ npm install
```

## Compilando la aplicación

1. Ejecutar el siguiente comando para compilar la aplicación, debe generarse la carpeta `dist`

    ```sh
    $ npm run build
    ```

2. Renombrar la capeta `dist` como `nueva_ruta`

    ```sh
    $ mv dist nueva_ruta
    ```

3. Crear un enlace simbolico en la carpeta raiz del servidor web Nginx

    ```sh
    $ sudo ln -s /home/usuario/plataforma-aerea-frontend/nueva_ruta /var/www/html/proyecto
    ```

  
`Reiniciar la aplicación con el manejador de procesos ej pm2`