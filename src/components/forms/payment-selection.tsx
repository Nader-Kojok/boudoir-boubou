'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { QrCode, Smartphone, CreditCard, CheckCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface PaymentSelectionProps {
  amount: number
  onPaymentSuccess: (paymentMethod: string, transactionId: string) => Promise<void>
  onCancel: () => void
  isProcessing: boolean
}



const PAYMENT_METHODS = [
  {
    id: 'wave',
    name: 'Wave',
    description: 'Paiement via Wave',
    icon: '📱',
    color: 'bg-blue-500'
  },
  {
    id: 'orange_money',
    name: 'Orange Money',
    description: 'Paiement via Orange Money',
    icon: '🟠',
    color: 'bg-orange-500'
  }
]

export default function PaymentSelection({ amount, onPaymentSuccess, onCancel, isProcessing }: PaymentSelectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<'wave' | 'orange_money' | null>(null)
  const [showQR, setShowQR] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [transactionId, setTransactionId] = useState<string>('')

  // Generate transaction ID on client side to avoid hydration mismatch
  useEffect(() => {
    setTransactionId(`TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  }, [])

  const handleMethodSelect = (method: 'wave' | 'orange_money') => {
    setSelectedMethod(method)
  }

  const handleProceedToPayment = () => {
    if (!selectedMethod) return
    setShowQR(true)
  }

  const handlePaymentConfirmation = async () => {
    if (!selectedMethod) return
    
    setIsProcessingPayment(true)
    
    // Simuler la vérification du paiement
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Transaction ID is now generated in useEffect
    
    setPaymentConfirmed(true)
    setIsProcessingPayment(false)
    
    // Attendre un peu avant de confirmer
    setTimeout(async () => {
      await onPaymentSuccess(selectedMethod, transactionId)
    }, 1500)
  }



  if (paymentConfirmed) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-green-600 mb-2">
            Paiement confirmé !
          </h3>
          <p className="text-gray-600">
            Votre article va être envoyé en modération.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (showQR && selectedMethod) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">
            Paiement via {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center space-y-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-800 mb-2">
              {formatPrice(amount)} F CFA
            </div>
            <p className="text-sm text-gray-600">
              Frais de publication d&apos;annonce
            </p>
          </div>

          {/* QR Code placeholder */}
          <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-24 h-24 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Code QR pour {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Smartphone className="w-4 h-4" />
              <span>Scannez avec votre application {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}</span>
            </div>
            
            <Button 
              onClick={handlePaymentConfirmation}
              disabled={isProcessingPayment || isProcessing}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isProcessingPayment ? 'Vérification...' : isProcessing ? 'Traitement...' : 'J&apos;ai effectué le paiement'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowQR(false)}
              className="w-full"
            >
              Changer de méthode
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Choisir le moyen de paiement</span>
        </CardTitle>
        <p className="text-center text-sm text-gray-600">
          Frais de publication : <span className="font-semibold">{formatPrice(amount)} F CFA</span>
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <RadioGroup value={selectedMethod || ''} onValueChange={handleMethodSelect}>
          {PAYMENT_METHODS.map((method) => (
            <div key={method.id} className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value={method.id} id={method.id} />
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-10 h-10 rounded-full ${method.color} flex items-center justify-center text-white text-lg`}>
                  {method.icon}
                </div>
                <div>
                  <Label htmlFor={method.id} className="font-medium cursor-pointer">
                    {method.name}
                  </Label>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>

        <div className="space-y-3">
          <Button 
            onClick={handleProceedToPayment}
            disabled={!selectedMethod}
            className="w-full bg-gradient-to-r from-[#a67c3a] to-[#8b5a2b] hover:from-[#8b5a2b] hover:to-[#6d4422]"
          >
            Procéder au paiement
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full"
          >
            Annuler
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note :</strong> Une fois le paiement effectué, votre annonce sera envoyée à notre équipe de modération pour validation avant publication.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}