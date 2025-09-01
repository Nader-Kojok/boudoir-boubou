'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, UserCheck, Calendar, Package } from 'lucide-react';
import { FollowButton } from './follow-button';
import Link from 'next/link';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  image?: string;
  role: string;
  createdAt: string;
  followedAt: string;
  stats: {
    articlesCount: number;
    followersCount: number;
  };
}

interface FollowersListProps {
  userId: string;
  type: 'followers' | 'following';
  currentUserId?: string;
}

export function FollowersList({ userId, type, currentUserId }: FollowersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}/${type}?page=${pageNum}&limit=20`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement');
      }

      const data = await response.json();
      const newUsers = data[type] || [];
      
      if (pageNum === 1) {
        setUsers(newUsers);
      } else {
        setUsers(prev => [...prev, ...newUsers]);
      }
      
      setTotalCount(data.pagination.total);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SELLER':
        return 'bg-blue-100 text-blue-800';
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MODERATOR':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SELLER':
        return 'Vendeur';
      case 'BUYER':
        return 'Acheteur';
      case 'ADMIN':
        return 'Admin';
      case 'MODERATOR':
        return 'Modérateur';
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {type === 'followers' ? 'Followers' : 'Abonnements'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {type === 'followers' ? 'Followers' : 'Abonnements'}
          <Badge variant="secondary">{totalCount}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {type === 'followers' 
                ? 'Aucun follower pour le moment' 
                : 'Aucun abonnement pour le moment'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <Link href={`/users/${user.id}`}>
                    <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback>
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/users/${user.id}`}
                        className="font-medium hover:underline"
                      >
                        {user.name}
                      </Link>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {user.stats.articlesCount} articles
                      </div>
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-3 w-3" />
                        {user.stats.followersCount} followers
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {type === 'followers' ? 'Suivi depuis' : 'Abonné depuis'} {formatDate(user.followedAt)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {currentUserId && currentUserId !== user.id && (
                  <FollowButton
                    userId={user.id}
                    userName={user.name}
                    size="sm"
                    variant="outline"
                  />
                )}
              </div>
            ))}
            
            {hasMore && (
              <div className="text-center pt-4">
                <Button 
                  onClick={loadMore} 
                  variant="outline" 
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : 'Charger plus'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}