const util = require('util')
const server = require('./server')

const readline = require('readline')

// Exec Main Function
;(async () => {
  await main()
})().catch(e => {
  console.log(e)
})

async function main () {
  const username = await askQuestion('userName:  ')
  const email = await askQuestion('Email: ')
  const password = await askQuestion('Password: ')

  var Role = server.models.Role
  var User = server.models.Customer
  var RoleMapping = server.models.RoleMapping
  try {
    const user = await util.promisify(User.updateOrCreate).call(User, {
      username: username,
      email: email,
      password: password
    })

    // console.log(user)

    const role = await util.promisify(Role.findOrCreate).call(
      Role,
      {
        where: {
          name: 'admin'
        }
      },
      {
        name: 'admin'
      }
    )

    // console.log(role.principals)

    const RoleMapping = await util
      .promisify(role.principals.findOne)
      .call(role.principals, {
        where: {
          principalId: user.id
        }
      })

    if (!RoleMapping) {
      await util.promisify(role.principals.create).call(role.principals, {
        principalType: 'Customer',
        principalId: user.id
      })
    }

    console.log('admin created successfully')
    process.exit(0)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

async function askQuestion (query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close()
      resolve(ans)
    })
  )
}
