'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Package, 
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { FeedArticleCard } from './feed-article-card';
import { useDataSync, useAutoSync } from '@/hooks/use-data-sync';
import { cacheManager, CACHE_KEYS } from '@/lib/cache-manager';

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
  
  const { forcSync } = useDataSync();
  const { triggerSync } = useAutoSync([CACHE_KEYS.FEED.SOCIAL(1)]);

  const fetchFeed = async (pageNum: number = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        // Invalider le cache lors du rafraîchissement
        const cacheKey = CACHE_KEYS.FEED.SOCIAL(pageNum);
        cacheManager.delete(cacheKey);
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
      
      // Mettre en cache les nouvelles données
      const cacheKey = CACHE_KEYS.FEED.SOCIAL(pageNum);
      cacheManager.set(cacheKey, newItems);
      
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
    // Forcer la synchronisation avant de recharger
    forcSync([CACHE_KEYS.FEED.SOCIAL(1)]);
    fetchFeed(1, true);
    setPage(1);
  };

  const handleArticleClick = (articleId: string) => {
    // Navigation vers l'article sera gérée par le composant FeedArticleCard
  };

  // Filtrer uniquement les articles (NEW_ARTICLE) pour le feed
  const articleFeedItems = feedItems.filter(item => item.type === 'NEW_ARTICLE' && item.article);

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

      {articleFeedItems.length === 0 ? (
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
          <div className="space-y-6">
            {articleFeedItems.map((item) => (
              item.article && (
                <FeedArticleCard
                  key={item.id}
                  id={item.article.id}
                  title={item.article.title}
                  description={item.article.description}
                  price={item.article.price}
                  condition={item.article.condition as 'EXCELLENT' | 'GOOD' | 'FAIR'}
                  images={item.article.images}
                  category={item.article.category}
                  seller={{
                    id: item.user.id,
                    name: item.user.name,
                    image: item.user.image
                  }}
                  createdAt={item.createdAt}
                  onClick={handleArticleClick}
                />
              )
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