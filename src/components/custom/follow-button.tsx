'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  userName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function FollowButton({
  userId,
  initialIsFollowing = false,
  userName = 'cet utilisateur',
  variant = 'default',
  size = 'default',
  showIcon = true,
  onFollowChange
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  // Using sonner toast

  const handleFollowToggle = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isFollowing ? 'unfollow' : 'follow'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'action');
      }

      const newFollowingState = data.isFollowing;
      setIsFollowing(newFollowingState);
      onFollowChange?.(newFollowingState);

      toast.success(
        newFollowingState 
          ? `Vous suivez maintenant ${userName}`
          : `Vous ne suivez plus ${userName}`
      );
    } catch (error) {
      console.error('Erreur lors du suivi/désuivi:', error);
      toast.error(
        error instanceof Error ? error.message : 'Une erreur est survenue'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {size !== 'sm' && 'Chargement...'}
        </>
      );
    }

    if (isFollowing) {
      return (
        <>
          {showIcon ? <UserMinus className="h-4 w-4" /> : size === 'sm' ? <UserMinus className="h-4 w-4" /> : null}
          {size !== 'sm' && 'Ne plus suivre'}
        </>
      );
    }

    return (
      <>
        {showIcon ? <UserPlus className="h-4 w-4" /> : size === 'sm' ? <UserPlus className="h-4 w-4" /> : null}
        {size !== 'sm' && 'Suivre'}
      </>
    );
  };

  const getButtonVariant = () => {
    if (isFollowing && variant === 'default') {
      return 'outline';
    }
    return variant;
  };

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading}
      variant={getButtonVariant()}
      size={size}
      className={`gap-2 ${isFollowing ? 'hover:bg-destructive hover:text-destructive-foreground' : ''}`}
    >
      {getButtonContent()}
    </Button>
  );
}