'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Package, 
  CheckCircle, 
  User, 
  Trophy,
  Calendar,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { PriceDisplay } from './price-display';
import { ConditionBadge } from './condition-badge';

interface FeedItem {
  id: string;
  type: 'NEW_ARTICLE' | 'ARTICLE_SOLD' | 'PROFILE_UPDATE' | 'ACHIEVEMENT';
  content?: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
    role: string;
  };
  article?: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    condition: string;
    category: {
      name: string;
      slug: string;
    };
  };
}

interface SocialFeedProps {
  className?: string;
}

export function SocialFeed({ className }: SocialFeedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const fetchFeed = async (pageNum: number = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10'
      });

      const response = await fetch(`/api/feed?${params}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du feed');
      }

      const data = await response.json();
      const newItems = data.feedItems || [];
      
      if (pageNum === 1 || refresh) {
        setFeedItems(newItems);
      } else {
        setFeedItems(prev => [...prev, ...newItems]);
      }
      
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error('Erreur lors du chargement du feed:', error);
      toast.error('Erreur lors du chargement du feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(nextPage);
  };

  const refreshFeed = () => {
    fetchFeed(1, true);
    setPage(1);
  };

  const handleLike = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
        toast.success('Like retiré');
      } else {
        newSet.add(postId);
        toast.success('Post liké !');
      }
      return newSet;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'NEW_ARTICLE':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'ARTICLE_SOLD':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PROFILE_UPDATE':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'ACHIEVEMENT':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'NEW_ARTICLE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ARTICLE_SOLD':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'PROFILE_UPDATE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ACHIEVEMENT':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'maintenant';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}j`;
    }
  };

  const SocialPost = ({ item }: { item: FeedItem }) => {
    const isLiked = likedPosts.has(item.id);
    
    return (
      <Card className="mb-6 overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
        {/* Header du post */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href={`/users/${item.user.id}`}>
                <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity ring-2 ring-gray-100">
                  <AvatarImage src={item.user.image} alt={item.user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-semibold">
                    {item.user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/users/${item.user.id}`}
                    className="font-semibold text-gray-900 hover:underline"
                  >
                    {item.user.name}
                  </Link>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {item.user.role === 'SELLER' ? 'Vendeur' : 'Acheteur'}
                  </Badge>
                  {item.user.role === 'SELLER' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Vendeur vérifié" />
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                    <span className="text-xs font-medium">
                      {item.type === 'NEW_ARTICLE' && 'Nouveau produit'}
                      {item.type === 'ARTICLE_SOLD' && 'Produit vendu'}
                      {item.type === 'PROFILE_UPDATE' && 'Mise à jour'}
                      {item.type === 'ACHIEVEMENT' && 'Succès'}
                    </span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        {/* Contenu du post */}
        <CardContent className="pt-0 space-y-4">
          {/* Message du post */}
          <div className="text-gray-900">
            <p className="text-sm leading-relaxed">{item.message}</p>
            {item.content && (
              <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{item.content}&rdquo;</p>
            )}
          </div>
          
          {/* Article associé */}
          {item.article && (
            <Link href={`/articles/${item.article.id}`}>
              <div className="border rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer bg-gray-50">
                <div className="flex">
                  {item.article.images.length > 0 && (
                    <div className="flex-shrink-0">
                      <Image
                        src={item.article.images[0]}
                        alt={item.article.title}
                        className="w-32 h-32 object-cover"
                        width={128}
                        height={128}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 p-4 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.article.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PriceDisplay price={item.article.price} className="text-lg font-bold text-green-600" />
                        <ConditionBadge condition={item.article.condition as 'EXCELLENT' | 'GOOD' | 'FAIR'} />
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {item.article.category.name}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )}
          
          <Separator className="my-4" />
          
          {/* Actions sociales */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(item.id)}
                className={`flex items-center gap-2 hover:bg-red-50 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">
                  {Math.floor(Math.random() * 50) + (isLiked ? 1 : 0)}
                </span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">{Math.floor(Math.random() * 20)}</span>
              </Button>
              
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500 hover:bg-green-50 hover:text-green-600">
                <Share2 className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-500">
                <Eye className="h-4 w-4" />
                <span className="text-sm">{Math.floor(Math.random() * 200) + 50}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading && feedItems.length === 0) {
    return (
      <div className={className}>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-32 w-full rounded-lg" />
                <div className="flex items-center gap-4 mt-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header avec refresh */}
      <div className="flex items-center justify-between mb-6 sticky top-0 bg-white/80 backdrop-blur-sm z-10 py-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flux d&apos;actualités</h1>
          <p className="text-gray-600 text-sm">Découvrez les dernières nouveautés</p>
        </div>
        <Button
          onClick={refreshFeed}
          variant="outline"
          size="sm"
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {feedItems.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Votre feed est vide</h3>
              <p className="text-gray-600 mb-6">
                Suivez des vendeurs pour voir leurs dernières actualités et découvrir de nouveaux produits !
              </p>
              <Button asChild size="lg">
                <Link href="/sellers">Découvrir des vendeurs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-0">
            {feedItems.map((item) => (
              <SocialPost key={item.id} item={item} />
            ))}
          </div>
          
          {hasMore && (
            <div className="text-center mt-8">
              <Button 
                onClick={loadMore} 
                variant="outline" 
                disabled={loading}
                size="lg"
                className="px-8"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Chargement...
                  </>
                ) : (
                  'Voir plus de posts'
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}