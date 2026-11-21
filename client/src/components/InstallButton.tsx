import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { cn } from '@/utils/cn';

interface InstallButtonProps {
  className?: string;
  variant?: 'header' | 'footer';
}

export default function InstallButton({ className, variant = 'header' }: InstallButtonProps) {
  const [promptEvent, setPromptEvent] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: any) => {
      e.preventDefault();
      setPromptEvent(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  const handleClick = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      setPromptEvent(null);
    } else {
      alert('Install karne ke liye browser menu (\u22EE) \u2192 "Install app" chunein.');
    }
  };

  if (variant === 'footer') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-primary-foreground transition-all duration-300 ease-out shadow-[0_4px_15px_rgba(118,98,199,0.3)] hover:shadow-[0_6px_25px_rgba(118,98,199,0.5)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          className
        )}
        style={{ background: 'linear-gradient(135deg, #7662C7 0%, #29ADA4 100%)' }}
        data-icod-id="install_button_footer"
      >
        <Download className="h-4 w-4" data-icod-id="src_components_installbutton_tsx_7cd9" />Install App
              </button>
    );
  }

  // Header variant — compact pill button
  return (
    <button
      onClick={handleClick}
      className={cn(
        'hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-primary-foreground whitespace-nowrap transition-all duration-300 ease-out shadow-[0_2px_10px_rgba(118,98,199,0.3)] hover:shadow-[0_4px_20px_rgba(118,98,199,0.5)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
        className
      )}
      style={{ background: 'linear-gradient(135deg, #7662C7 0%, #29ADA4 100%)' }}
      data-icod-id="install_button_header"
    >
      <Download
        className="h-3.5 w-3.5"
        data-icod-id="src_components_installbutton_tsx_a2cd" />Install App
          </button>
  );
}
