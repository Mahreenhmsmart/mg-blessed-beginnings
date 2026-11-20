import { useState } from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { Share2, Copy, Check, Instagram, Twitter, Link as LinkIcon, MessageCircle } from 'lucide-react';

interface ShareButtonProps {
  url?: string;
  title?: string;
  text?: string;
  hook?: string;
  className?: string;
}

const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://mgblessed.icod.ai';

const DEFAULT_WHATSAPP_MESSAGE = `FREE AI TOOL 🎁

I found a free AI tool that can generate product descriptions, SEO titles, hashtags and more for your online business.

Try it here 👇`;

const SOCIAL_PLATFORMS = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    color: '#25D366',
    getUrl: (url: string, _text: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${DEFAULT_WHATSAPP_MESSAGE}\n${url}`)}`
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: '#1DA1F2',
    getUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: '#E4405F',
    getUrl: () => 'https://www.instagram.com/',
    note: 'Copy caption and paste in Instagram'
  }
];

export default function ShareButton({ url, title, text, hook, className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareText = hook || text || title || 'Check out this amazing AI tool!';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyCaption = async () => {
    try {
      const caption = `${shareText}\n\n${shareUrl}`;
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'MG Blessed Beginnings AI Tools',
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled or failed:', err);
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={cn('relative inline-block', className)} data-icod-id="share_button_container">
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className="gap-2"
        data-icod-id="share_button_trigger">
        <Share2 className="h-4 w-4" data-icod-id="share_button_icon" />
        Share
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            data-icod-id="share_button_backdrop" />

          {/* Dropdown */}
          <div
            className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-card p-4 shadow-xl z-50 animate-fade-in"
            data-icod-id="share_button_dropdown">
            <p className="text-sm font-semibold text-foreground mb-3" data-icod-id="share_button_title">
              Share this content
            </p>

            {/* Social platforms */}
            <div className="space-y-2 mb-4" data-icod-id="share_button_platforms">
              {SOCIAL_PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                return (
                  <a
                    key={platform.id}
                    href={platform.getUrl(shareUrl, shareText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group"
                    data-icod-id={`share_button_platform_${platform.id}`}>
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${platform.color}15` }}
                      data-icod-id={`share_button_platform_icon_bg_${platform.id}`}>
                      <Icon
                        className="h-4 w-4"
                        style={{ color: platform.color }}
                        data-icod-id={`share_button_platform_icon_${platform.id}`} />
                    </div>
                    <div className="flex-1" data-icod-id={`share_button_platform_info_${platform.id}`}>
                      <p className="text-sm font-medium text-foreground" data-icod-id={`share_button_platform_name_${platform.id}`}>
                        {platform.name}
                      </p>
                      {platform.note && (
                        <p className="text-xs text-muted-foreground" data-icod-id={`share_button_platform_note_${platform.id}`}>
                          {platform.note}
                        </p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-border/50 my-3" data-icod-id="share_button_divider" />

            {/* Copy options */}
            <div className="space-y-2" data-icod-id="share_button_copy_options">
              <button
                onClick={handleCopyLink}
                className="flex w-full items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                data-icod-id="share_button_copy_link">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary" data-icod-id="share_button_copy_link_icon_bg">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" data-icod-id="share_button_copy_link_icon" />
                </div>
                <span className="text-sm font-medium text-foreground flex-1" data-icod-id="share_button_copy_link_text">
                  Copy Link
                </span>
                {copied && <Check className="h-4 w-4 text-success" data-icod-id="share_button_copy_check" />}
              </button>

              {hook && (
                <button
                  onClick={handleCopyCaption}
                  className="flex w-full items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-left"
                  data-icod-id="share_button_copy_caption">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10" data-icod-id="share_button_copy_caption_icon_bg">
                    <Copy className="h-4 w-4 text-primary" data-icod-id="share_button_copy_caption_icon" />
                  </div>
                  <div className="flex-1" data-icod-id="share_button_copy_caption_info">
                    <p className="text-sm font-medium text-foreground" data-icod-id="share_button_copy_caption_text">
                      Copy Caption + Link
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]" data-icod-id="share_button_copy_caption_preview">
                      "{hook.slice(0, 30)}..."
                    </p>
                  </div>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
