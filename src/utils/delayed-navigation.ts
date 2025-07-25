"use client"

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

/**
 * Effectue une redirection avec un délai pour permettre aux utilisateurs de lire les notifications
 * @param router - Instance du router Next.js
 * @param path - Chemin de redirection
 * @param delay - Délai en millisecondes (défaut: 2000ms)
 * @param refresh - Si true, rafraîchit la page après redirection (défaut: false)
 */
export function delayedPush(
  router: AppRouterInstance,
  path: string,
  delay: number = 2000,
  refresh: boolean = false
): void {
  setTimeout(() => {
    router.push(path)
    if (refresh) {
      router.refresh()
    }
  }, delay)
}

/**
 * Rafraîchit la page avec un délai
 * @param router - Instance du router Next.js
 * @param delay - Délai en millisecondes (défaut: 2000ms)
 */
export function delayedRefresh(
  router: AppRouterInstance,
  delay: number = 2000
): void {
  setTimeout(() => {
    router.refresh()
  }, delay)
}

/**
 * Effectue une redirection avec window.location.href avec un délai
 * @param url - URL de redirection
 * @param delay - Délai en millisecondes (défaut: 2000ms)
 */
export function delayedLocationChange(
  url: string,
  delay: number = 2000
): void {
  setTimeout(() => {
    window.location.href = url
  }, delay)
}