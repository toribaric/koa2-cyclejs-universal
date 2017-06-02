import xs from 'xstream'
import sampleCombine from 'xstream/extra/sampleCombine'
import { div, button, input, p } from '@cycle/dom'
import { ADD_ITEM, OPEN_MODAL, CLOSE_MODAL } from '../constants'

function intent (DOM, openModal$) {
  const input$ = xs.merge(openModal$, DOM.select('.item-title').events('input'))
    .map(ev => ev.target ? ev.target.value : '')
    .startWith(null)

  const addButton$ = DOM.select('.add-button').events('click')
    .mapTo({ type: ADD_ITEM })

  // sampleCombine combines multiple streams with a source stream
  // (addButton$ in this case), and the result stream will emit
  // the latest events from all combined streams but only when
  // source stream emits
  const addAction$ = addButton$
    .compose(sampleCombine(input$))
    .map(([ action, text ]) => ({ type: action.type, payload: text }))

  return xs.merge(addAction$)
}

function model (action$, openModal$) {
  const addAction$ = action$.filter(action => action.type === ADD_ITEM)
  return xs.merge(addAction$, openModal$)
    .map(x => x.type === OPEN_MODAL ? { pristine: true } : x)
    .startWith({ pristine: true })
}

function view (state$) {
  return state$.map(state => {
    return div(`.add-item`, [
      div('', [
        p(`Enter item's title`),
        input('.item-title'),
        button('.add-button', 'Add item'),
        !state.pristine && !state.payload
          ? p('.error-message', 'This field is required')
          : ''
      ])
    ])
  })
}

export default function AddItem (sources) {
  const action$ = intent(sources.DOM, sources.OpenModal)
  const state$ = model(action$, sources.OpenModal)
  const vtree$ = view(state$)
  const addItem$ = action$.filter(action => action.type === ADD_ITEM)
  const closeModal$ = addItem$
    .map(action => action.payload ? { type: CLOSE_MODAL } : {})

  return {
    DOM: vtree$,
    AddItem: addItem$,
    CloseModal: closeModal$
  }
}
