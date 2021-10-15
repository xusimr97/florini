'use strict'
const app = require('../../server/server')
const { customBodyParse, makeid } = require('../../server/utils')
const moment = require('moment') // require

module.exports = function (Shippingzone) {
  // Create Shippingzone
  Shippingzone.createShippingZone = async function (req, res) {
    try {
      await app.dataSources.db.transaction(async models => {
        const { ShippingZone, ShippingZoneRegion } = models

        // Create shippingZone
        const shippingZone = await ShippingZone.create({
          name: req.body.name,
          price: req.body.price,
          state: req.body.state
        })

        // Create shippingZoneRegions
        const shippingZoneRegions = req.body.regions
        for (const shippingZoneRegion of shippingZoneRegions) {
          await ShippingZoneRegion.create({
            shippingZoneId: shippingZone.id,
            regionId: shippingZoneRegion
          })
        }
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({ error: { message: error.message } })
    }
  }

  // Edit Shippingzone
  Shippingzone.editShippingZone = async function (req, res) {
    try {
      await app.dataSources.db.transaction(async models => {
        const { ShippingZone, ShippingZoneRegion } = models

        // Update ShippingZone
        const shippingZone = await ShippingZone.findById(req.params.id)
        await shippingZone.patchAttributes({
          name: req.body.name,
          price: req.body.price,
          state: req.body.state
        })

        // Update shippingZoneRegions
        const shippingZoneRegions = req.body.regions

        // Remove shippingZoneRegions
        let arrayids = []
        shippingZoneRegions.forEach(shippingZoneRegion => {
          if (shippingZoneRegion.shippingZoneRegion) {
            arrayids.push(shippingZoneRegion.shippingZoneRegion)
          }
        })
        let toRemoveShippingZoneRegions = await ShippingZoneRegion.find({
          where: {
            and: [
              { id: { nin: arrayids } },
              { shippingZoneId: shippingZone.id }
            ]
          }
        })
        for (const toRemoveShippingZoneRegion of toRemoveShippingZoneRegions) {
          await ShippingZoneRegion.deleteById(toRemoveShippingZoneRegion.id)
        }

        // Upsert shippingZoneRegion
        for (const shippingZoneRegion of shippingZoneRegions) {
          await ShippingZoneRegion.upsert({
            id: shippingZoneRegion.shippingZoneRegion,
            shippingZoneId: shippingZone.id,
            regionId: shippingZoneRegion.region
          })
        }
      })
    } catch (error) {
      console.log(error.message)
      res.status(400).send({ error: { message: error.message } })
    }
  }
}
