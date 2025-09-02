'use client';

import { useState, useEffect } from 'react';
import { SocialFeed } from '@/components/custom/social-feed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Package } from 'lucide-react';
import Link from 'next/link';
import { FollowButton } from '@/components/custom/follow-button';
import { toast } from 'sonner';

interface Seller {
  id: string;
  name: string;
  image?: string;
  bio?: string;
  location?: string;
  stats: {
    articlesCount: number;
    followersCount: number;
    averageRating: number;
  };
  memberSince: string;
}

export default function FeedPage() {
  const [suggestedSellers, setSuggestedSellers] = useState<Seller[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    fetchSuggestedSellers();
  }, []);

  const fetchSuggestedSellers = async () => {
    try {
      setLoadingSuggestions(true);
      const response = await fetch('/api/suggestions/sellers?limit=4');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des suggestions');
      }

      const data = await response.json();
      setSuggestedSellers(data.sellers || []);
    } catch (error) {
      console.error('Erreur lors du chargement des suggestions:', error);
      toast.error('Erreur lors du chargement des suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleFollowChange = (sellerId: string, isFollowing: boolean) => {
    if (isFollowing) {
      // Retirer le vendeur des suggestions s'il est maintenant suivi
      setSuggestedSellers(prev => prev.filter(seller => seller.id !== sellerId));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header avec identité graphique */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Mon Boudoir
          </h1>
          <p className="text-muted-foreground text-lg">
            Découvrez les dernières nouveautés de vos vendeurs préférés
          </p>
        </div>

        {/* Main Feed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar gauche - Suggestions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 bg-card border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary-foreground" />
                  </div>
                  Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingSuggestions ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-2">
                        <div className="h-10 w-10 bg-muted rounded-full animate-pulse"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-muted rounded animate-pulse"></div>
                          <div className="h-2 bg-muted rounded animate-pulse w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : suggestedSellers.length > 0 ? (
                  <div className="space-y-3">
                    {suggestedSellers.map((seller) => (
                      <div key={seller.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                        <Link href={`/seller/${seller.id}`}>
                          <Avatar className="h-10 w-10 cursor-pointer">
                            <AvatarImage src={seller.image} alt={seller.name} />
                            <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                              {seller.name?.charAt(0)?.toUpperCase() || 'V'}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={`/seller/${seller.id}`} className="hover:underline">
                            <p className="font-medium text-sm truncate text-foreground">{seller.name}</p>
                          </Link>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {seller.stats.followersCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {seller.stats.articlesCount}
                            </span>
                          </div>
                        </div>
                        <FollowButton
                          userId={seller.id}
                          userName={seller.name}
                          size="sm"
                          showIcon={false}
                          onFollowChange={(isFollowing) => handleFollowChange(seller.id, isFollowing)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Aucune suggestion disponible
                    </p>
                  </div>
                )}
                
                <Button asChild variant="ghost" className="w-full text-primary hover:bg-accent">
                  <Link href="/sellers">
                    Voir tous les vendeurs
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Feed Principal */}
          <div className="lg:col-span-3">
            <SocialFeed />
          </div>
        </div>
      </div>
    </div>
  );
}