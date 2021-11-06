'use strict'
const app = require('../../server/server')
const { customBodyParse, makeid } = require('../../server/utils')
const moment = require('moment') // require

module.exports = function (Order) {
  // Create Shippingzone
  Order.createOrder = async function (req, res) {
    try {
      await app.dataSources.db.transaction(async models => {
        const { Order, OrderRow, Shipping, Payment } = models

        console.log(req.body)
        // return

        // Create Order
        const order = await Order.create({
          createdDate: req.body.createdDate,
          customerId: req.body.customer,
          state: req.body.state
        })

        // Create orderRows
        const products = req.body.products
        for (const product of products) {
          await OrderRow.create({
            orderId: order.id,
            buyId: product.buyId,
            productVersionId: product.productVersionId,
            amount: product.amount
          })
        }

        // Create Shipping
        const shipping = await Shipping.create({
          orderId: order.id,
          deliveryDate: req.body.shipping.deliveryDate,
          shippingMethodId: req.body.shipping.shippingMethod,
          shippingZoneId: req.body.shipping.shippingZone,
          street: req.body.shipping.street,
          number: req.body.shipping.number,
          zipCode: req.body.shipping.zipCode,
          additionalInformation: req.body.shipping.additionalInformation,
          city: req.body.shipping.city,
          regionId: req.body.shipping.region,
          countryId: req.body.shipping.country,
          state: req.body.shipping.state
        })

        // Create Payment
        const payment = await Payment.create({
          orderId: order.id,
          paymentDate: req.body.payment.paymentDate,
          paymentMethodId: req.body.payment.paymentMethod,
          amount: req.body.payment.amount,
          street: req.body.payment.street,
          number: req.body.payment.number,
          zipCode: req.body.payment.zipCode,
          additionalInformation: req.body.payment.additionalInformation,
          city: req.body.payment.city,
          regionId: req.body.payment.region,
          countryId: req.body.payment.country,
          state: req.body.payment.state
        })
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({ error: { message: error.message } })
    }
  }

  Order.editOrder = async function (req, res) {
    try {
      await app.dataSources.db.transaction(async models => {
        const { Order, OrderRow, Shipping, Payment } = models

        console.log(req.body)
        // return

        // Edit Order
        const order = await Order.findById(req.params.id)
        await order.patchAttributes({
          createdDate: req.body.createdDate,
          customerId: req.body.customer,
          state: req.body.state
        })

        // Update orderRows
        const orderRows = req.body.products

        // Remove orderRows
        let arrayids = []
        orderRows.forEach(orderRow => {
          if (orderRow.id) {
            arrayids.push(orderRow.id)
          }
        })
        let toRemoveOrderRows = await OrderRow.find({
          where: {
            and: [{ id: { nin: arrayids } }, { orderId: order.id }]
          }
        })
        for (const toRemoveOrderRow of toRemoveOrderRows) {
          await OrderRow.deleteById(toRemoveOrderRow.id)
        }

        // Upsert orderRows
        for (const orderRow of orderRows) {
          await OrderRow.upsert({
            id: orderRow.id,
            orderId: order.id,
            buyId: orderRow.buyId,
            productVersionId: orderRow.productVersionId,
            amount: orderRow.amount
          })
        }

        // Create Shipping
        const shipping = await Shipping.upsert({
          id: req.body.shipping.id,
          orderId: order.id,
          deliveryDate: req.body.shipping.deliveryDate,
          shippingMethodId: req.body.shipping.shippingMethod,
          shippingZoneId: req.body.shipping.shippingZone,
          street: req.body.shipping.street,
          number: req.body.shipping.number,
          zipCode: req.body.shipping.zipCode,
          additionalInformation: req.body.shipping.additionalInformation,
          city: req.body.shipping.city,
          regionId: req.body.shipping.region,
          countryId: req.body.shipping.country,
          state: req.body.shipping.state
        })

        // Create Payment
        const payment = await Payment.upsert({
          id: req.body.payment.id,
          orderId: order.id,
          paymentDate: req.body.payment.paymentDate,
          paymentMethodId: req.body.payment.paymentMethod,
          amount: req.body.payment.amount,
          street: req.body.payment.street,
          number: req.body.payment.number,
          zipCode: req.body.payment.zipCode,
          additionalInformation: req.body.payment.additionalInformation,
          city: req.body.payment.city,
          regionId: req.body.payment.region,
          countryId: req.body.payment.country,
          state: req.body.payment.state
        })
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({ error: { message: error.message } })
    }
  }
}
