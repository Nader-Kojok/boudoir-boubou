'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  RefreshCw, 
  CheckCheck, 
  User, 
  Package, 
  Heart,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_FOLLOWER':
      return <User className="h-5 w-5 text-blue-500" />;
    case 'NEW_ARTICLE_FROM_FOLLOWED':
      return <Package className="h-5 w-5 text-green-500" />;
    case 'ARTICLE_SOLD':
      return <Package className="h-5 w-5 text-orange-500" />;
    case 'ARTICLE_LIKED':
      return <Heart className="h-5 w-5 text-red-500" />;
    case 'SYSTEM':
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
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

export function NotificationPageContent() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // Récupérer les notifications
  const fetchNotifications = async (page = 1) => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?page=${page}&limit=20`);
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
        setUnreadCount(data.unreadCount || 0);
      } else {
        toast.error('Erreur lors du chargement des notifications');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    if (!session?.user?.id || unreadCount === 0) return;

    try {
      setMarkingAllRead(true);
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
        toast.success('Toutes les notifications ont été marquées comme lues');
      } else {
        toast.error('Erreur lors du marquage des notifications');
      }
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
      toast.error('Erreur lors du marquage des notifications');
    } finally {
      setMarkingAllRead(false);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchNotifications(newPage);
    }
  };

  // Charger les notifications au montage
  useEffect(() => {
    fetchNotifications();
  }, [session?.user?.id]);

  if (!session?.user?.id) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Vous devez être connecté pour voir vos notifications</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header avec actions */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">
            {pagination.total} notification{pagination.total !== 1 ? 's' : ''}
          </span>
          {unreadCount > 0 && (
            <Badge variant="secondary">
              {unreadCount} non lue{unreadCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNotifications(pagination.page)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={markingAllRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
      </div>

      {/* Liste des notifications */}
      {loading && notifications.length === 0 ? (
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4">
                <div className="h-12 w-12 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          <Bell className="h-16 w-16 mx-auto mb-6 opacity-50" />
          <h3 className="text-xl font-medium mb-2">Aucune notification</h3>
          <p>Vous êtes à jour ! Toutes vos notifications apparaîtront ici.</p>
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
                className={`block p-6 hover:bg-muted/50 transition-colors ${
                  !notification.isRead ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar ou icône */}
                  <div className="flex-shrink-0">
                    {notification.actor?.image ? (
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={notification.actor.image} />
                        <AvatarFallback>
                          {notification.actor.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`font-medium leading-tight mb-1 ${
                          !notification.isRead ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="h-3 w-3 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <>
          <Separator />
          <div className="flex items-center justify-between p-6">
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} sur {pagination.totalPages} 
              ({pagination.total} notification{pagination.total !== 1 ? 's' : ''})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}