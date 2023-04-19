import { onMounted, onUnmounted } from 'vue'
const useKeyPress = (key: string, cb: () => any) => {
  const trigger = (event: KeyboardEvent) => {
    if (event.key === key) {
      cb()
    }
  }
  onMounted(() => {
    document.addEventListener('keydown', trigger)
  })
  onUnmounted(() => {
    document.removeEventListener('keydown', trigger)
  })
}

export default useKeyPress
