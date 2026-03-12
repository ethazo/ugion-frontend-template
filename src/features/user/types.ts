export type UserRole = 'admin' | 'teacher' | 'student'

export interface User {
  id?: number | string
  username: string
  name?: string
  role: UserRole
  gender?: number
  age?: number
  avatar?: string
  mobile?: number
  email?: string
}
