// Imports
const mysql = require('mysql')
const util = require('util')
const dsConfig = require('../datasources.local.json')
const data = require('./data.json')

// Declare Data
const limitItems = 10

const dbConfig = {
  host: dsConfig.db.host,
  user: dsConfig.db.user,
  password: dsConfig.db.password,
  database: dsConfig.db.database,
  port: dsConfig.db.port
}
const db = makeDb(dbConfig)

let processStatus = 0
let totalItems = 0
let totalItemTypes = 0
let totalItemCategories = 0
let totalItemTags = 0
let totalTags = 0

// Exec Main Function
;(async () => {
  await main()
})().catch(async e => {
  await db.close()
  console.log(e)
  process.exit(1)
})

// Init Transactions
async function main () {
  try {
    await db.beginTransaction()
    let countryId = 1
    for (const country of data) {
      console.log('Country: ' + country.countryName + '\n')
      var countryQuery = {
        id: countryId,
        name: country.countryName
      }
      await db.query('INSERT IGNORE INTO Country SET ?', countryQuery)

      for (const region of country.regions) {
        console.log('Region: ' + region.name + '\n')
        var regionQuery = {
          countryId: countryId,
          name: region.name
        }
        await db.query('INSERT IGNORE INTO Region SET ?', regionQuery)
      }
      countryId++
    }

    await db.commit()
    console.log(
      '================ Countries Imported Successfully ================\n\n'
    )
  } catch (error) {
    await db.rollback()
    console.log(error)
    processStatus = 1
  } finally {
    await db.close()
    process.exit(processStatus)
  }
}

function makeDb (config) {
  const connection = mysql.createConnection(config)
  return {
    query (sql, args) {
      return util.promisify(connection.query).call(connection, sql, args)
    },
    close () {
      return util.promisify(connection.end).call(connection)
    },
    beginTransaction () {
      return util.promisify(connection.beginTransaction).call(connection)
    },
    commit () {
      return util.promisify(connection.commit).call(connection)
    },
    rollback () {
      return util.promisify(connection.rollback).call(connection)
    }
  }
}
