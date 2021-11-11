import defaultState from './state'

export function setToken (state, token) {
  state.token = token
}

export function setCustomer (state, object) {
  if (object) {
    Object.keys(object).forEach(key => {
      state[key] = object[key]
    })
  } else {
    for (var key in state) delete state[key]
    Object.assign(state, defaultState)
  }
}
