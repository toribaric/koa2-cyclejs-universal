import xs from 'xstream'

export const INITIAL_STATE = 'INITIAL_STATE'

function initialStateAction (payload) {
  return { type: INITIAL_STATE, payload }
}

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
      .startWith(null)
      .map(state => state
        ? xs.of(state)
        : HTTP.select(category).flatten())
      .flatten()
      .map(res => res.text ? JSON.parse(res.text) : res)
      .map(initialState => initialStateAction(initialState))
  }

  if (initialState) {
    return xs.of(initialStateAction(initialState))
  }

  return HTTP.select(category)
    .flatten()
    .map(res => initialStateAction(JSON.parse(res.text)))
}
