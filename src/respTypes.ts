export interface RespData<T = object> {
  errno: number
  data: T
  message?: string
}
export interface ListData<T> {
  list: T[]
  count: number
}

export type RespListData<T> = RespData<ListData<T>>
