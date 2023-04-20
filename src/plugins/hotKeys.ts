import useHotKey from '../hooks/useHotKey'

export default function initHotKeys() {
  useHotKey('ctrl+c, command+c', () => {
    alert('ctrl+c, command+c')
  })
  useHotKey('ctrl+v, command+v', () => {
    alert('ctrl+v, command+v')
  })
}
