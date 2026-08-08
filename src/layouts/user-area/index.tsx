import { useNavigate } from '@tanstack/react-router'
import { Check, LogOut, Monitor, Moon, Sun } from 'lucide-react'

import { type ThemeMode, useTheme } from '@/shared/hooks/useTheme'
import { fileUrl } from '@/shared/lib/fileUrl'
import { useCurrentUser, useLogout } from '@/shared/session'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Skeleton } from '@/shared/ui/skeleton'

const THEME_OPTIONS: ReadonlyArray<{ mode: ThemeMode; label: string; icon: typeof Sun }> = [
  { mode: 'light', label: '亮色', icon: Sun },
  { mode: 'dark', label: '暗色', icon: Moon },
  { mode: 'system', label: '跟随系统', icon: Monitor },
]

interface UserAreaProps {
  roleLabel: string
}

export function UserArea({ roleLabel }: UserAreaProps) {
  const { data: user } = useCurrentUser()
  const { mode, setMode } = useTheme()
  const logout = useLogout()
  const navigate = useNavigate()

  // 布局只在启动引导拿到用户之后才渲染,这里的骨架屏是退出登录清缓存那一瞬间的过渡
  if (!user) return <Skeleton className="size-8 rounded-full" />

  const avatarSrc = user.avatarFileId === null ? undefined : fileUrl(user.avatarFileId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={`${user.fullName},展开账户菜单`} />}
      >
        <Avatar className="size-7">
          {avatarSrc === undefined ? null : <AvatarImage src={avatarSrc} alt="" />}
          <AvatarFallback>{user.fullName.slice(0, 1)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="font-medium">{user.fullName}</span>
            <span className="text-muted-foreground text-xs font-normal">{roleLabel}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {THEME_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.mode}
              closeOnClick={false}
              onClick={() => setMode(option.mode)}
            >
              <option.icon />
              {option.label}
              {option.mode === mode ? <Check className="ml-auto" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={logout.isPending}
          onClick={() => {
            logout.mutate(undefined, {
              // 失败也走登录页:退不掉多半是会话已经没了,留在原地反而没有出口
              onSettled: () => void navigate({ to: '/login', replace: true }),
            })
          }}
        >
          <LogOut />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
