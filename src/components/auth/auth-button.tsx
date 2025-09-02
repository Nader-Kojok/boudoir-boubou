"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogIn, LogOut, User, LayoutDashboard, ShoppingBag, Settings, Shield, Rss } from "lucide-react"
import Link from "next/link"

export function AuthButton() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        Chargement...
      </Button>
    )
  }

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                Rôle: {session.user.role}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {session.user.role === "ADMIN" && (
            <DropdownMenuItem asChild>
              <Link href="/admin/moderation">
                <Shield className="mr-2 h-4 w-4" />
                <span>Modération</span>
              </Link>
            </DropdownMenuItem>
          )}
          {session.user.role === "MODERATOR" && (
            <DropdownMenuItem asChild>
              <Link href="/moderator">
                <Shield className="mr-2 h-4 w-4" />
                <span>Interface modérateur</span>
              </Link>
            </DropdownMenuItem>
          )}
          {session.user.role === "SELLER" && (
            <DropdownMenuItem asChild>
              <Link href="/seller">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Tableau de bord vendeur</span>
              </Link>
            </DropdownMenuItem>
          )}
          {session.user.role === "BUYER" && (
            <DropdownMenuItem asChild>
              <Link href="/feed">
                <Rss className="mr-2 h-4 w-4" />
                <span>Mon feed</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              <Settings className="mr-2 h-4 w-4" />
              <span>Mon profil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Se déconnecter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button onClick={() => signIn(undefined, { callbackUrl: '/dashboard' })} variant="outline" size="sm">
      <LogIn className="mr-2 h-4 w-4" />
      Se connecter
    </Button>
  )
}