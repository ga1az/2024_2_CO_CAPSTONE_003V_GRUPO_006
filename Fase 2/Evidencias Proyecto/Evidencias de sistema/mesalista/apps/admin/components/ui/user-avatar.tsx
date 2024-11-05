import { AvatarProps } from '@radix-ui/react-avatar'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icons } from '@/components/icons'

interface UserAvatarProps extends AvatarProps {
  user: any
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
  return (
    <Avatar {...props}>
      <AvatarFallback>
        <span className="sr-only">SG</span>
        <Icons.user className="size-4" />
      </AvatarFallback>
    </Avatar>
  )
}
