'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Flag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReportButtonProps {
  type: 'ARTICLE' | 'USER' | 'REVIEW';
  targetId: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const REPORT_REASONS = {
  INAPPROPRIATE_CONTENT: 'Contenu inapproprié',
  SPAM: 'Spam',
  FAKE_PRODUCT: 'Produit contrefait',
  HARASSMENT: 'Harcèlement',
  FRAUD: 'Fraude',
  COPYRIGHT_VIOLATION: 'Violation de droits d\'auteur',
  OTHER: 'Autre',
};

export function ReportButton({
  type,
  targetId,
  className,
  variant = 'ghost',
  size = 'sm',
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Veuillez sélectionner une raison');
      return;
    }

    setIsLoading(true);

    try {
      const payload: {
        type: string;
        reason: string;
        description?: string;
        articleId?: string;
        userId?: string;
        reviewId?: string;
      } = {
        type,
        reason,
        description: description.trim() || undefined,
      };

      // Ajouter l'ID approprié selon le type
      if (type === 'ARTICLE') {
        payload.articleId = targetId;
      } else if (type === 'USER') {
        payload.userId = targetId;
      } else if (type === 'REVIEW') {
        payload.reviewId = targetId;
      }

      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du signalement');
      }

      toast.success('Signalement envoyé avec succès');
      setIsOpen(false);
      setReason('');
      setDescription('');
    } catch (error) {
      console.error('Erreur lors du signalement:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erreur lors du signalement'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getDialogTitle = () => {
    switch (type) {
      case 'ARTICLE':
        return 'Signaler cet article';
      case 'USER':
        return 'Signaler cet utilisateur';
      case 'REVIEW':
        return 'Signaler cet avis';
      default:
        return 'Signaler';
    }
  };

  const getDialogDescription = () => {
    switch (type) {
      case 'ARTICLE':
        return 'Signalez cet article s\'il viole nos conditions d\'utilisation.';
      case 'USER':
        return 'Signalez cet utilisateur s\'il a un comportement inapproprié.';
      case 'REVIEW':
        return 'Signalez cet avis s\'il est inapproprié ou frauduleux.';
      default:
        return 'Signalez ce contenu s\'il viole nos conditions d\'utilisation.';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          onClick={() => setIsOpen(true)}
        >
          <Flag className="h-4 w-4 mr-1" />
          Signaler
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Raison du signalement *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une raison" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_REASONS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              placeholder="Décrivez le problème en détail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !reason}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Signaler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}