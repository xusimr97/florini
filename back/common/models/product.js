'use strict'
const fs = require('fs')
const app = require('../../server/server')
const util = require('util')
const { customBodyParse, makeid } = require('../../server/utils')
const moment = require('moment') // require
const writeFile = util.promisify(fs.writeFile)

module.exports = function (Product) {
  // Create Product Version
  Product.createProductVersion = async function (req, res) {
    try {
      await app.dataSources.db.transaction(async models => {
        const {
          Product,
          ProductVersion,
          ProductVersionTranslation,
          ProductVersionTag,
          Image
        } = models
        const body = customBodyParse(req.body)

        // Create Product Version
        const productVersion = await ProductVersion.create({
          productId: JSON.parse(req.params.id),
          ean: body.ean,
          state: body.state,
          price: body.price,
          stock: body.stock,
          sku: body.sku,
          externalId: body.externalId
        })

        // Create ProductVersion Translations
        const productVersionTranslations = body.translations
        for (const productVersionTranslation of productVersionTranslations) {
          await ProductVersionTranslation.create({
            productVersionId: productVersion.id,
            locale: productVersionTranslation.locale,
            title: productVersionTranslation.title,
            text: productVersionTranslation.text,
            shortText: productVersionTranslation.shortText
          })
        }

        // Create ProductVersionTag
        const productVersionTags = body.tags
        for (const productVersionTag of productVersionTags) {
          await ProductVersionTag.create({
            productVersionId: productVersion.id,
            tagId: productVersionTag.tag,
            value: productVersionTag.value
          })
        }

        // Create Images
        const images = req.files
        const date = moment().format('YYYY-MM-DD')
        for (const [index, image] of images.entries()) {
          const dir =
            __dirname +
            `/../../client/products/${req.params.id}/${productVersion.id}`

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
          }

          const url =
            `products/${req.params.id}/${productVersion.id}/${date}-` +
            makeid(7)

          await writeFile(__dirname + `/../../client/` + url, image.buffer)

          // Save url in Database
          Image.create({
            productVersionId: productVersion.id,
            order: index,
            url
          })
        }
      })
    } catch (error) {
      console.log(error)
    }
  }

  // Edit Product Version
  Product.editProductVersion = async function (req, res) {
    try {
      await app.dataSources.db.transaction(async models => {
        const {
          Product,
          ProductVersion,
          ProductVersionTranslation,
          ProductVersionTag,
          Image
        } = models
        const body = customBodyParse(req.body)
        console.log(body)
        // return

        // Update Product Version
        const productVersion = await ProductVersion.findById(
          req.params.versionId
        )
        await productVersion.patchAttributes({
          productId: JSON.parse(req.params.id),
          ean: body.ean,
          state: body.state,
          price: body.price,
          stock: body.stock,
          sku: body.sku,
          externalId: body.externalId
        })

        // Update ProductVersion Translations
        const productVersionTranslations = body.translations

        // Remove Translations
        let arrayids = []
        productVersionTranslations.forEach(productVersionTranslation => {
          if (productVersionTranslation.id) {
            arrayids.push(productVersionTranslation.id)
          }
        })
        let toRemoveProductVersionTranslations = await ProductVersionTranslation.find(
          { where: { id: { nin: arrayids } } }
        )
        for (const toRemoveProductVersionTranslation of toRemoveProductVersionTranslations) {
          await ProductVersionTranslation.deleteById(
            toRemoveProductVersionTranslation.id
          )
        }

        // Upsert Translations
        for (const productVersionTranslation of productVersionTranslations) {
          // if()
          await ProductVersionTranslation.upsert({
            id: productVersionTranslation.id,
            productVersionId: productVersion.id,
            locale: productVersionTranslation.locale,
            title: productVersionTranslation.title,
            text: productVersionTranslation.text,
            shortText: productVersionTranslation.shortText
          })
        }
        return
        // Create ProductVersionTag
        const productVersionTags = body.tags
        for (const productVersionTag of productVersionTags) {
          await ProductVersionTag.create({
            productVersionId: productVersion.id,
            tagId: productVersionTag.tag,
            value: productVersionTag.value
          })
        }

        // Create Images
        const images = req.files
        const date = moment().format('YYYY-MM-DD')
        for (const [index, image] of images.entries()) {
          const dir =
            __dirname +
            `/../../client/products/${req.params.id}/${productVersion.id}`

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
          }

          const url =
            `products/${req.params.id}/${productVersion.id}/${date}-` +
            makeid(7)

          await writeFile(__dirname + `/../../client/` + url, image.buffer)

          // Save url in Database
          Image.create({
            productVersionId: productVersion.id,
            order: index,
            url
          })
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
}

// WriteFile
// fs.writeFile(
//   __dirname + '/../../client/' + req.files[0].originalname,
//   req.files[0].buffer,
//   function (err) {
//     if (err) throw err
//     return 'Saved!'
//   }
// )
