export interface PageResult<T> {
  items: T[]
  page: number
  size: number
  total: number
}
