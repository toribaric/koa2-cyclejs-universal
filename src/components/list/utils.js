export function getItemsIds (items) {
  return items.map(item => parseInt(item.data.attrs['data-id']))
}
