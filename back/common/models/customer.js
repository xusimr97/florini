const app = require('../../server/server')

module.exports = function (Self) {
  Self.CustomLogin = async function (req, res) {
    try {
      await app.dataSources.db.transaction(async models => {
        const { Customer } = models
        const token = await Customer.login({
          email: req.body.email,
          password: req.body.password
        })

        const customer = await Customer.findById(token.userId)
        if (customer.state) {
          res.status(200).send(token)
        } else {
          res.status(400).send({ error: { code: 'USER_DESACTIVATED' } })
        }
      })
    } catch (error) {
      console.log(error)
      res
        .status(400)
        .send({ error: { message: error.message, code: error.code } })
    }
  }

  Self.CustomEdit = async function (req, res) {
    try {
      await app.dataSources.db.transaction(async models => {
        const { Customer, Address } = models
        const customer = await Customer.findById(req.params.id)
        await customer.updateAttributes({
          state: req.body.state,
          name: req.body.name,
          surnames: req.body.surnames,
          email: req.body.email,
          birthDate: req.body.birthDate
        })

        // Update addresses
        const addresses = req.body.addresses

        // Remove addresses
        let arrayids = []
        addresses.forEach(address => {
          if (address.id) {
            arrayids.push(address.id)
          }
        })
        let toRemoveAddresses = await Address.find({
          where: {
            and: [{ id: { nin: arrayids } }, { customerId: customer.id }]
          }
        })
        for (const toRemoveAddress of toRemoveAddresses) {
          await Address.deleteById(toRemoveAddress.id)
        }

        // Upsert addresses
        for (const address of addresses) {
          await Address.upsert({
            id: address.id,
            name: address.name,
            customerId: customer.id,
            countryId: address.countryId,
            regionId: address.regionId,
            zipCode: address.zipCode,
            city: address.city,
            street: address.street,
            number: address.number,
            additionalInformation: address.additionalInformation
          })
        }
      })
    } catch (error) {
      console.log(error)
      res
        .status(400)
        .send({ error: { message: error.message, code: error.code } })
    }
  }

  Self.validatesUniquenessOf('email', {
    message: 'notUniqueEmail'
  })

  Self.validatePassword = function (password) {
    if (!password) {
      const err = new Error('passwordEmpty')
      err.statusCode = 422
      throw err
    }

    const pattern = new RegExp('(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.{6,})')
    if (!pattern.test(password)) {
      const err = new Error('passwordRequeriments')
      err.statusCode = 422
      throw err
    }
  }

  Self.on('resetPasswordRequest', function (info) {
    const from = app.dataSources.email.settings.transports[0].auth.user

    const href = `http://localhost:8080/Customer/set-password?access_token=${info.accessToken.id}`
    const html = `Click <a href="${href}"> here</a> to reset your password`

    Self.app.models.Email.send(
      {
        to: info.email,
        from,
        subject: 'Reset Password',
        html
      },
      function (err) {
        if (err) return console.log(err)
        console.log('> Sending password reset email to:', info.email)
      }
    )
  })
}
