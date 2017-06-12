import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import { div, button, input, p } from '@cycle/dom'
import { ADD_LIST, OPEN_MODAL, CLOSE_MODAL } from '../constants'

function intent (DOM, openModal$) {
  const input$ = xs.merge(openModal$, DOM.select('.list-title').events('input'))
    .map(ev => ev.target ? ev.target.value : '')
    .startWith(null)

  const addButton$ = DOM.select('.add-button').events('click')
    .mapTo({ type: ADD_LIST })

  const addAction$ = addButton$
    .compose(sampleCombine(input$))
    .map(([ action, text ]) => ({ type: action.type, payload: text }))

  return xs.merge(addAction$)
}

function model (action$, openModal$) {
  const addAction$ = action$.filter(action => action.type === ADD_LIST)
  return xs.merge(addAction$, openModal$)
    .map(x => x.type === OPEN_MODAL ? { pristine: true } : x)
    .startWith({ pristine: true })
}

function view (state$) {
  return state$.map(state => {
    return div(`.add-list`, [
      div('', [
        p(`Enter list's title`),
        input('.list-title'),
        button('.add-button', 'Add list'),
        !state.pristine && !state.payload
          ? p('.error-message', 'This field is required')
          : ''
      ])
    ])
  })
}

export default function AddList (sources) {
  const action$ = intent(sources.DOM, sources.OpenModal)
  const state$ = model(action$, sources.OpenModal)
  const vtree$ = view(state$)
  const addList$ = action$.filter(action => action.type === ADD_LIST)
  const closeModal$ = addList$
    .map(action => action.payload ? { type: CLOSE_MODAL } : {})

  return {
    DOM: vtree$,
    AddList: addList$,
    CloseModal: closeModal$
  }
}
