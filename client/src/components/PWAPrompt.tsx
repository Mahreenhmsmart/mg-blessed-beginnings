import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 animate-fade-in"
      data-icod-id="src_components_pwaprompt_tsx_54ec">
      <Button
        onClick={handleInstall}
        variant="primary"
        size="md"
        data-icod-id="src_components_pwaprompt_tsx_bfd5">
        <Download className="h-4 w-4 mr-2" data-icod-id="src_components_pwaprompt_tsx_d777" />
        Install App
      </Button>
    </div>
  );
}
