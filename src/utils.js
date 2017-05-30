export function getLists () {
  return [
    {
      id: 1,
      title: 'List 1'
    },
    {
      id: 2,
      title: 'List 2'
    }
  ]
}

export function getListItems (listId) {
  if (listId === 1) {
    return [
      { title: 'Item 1' },
      { title: 'Item 2' },
      { title: 'Item 3' }
    ]
  }

  return [
    { title: 'Item 4' },
    { title: 'Item 5' },
    { title: 'Item 6' },
    { title: 'Item 7' }
  ]
}
