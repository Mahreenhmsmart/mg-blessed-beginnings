import { MessageCircle } from 'lucide-react';

const WHATSAPP_PHONE_LINK = 'https://wa.me/923358380233';

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_PHONE_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-[95] flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(37,211,102,0.5)] hover:bg-[#20BD5A] hover:shadow-[0_6px_24px_rgba(37,211,102,0.6)] transition-all duration-300 animate-pulse-slow group"
      data-icod-id="src_components_whatsappbutton_tsx_root">
      <MessageCircle
        className="h-7 w-7 md:h-8 md:w-8 group-hover:scale-110 transition-transform duration-300"
        data-icod-id="src_components_whatsappbutton_tsx_icon" />
      {/* Tooltip on desktop */}
      <span
        className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-card border border-border/60 text-xs font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:block shadow-sm"
        data-icod-id="src_components_whatsappbutton_tsx_tooltip">
        Chat on WhatsApp
      </span>
    </a>
  );
}
