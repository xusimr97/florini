export function setToken (state, token) {
  state.token = token
}

export function setCustomer (state, object) {
  Object.keys(object).forEach(key => {
    state[key] = object[key]
  })
}
