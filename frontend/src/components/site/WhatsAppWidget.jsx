import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { fetchSiteSettings } from "../../lib/api";

export default function WhatsAppWidget() {
  const [phone, setPhone] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchSiteSettings().then((s) => setPhone(s?.sales_phone || "9925115151")).catch(() => setPhone("9925115151"));
  }, []);

  if (!phone) return null;

  // Sanitize phone for wa.me (digits only, prefix country code 91 for India)
  const digits = String(phone).replace(/\D/g, "");
  const waNumber = digits.length === 10 ? `91${digits}` : digits;
  const defaultMsg = encodeURIComponent("Hello Punjab Honda, I'd like to know more about your products and offers.");
  const link = `https://wa.me/${waNumber}?text=${defaultMsg}`;

  return (
    <div className="fixed bottom-5 right-5 z-[90]" data-testid="whatsapp-widget">
      {open && (
        <div className="mb-3 bg-white border border-gray-200 shadow-2xl w-72 overflow-hidden animate-in" data-testid="whatsapp-card">
          <div className="bg-[#075E54] text-white p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">Punjab Honda</div>
              <div className="text-[11px] opacity-90">Typically replies in minutes</div>
            </div>
            <button onClick={() => setOpen(false)} className="opacity-80 hover:opacity-100" data-testid="whatsapp-close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-700 mb-3">
              👋 Hello! How can we help you today? Click below to chat with us on WhatsApp.
            </div>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-[#25D366] hover:bg-[#1da851] text-white text-center py-3 text-sm font-bold uppercase tracking-wider"
              data-testid="whatsapp-start-chat"
            >
              Start Chat
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="bg-[#25D366] hover:bg-[#1da851] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Chat on WhatsApp"
        data-testid="whatsapp-toggle-btn"
      >
        {open ? <X className="w-7 h-7" /> : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
        )}
      </button>
    </div>
  );
}
