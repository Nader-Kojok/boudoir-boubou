'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  RefreshCw, 
  CheckCheck, 
  User, 
  Package, 
  Heart,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  entityId?: string;
  entityType?: string;
  actor?: {
    id: string;
    name: string;
    image?: string;
  };
}

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onRefresh: () => void;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_FOLLOWER':
      return <User className="h-4 w-4 text-blue-500" />;
    case 'NEW_ARTICLE_FROM_FOLLOWED':
      return <Package className="h-4 w-4 text-green-500" />;
    case 'ARTICLE_SOLD':
      return <Package className="h-4 w-4 text-orange-500" />;
    case 'ARTICLE_LIKED':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'SYSTEM':
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
}

function getNotificationLink(notification: Notification): string {
  switch (notification.type) {
    case 'NEW_ARTICLE_FROM_FOLLOWED':
      if (notification.entityId) {
        return `/article/${notification.entityId}`;
      }
      return '/buyer/feed';
    case 'NEW_FOLLOWER':
      if (notification.actor?.id) {
        return `/sellers/${notification.actor.id}`;
      }
      return '/seller/followers';
    case 'ARTICLE_SOLD':
      if (notification.entityId) {
        return `/article/${notification.entityId}`;
      }
      return '/seller/articles';
    case 'ARTICLE_LIKED':
      if (notification.entityId) {
        return `/article/${notification.entityId}`;
      }
      return '/seller/articles';
    default:
      return '/notifications';
  }
}

export function NotificationList({
  notifications,
  loading,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onRefresh
}: NotificationListProps) {
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="h-8 px-2 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tout lire
            </Button>
          )}
        </div>
      </div>

      {/* Liste des notifications */}
      <ScrollArea className="h-96">
        {loading && notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-3/4" />
                    <div className="h-2 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-1">Aucune notification</p>
            <p className="text-sm">Vous êtes à jour !</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => {
              const link = getNotificationLink(notification);
              const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: fr
              });

              return (
                <Link
                  key={notification.id}
                  href={link}
                  onClick={() => handleNotificationClick(notification)}
                  className={`block p-4 hover:bg-muted/50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar ou icône */}
                    <div className="flex-shrink-0">
                      {notification.actor?.image ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={notification.actor.image} />
                          <AvatarFallback>
                            {notification.actor.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`text-sm font-medium leading-tight ${
                            !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {timeAgo}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-3">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/notifications">
                Voir toutes les notifications
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}