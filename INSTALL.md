# Instalación

## Requerimientos del servidor

Ver [SERVER.md](SERVER.md)

## Instalación del proyecto

1. Clonar el código fuente desde el repositorio.

```sh
$ git clone https://gitlab.agetic.gob.bo/aereo/plataforma-aerea-frontend.git
```

> Es posible que al descargar el proyecto con HTTPs, muestre siguiente error:
> ```sh
> Cloning into 'nombre-del-proyecto'...
> fatal: unable to access 'https://gitlab.agetic.gob.bo/aereo/plataforma-aerea-frontend.git/': server certificate verification >failed. CAfile: /etc/ssl/certs/ca-certificates.crt CRLfile: none
> ```


> Configurar lo siguiente e intentar nuevamente la clonación:
> ```sh
> git config --global http.sslverify false
> ```

2. Ingresar a la carpeta.

```sh
$ cd plataforma-aerea-frontend
```

3. Verificar que se encuentra en la rama master o develop.

```sh
$ git branch
```

4. Instalar las dependencias de paquetes npm

```sh
$ npm install
```

## Configuraciones

1. Copiar archivos de configuración

```sh
$ cp config/index.js.sample config/index.js
$ cp config/prod.env.js.sample config/prod.env.js
$ cp config/dev.env.js.sample config/dev.env.js
```

2. Configurar URLs `nano config/prod.env.js`

```js
module.exports = {
  NODE_ENV: '"production"',
  API_URL: '"https://midominio.gob.bo/proyecto/backend/api/"',
  GRAPHQL_URL: '"https://midominio.gob.bo/proyecto/backend/graphql/"',
  AUTH_URL: '"https://midominio.gob.bo/proyecto/backend/auth"',
  TIME_SESSION_EXPIRED: 30,
  ONBEFOREUNLOAD: false,
  AUTH_TOKEN: '"Bearer"',
  LANG: '"es"',
  DEBUG_MODE: false
}
```

3. Configurar la ruta de subdirectorios `nano config/index.js` (opcional)

```js
...
    assetsPublicPath: '/aereo/', // AQUÍ DEFINIMOS EL PATH DEL SISTEMA
...
```

## Generar archivos minificados

1. Ejecutar el siguiente comando y esperar los resultados, debe generarse la carpeta `dist`

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

---

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
