import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle } from "lucide-react"

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  sellerName: string
  whatsappNumber: string
  phoneNumber: string
  articleTitle?: string
}

export function ContactModal({
  isOpen,
  onClose,
  sellerName,
  whatsappNumber,
  phoneNumber,
  articleTitle
}: ContactModalProps) {
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      articleTitle 
        ? `Bonjour, je suis intéressé(e) par votre article "${articleTitle}" sur Boudoir.`
        : `Bonjour ${sellerName}, j'ai vu votre profil sur Boudoir et j'aimerais discuter avec vous.`
    )
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
    onClose()
  }

  const handlePhoneCall = () => {
    window.open(`tel:${phoneNumber}`, '_self')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contacter {sellerName}</DialogTitle>
          <DialogDescription>
            Choisissez votre mode de contact préféré
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={handleWhatsAppContact}
            className="flex items-center justify-center gap-2 h-12"
            variant="default"
          >
            <MessageCircle className="h-5 w-5" />
            Contacter via WhatsApp
          </Button>
          
          <Button
            onClick={handlePhoneCall}
            className="flex items-center justify-center gap-2 h-12"
            variant="outline"
          >
            <Phone className="h-5 w-5" />
            Appeler directement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ContactModal