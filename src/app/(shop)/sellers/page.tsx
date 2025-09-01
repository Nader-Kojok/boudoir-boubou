'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Users,
  Star,
  MapPin,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { FollowButton } from '@/components/custom/follow-button';
import { useSession } from 'next-auth/react';

interface Seller {
  id: string;
  name: string;
  image?: string;
  bio?: string;
  location?: string;
  createdAt: string;
  stats: {
    articlesCount: number;
    followersCount: number;
    averageRating: number;
  };
  isFollowing?: boolean;
}

export default function SellersPage() {
  const { data: session } = useSession();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchSellers = async (pageNum: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        role: 'SELLER'
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const response = await fetch(`/api/users?${params}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des vendeurs');
      }

      const data = await response.json();
      const newSellers = data.users || [];
      
      if (pageNum === 1) {
        setSellers(newSellers);
      } else {
        setSellers(prev => [...prev, ...newSellers]);
      }
      
      setTotalCount(data.pagination.total);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs:', error);
      toast.error('Erreur lors du chargement des vendeurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers(1, searchQuery);
    setPage(1);
  }, [searchQuery]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSellers(nextPage, searchQuery);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSellers(1, searchQuery);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long'
    });
  };

  const handleFollowChange = (sellerId: string, isFollowing: boolean) => {
    setSellers(prev => prev.map(seller => 
      seller.id === sellerId 
        ? { 
            ...seller, 
            isFollowing,
            stats: {
              ...seller.stats,
              followersCount: seller.stats.followersCount + (isFollowing ? 1 : -1)
            }
          }
        : seller
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Découvrir des vendeurs</h1>
        <p className="text-muted-foreground">
          Suivez vos vendeurs préférés pour ne rien manquer de leurs nouveautés
        </p>
      </div>

      {/* Barre de recherche */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un vendeur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Rechercher</Button>
          </form>
        </CardContent>
      </Card>



      {/* Liste des vendeurs */}
      {loading && sellers.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sellers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Aucun vendeur trouvé</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `Aucun vendeur ne correspond à "${searchQuery}"`
                : 'Aucun vendeur disponible pour le moment'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller) => (
              <Card key={seller.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <Link href={`/seller/${seller.id}`}>
                        <Avatar className="h-16 w-16 cursor-pointer hover:opacity-80 transition-opacity">
                          <AvatarImage src={seller.image} alt={seller.name} />
                          <AvatarFallback className="text-lg">
                            {seller.name?.charAt(0)?.toUpperCase() || 'V'}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/seller/${seller.id}`}
                          className="font-semibold hover:underline block truncate"
                        >
                          {seller.name}
                        </Link>
                        <Badge className="mt-1">Vendeur</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {seller.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {seller.bio}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {seller.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{seller.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Membre depuis {formatDate(seller.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold">{seller.stats.articlesCount}</div>
                      <div className="text-muted-foreground">Articles</div>
                    </div>
                    <div>
                      <div className="font-semibold">{seller.stats.followersCount}</div>
                      <div className="text-muted-foreground">Followers</div>
                    </div>
                    <div>
                      <div className="font-semibold flex items-center justify-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {seller.stats.averageRating.toFixed(1)}
                      </div>
                      <div className="text-muted-foreground">Note</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/seller/${seller.id}`}>
                        Voir profil
                      </Link>
                    </Button>
                    
                    {session?.user?.id && session.user.id !== seller.id && (
                      <FollowButton
                        userId={seller.id}
                        initialIsFollowing={seller.isFollowing}
                        userName={seller.name}
                        size="default"
                        showIcon={false}
                        onFollowChange={(isFollowing) => handleFollowChange(seller.id, isFollowing)}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {hasMore && (
            <div className="text-center mt-8">
              <Button 
                onClick={loadMore} 
                variant="outline" 
                disabled={loading}
                size="lg"
              >
                {loading ? 'Chargement...' : 'Charger plus de vendeurs'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}