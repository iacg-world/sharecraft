export interface RespData<T> {
  errno: number
  data: T
}
export interface ListData<T> {
  list: T[]
  count: number
}

export type RespListData<T> = RespData<ListData<T>>
