module.exports = {
  customBodyParse: function (body) {
    const res = {}
    Object.keys(body).forEach(key => {
      switch (body[key]) {
        case 'null':
          res[key] = JSON.parse(body[key])
          break
        case 'true':
          res[key] = JSON.parse(body[key])
          break
        case 'false':
          res[key] = JSON.parse(body[key])
          break
        default:
          if (isNaN(body[key])) {
            if (
              (body[key].charAt(0) === '[' &&
                body[key].charAt(body[key].length - 1) === ']') ||
              (body[key].charAt(0) === '{' &&
                body[key].charAt(body[key].length - 1) === '}')
            ) {
              res[key] = JSON.parse(body[key])
            } else {
              res[key] = body[key]
            }
          } else {
            res[key] = JSON.parse(body[key])
          }
          break
      }
    })
    return res
  },
  makeid: function (length) {
    var result = ''
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }
}
