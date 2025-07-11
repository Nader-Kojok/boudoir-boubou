import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { User, Crown, Shield, Star } from "lucide-react"

export interface UserAvatarProps {
  src?: string
  alt?: string
  fallback?: string
  name?: string
  email?: string
  role?: "user" | "admin" | "moderator" | "premium"
  isOnline?: boolean
  showStatus?: boolean
  showBadge?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  onClick?: () => void
}

const sizeClasses = {
  sm: "size-6",
  md: "size-8",
  lg: "size-12",
  xl: "size-16",
}

const statusSizeClasses = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3",
  xl: "size-4",
}

const badgeIcons = {
  admin: Crown,
  moderator: Shield,
  premium: Star,
  user: null,
}

const badgeColors = {
  admin: "bg-yellow-500 text-white",
  moderator: "bg-blue-500 text-white",
  premium: "bg-purple-500 text-white",
  user: "bg-gray-500 text-white",
}

export function UserAvatar({
  src,
  alt,
  fallback,
  name,
  email,
  role = "user",
  isOnline = false,
  showStatus = false,
  showBadge = false,
  size = "md",
  className,
  onClick,
}: UserAvatarProps) {
  const initials = React.useMemo(() => {
    if (fallback) return fallback
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return 'U'
  }, [fallback, name, email])

  const BadgeIcon = badgeIcons[role]

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar 
        className={cn(
          sizeClasses[size],
          onClick && "cursor-pointer hover:opacity-80 transition-opacity"
        )}
        onClick={onClick}
      >
        <AvatarImage src={src} alt={alt || name || email} />
        <AvatarFallback className="bg-muted text-muted-foreground font-medium">
          {initials || <User className="h-1/2 w-1/2" />}
        </AvatarFallback>
      </Avatar>
      
      {/* Online status indicator */}
      {showStatus && (
        <div 
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background",
            statusSizeClasses[size],
            isOnline ? "bg-green-500" : "bg-gray-400"
          )}
          aria-label={isOnline ? "En ligne" : "Hors ligne"}
        />
      )}
      
      {/* Role badge */}
      {showBadge && role !== "user" && BadgeIcon && (
        <div className="absolute -top-1 -right-1">
          <Badge 
            className={cn(
              "p-1 h-auto min-w-0 rounded-full",
              badgeColors[role]
            )}
          >
            <BadgeIcon className="h-2.5 w-2.5" />
          </Badge>
        </div>
      )}
    </div>
  )
}

export default UserAvatar