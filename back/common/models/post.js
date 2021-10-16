'use strict'
const fs = require('fs')
const app = require('../../server/server')
const util = require('util')
const { customBodyParse, makeid } = require('../../server/utils')
const moment = require('moment') // require
const writeFile = util.promisify(fs.writeFile)

module.exports = function (Post) {
  Post.validatesInclusionOf('type', {
    in: ['post', 'slider'],
    message: 'invalidType'
  })

  // Create Post
  Post.createPost = async function (req, res) {
    try {
      await app.dataSources.db.transaction(async models => {
        const { Post, PostTranslation } = models
        const body = customBodyParse(req.body)

        console.log(body)

        // Create Product Version
        const post = await Post.create({
          type: body.type,
          state: body.state,
          url: body.url,
          image: 'tmp'
        })

        // Create ProductVersion Translations
        const postTranslations = body.translations
        for (const postTranslation of postTranslations) {
          await PostTranslation.create({
            postId: post.id,
            locale: postTranslation.locale,
            title: postTranslation.title,
            text: postTranslation.text
          })
        }

        // Create Image
        const images = req.files
        const date = moment().format('YYYY-MM-DD')
        for (const [index, image] of images.entries()) {
          const dir = __dirname + `/../../client/posts/${post.id}`

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
          }

          const url = `posts/${post.id}/${date}-` + makeid(7)

          await writeFile(__dirname + `/../../client/` + url, image.buffer)

          // Save url in Database
          post.updateAttribute('image', url)
        }
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({ error: { message: error.message } })
    }
  }

  // Edit Post
  Post.editPost = async function (req, res) {
    try {
      await app.dataSources.db.transaction(async models => {
        const { Post, PostTranslation } = models
        const body = customBodyParse(req.body)

        console.log(body)

        // Update Post
        const post = await Post.findById(req.params.id)
        await post.patchAttributes({
          type: body.type,
          state: body.state,
          url: body.url
        })

        // Update post Translations
        const postTranslations = body.translations
        // Remove Translations
        let arrayids = []
        postTranslations.forEach(postTranslation => {
          if (postTranslation.id) {
            arrayids.push(postTranslation.id)
          }
        })
        let toRemovePostTranslations = await PostTranslation.find({
          where: {
            and: [{ id: { nin: arrayids } }, { postId: post.id }]
          }
        })
        for (const toRemovePostTranslation of toRemovePostTranslations) {
          await PostTranslation.deleteById(toRemovePostTranslation.id)
        }

        // Upsert Translations
        for (const postTranslation of postTranslations) {
          await PostTranslation.upsert({
            id: postTranslation.id,
            postId: post.id,
            locale: postTranslation.locale,
            title: postTranslation.title,
            text: postTranslation.text
          })
        }

        const images = req.files
        if (images.length) {
          // Remove Images
          fs.unlinkSync(`${__dirname}/../../client/${post.image}`)
          // Create Image
          const date = moment().format('YYYY-MM-DD')
          for (const [index, image] of images.entries()) {
            const dir = __dirname + `/../../client/posts/${post.id}`

            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true })
            }

            const url = `posts/${post.id}/${date}-` + makeid(7)

            await writeFile(__dirname + `/../../client/` + url, image.buffer)

            // Save url in Database
            post.updateAttribute('image', url)
          }
        }
      })
    } catch (error) {
      console.log(error)
      res.status(400).send({ error: { message: error.message } })
    }
  }
}
