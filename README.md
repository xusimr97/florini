# Flover

Source code of Flover website.

## Getting Started

Launch frontend for development.
```
$ quasar dev
```

Start backend.
```
$ npm run back
```

Build as Progressive Web App 
```
$ quasar build --mode pwa
```

## Built With

* [Vue.js](https://vuejs.org/)
* [Quasar](https://v1.quasar-framework.org/)
* [nodejs](https://nodejs.org/)
* [webpack](https://webpack.js.org/)

## Add back/server/datasources.json
{
  "db": {
    "name": "db",
    "connector": "memory"
  }
}