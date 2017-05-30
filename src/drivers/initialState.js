import xs from 'xstream'

export function initialStateDriver () {
  return xs.create({
    start: listener => {
      if (typeof window === 'undefined' || !window.state) {
        listener.next(null)
        return
      }

      const state = window.state
      window.state = null

      listener.next(state)
    },
    stop: () => {}
  })
}

export function getRequestWithState (initialState, url, category) {
  if (initialState && typeof initialState === 'object' && initialState.addListener) {
    return initialState
      .map(state => !state || (state.concat && state.length === 0)
        ? xs.of({ url, category })
        : xs.empty())
      .flatten()
  }

  if (initialState) {
    return xs.empty()
  }

  return xs.of({ url, category })
}

export function getResponseWithState (initialState, HTTP, category) {
  if (initialState && typeof initialState === 'object' && initialState.addListener) {
    return initialState
      .map(state => state
        ? xs.of(state)
        : HTTP.select(category).flatten())
      .flatten()
      .map(res => res.text ? JSON.parse(res.text) : res)
  }

  if (initialState) {
    return xs.of(initialState)
  }

  return HTTP.select(category)
    .flatten()
    .map(res => JSON.parse(res.text))
}
