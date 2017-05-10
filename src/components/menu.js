import { div, nav, ul, li, a } from '@cycle/dom'
import styles from './menu.css'

export default function Menu (sources) {
  return (
    nav('.navbar .navbar-default', [
      div('.container-fluid', [
        div('.navbar-header', [
          a('.navbar-brand', { attrs: { href: '/' } }, 'Sample app')
        ]),
        ul('.nav .navbar-nav .navbar-left', [
          li(sources.location.path === '/' ? '.active' : '', [
            a({ attrs: { class: `menu-item ${styles.menuItem}`, href: '/' } }, 'Home')
          ]),
          li(sources.location.path === '/about' ? '.active' : '', [
            a({ attrs: { class: `menu-item ${styles.menuItem}`, href: '/about' } }, 'About')
          ])
        ])
      ])
    ])
  )
}
