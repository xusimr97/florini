var server = require('./server')
var ds = server.dataSources.db

ds.automigrate(null, function (er) {
  if (er) {
    throw er
  }
  ds.disconnect()
  console.log('Done')
  process.exit(0)
})
