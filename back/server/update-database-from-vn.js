// Imports
const mysql = require('mysql')
const util = require('util')
const dsConfig = require('./datasources.local.json')

// Declare Data
const limitItems = 10

const vnConfig = {
  host: dsConfig.vn.host,
  user: dsConfig.vn.username,
  password: dsConfig.vn.password,
  database: dsConfig.vn.database,
  port: dsConfig.vn.port
}
const dbConfig = {
  host: dsConfig.db.host,
  user: dsConfig.db.user,
  password: dsConfig.db.password,
  database: dsConfig.db.database,
  port: dsConfig.db.port
}
const vn = makeDb(vnConfig)
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
})().catch(e => {
  console.log(e)
  process.exit(1)
})

// Init Transactions
async function main () {
  try {
    await db.beginTransaction()
    console.log(
      '================ Connecting Database VN and LOCAL ================\n'
    )
    const vnTags = await vn.query('SELECT * FROM tag')
    for (const tag of vnTags) {
      totalTags++
      console.log('Tag: ' + tag.name + '\n')
      var tagQuery = {
        id: tag.id,
        name: tag.name,
        isFree: tag.isFree,
        sourceTable: tag.sourceTable,
        unit: tag.unit,
        code: tag.code,
        overWrite: tag.overWrite,
        isQuantitatif: tag.isQuantitatif
      }
      await db.query('INSERT IGNORE INTO tag SET ?', tagQuery)
    }

    const vnItemCategories = await vn.query(
      'SELECT * FROM itemCategory WHERE id NOT IN (9,12)'
    )

    for (const itemCategory of vnItemCategories) {
      totalItemCategories++
      console.log('Item Category: ' + itemCategory.name + '\n')
      var itemCategoryQuery = {
        id: itemCategory.id,
        code: itemCategory.code,
        name: itemCategory.name,
        order: itemCategory.order,
        display: itemCategory.display,
        color: itemCategory.color,
        shortLife: itemCategory.shortLife,
        merchandise: itemCategory.merchandise,
        icon: itemCategory.icon,
        isReclining: itemCategory.isReclining
      }
      await db.query('INSERT IGNORE INTO itemCategory SET ?', itemCategoryQuery)

      const vnItemTypes = await vn.query(
        'SELECT * FROM itemType WHERE categoryFk=' + itemCategory.id
      )

      for (const itemType of vnItemTypes) {
        totalItemTypes++
        console.log(' Item Type: ' + itemType.name + '\n')
        var itemTypeQuery = {
          id: itemType.id,
          code: itemType.code,
          name: itemType.name,
          life: itemType.life,
          isPackaging: itemType.isPackaging,
          categoryFk: itemType.categoryFk
        }

        await db.query('INSERT IGNORE INTO itemType SET ?', itemTypeQuery)

        const vnItems = await vn.query(
          'SELECT * FROM item WHERE typeFk=' +
            itemTypeQuery.id +
            ' LIMIT ' +
            limitItems
        )

        for (const item of vnItems) {
          totalItems++
          console.log('   Item: ' + item.name + '\n')
          var itemQuery = {
            id: item.id,
            name: item.name,
            size: item.size,
            category: item.category,
            typeFk: item.typeFk,
            stems: item.stems,
            description: item.description,
            isOnOffer: item.isOnOffer,
            isBargain: item.isBargain,
            isActive: item.isActive,
            comment: item.comment,
            relevancy: item.relevancy,
            density: item.density,
            image: item.image,
            longName: item.longName,
            subName: item.subName,
            tag5: item.tag5,
            value5: item.value5,
            tag6: item.tag6,
            value6: item.value6,
            tag7: item.tag7,
            value7: item.value7,
            tag8: item.tag8,
            value8: item.value8,
            tag9: item.tag9,
            value9: item.value9,
            tag10: item.tag10,
            value10: item.value10
          }
          await db.query('INSERT IGNORE INTO item SET ?', itemQuery)

          const vnItemTags = await vn.query(
            'SELECT * FROM itemTag WHERE itemFk=' + item.id + ''
          )
          for (const itemTag of vnItemTags) {
            totalItemTags++
            var itemTagQuery = {
              id: itemTag.id,
              value: itemTag.value,
              intValue: itemTag.intValue,
              itemFk: itemTag.itemFk,
              tagFk: itemTag.tagFk,
              priority: itemTag.priority
            }
            await db.query('INSERT IGNORE INTO itemTag SET ?', itemTagQuery)
          }
        }
      }
    }

    await db.commit()
    console.log(
      '================ ItemCategories, ItemTypes, Items and ItemTag Updated Successfully  ================\n\n'
    )
    console.log('ItemCategories: ' + totalItemCategories + '\n')
    console.log('ItemTypes: ' + totalItemTypes + '\n')
    console.log('Items: ' + totalItems + '\n')
    console.log('Tags: ' + totalTags + '\n')
    console.log('Item Tags: ' + totalItemTags + '\n')
  } catch (error) {
    await db.rollback()
    console.log(error)
    processStatus = 1
  } finally {
    await vn.close()
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
