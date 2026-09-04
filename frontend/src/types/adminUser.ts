export type AdminUserRole = 'AUTHOR' | 'ADMIN'
export type AdminUserStatus = 'ACTIVE' | 'DISABLED'

export interface AdminUser {
  id: number
  username: string
  email: string
  phone: string | null
  role: AdminUserRole
  createdAt: string
  status: AdminUserStatus
}
