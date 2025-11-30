import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
      applyConsent(savedPreferences);
    }
  }, []);

  const applyConsent = (prefs: typeof preferences) => {
    // Disable non-essential tracking if rejected
    if (!prefs.analytics) {
      // Disable GA4 advanced tracking
      if (window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
    }

    if (!prefs.marketing) {
      // Disable Meta Pixel
      if (window.fbq) {
        window.fbq('consent', 'revoke');
      }
      
      // Disable Google Ads
      if (window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true };
    setPreferences(allAccepted);
    localStorage.setItem('cookie_consent', JSON.stringify(allAccepted));
    applyConsent(allAccepted);
    setShowBanner(false);
    
    // Reload tracking scripts
    window.location.reload();
  };

  const handleRejectNonEssential = () => {
    const essentialOnly = { necessary: true, analytics: false, marketing: false };
    setPreferences(essentialOnly);
    localStorage.setItem('cookie_consent', JSON.stringify(essentialOnly));
    applyConsent(essentialOnly);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    applyConsent(preferences);
    setShowBanner(false);
    setShowPreferences(false);
    
    // Reload if marketing was just enabled
    if (preferences.marketing || preferences.analytics) {
      window.location.reload();
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <Card className="max-w-4xl mx-auto shadow-2xl border-2">
        <div className="p-6">
          {!showPreferences ? (
            <div>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-heading font-bold">Cookie Consent</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowBanner(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                We use cookies to enhance your browsing experience, serve personalized content, 
                and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
                You can manage your preferences or learn more in our{' '}
                <a href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </a>.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleAcceptAll} className="flex-1">
                  Accept All
                </Button>
                <Button onClick={handleRejectNonEssential} variant="outline" className="flex-1">
                  Reject Non-Essential
                </Button>
                <Button 
                  onClick={() => setShowPreferences(true)} 
                  variant="secondary"
                  className="flex-1"
                >
                  Manage Preferences
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-heading font-bold">Cookie Preferences</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreferences(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Necessary Cookies</p>
                    <p className="text-sm text-muted-foreground">
                      Required for basic site functionality
                    </p>
                  </div>
                  <input type="checkbox" checked disabled className="h-5 w-5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Analytics Cookies</p>
                    <p className="text-sm text-muted-foreground">
                      Help us understand how visitors use our site
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="h-5 w-5"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Marketing Cookies</p>
                    <p className="text-sm text-muted-foreground">
                      Used to deliver personalized ads and remarketing
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="h-5 w-5"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSavePreferences} className="flex-1">
                  Save Preferences
                </Button>
                <Button onClick={() => setShowPreferences(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;
