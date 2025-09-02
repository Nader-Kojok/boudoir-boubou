import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { NotificationPageContent } from '@/components/custom/notification-page-content';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Notifications
            </h1>
          </div>
          <p className="text-muted-foreground">
            Restez informé de toutes les activités importantes
          </p>
        </div>

        {/* Contenu des notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Toutes vos notifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Suspense fallback={
              <div className="p-8 text-center">
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-3 p-4">
                      <div className="h-10 w-10 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }>
              <NotificationPageContent />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}