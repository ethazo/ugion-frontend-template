// 角色标识放 shared/ 而不是 app/roles.ts:请求层校验响应里的 role 要用到它,
// 如果取值来自装配层,feature 就成了向上依赖。角色元信息(标签、落地路径、布局)仍在 app/roles.ts。

export const ROLES = ['student', 'teacher', 'admin'] as const

export type Role = (typeof ROLES)[number]

/** 后端角色取值是大写,前端统一小写:角色标识要进路由路径和注册表 key。 */
export type BackendRole = Uppercase<Role>

const BACKEND_ROLE_BY_ROLE: Record<Role, BackendRole> = {
  student: 'STUDENT',
  teacher: 'TEACHER',
  admin: 'ADMIN',
}

const ROLE_BY_BACKEND_ROLE = new Map<string, Role>(
  ROLES.map((role) => [BACKEND_ROLE_BY_ROLE[role], role]),
)

export function roleToBackend(role: Role): BackendRole {
  return BACKEND_ROLE_BY_ROLE[role]
}

export function roleFromBackend(value: string): Role | undefined {
  return ROLE_BY_BACKEND_ROLE.get(value)
}
