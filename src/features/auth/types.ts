export type UserRole = 'ADMIN' | 'STUDENT' | 'TEACHER'

export interface LoginRequest {
  username: string
  password: string
}
