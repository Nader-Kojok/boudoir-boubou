"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/custom/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogIn, LogOut, LayoutDashboard, ShoppingBag, Settings } from "lucide-react"
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
          <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
            <UserAvatar
              src={session.user.image || undefined}
              name={session.user.name || undefined}
              email={session.user.email || undefined}
              size="sm"
              className="h-8 w-8"
            />
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
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">
              <Settings className="mr-2 h-4 w-4" />
              <span>Mon profil</span>
            </Link>
          </DropdownMenuItem>
          {(session.user.role === "SELLER" || session.user.role === "ADMIN") && (
            <DropdownMenuItem asChild>
              <Link href="/seller">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Tableau de bord vendeur</span>
              </Link>
            </DropdownMenuItem>
          )}
          {(session.user.role === "BUYER" || session.user.role === "ADMIN") && (
            <DropdownMenuItem asChild>
              <Link href="/buyer">
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>Mes achats</span>
              </Link>
            </DropdownMenuItem>
          )}
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