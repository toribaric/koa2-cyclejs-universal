export function preventDefaultDriver (ev$) {
  ev$.addListener({
    next: ev => ev.preventDefault()
  })
}
