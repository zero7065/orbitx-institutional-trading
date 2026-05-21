import React, { useState } from 'react';
import { MessageCircle, X, Phone, Send, Headphones } from 'lucide-react';

const contactOptions = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#25D366', link: 'https://wa.me/1234567890' },
  { id: 'telegram', label: 'Telegram', icon: Send, color: '#0088CC', link: 'https://t.me/orbitxsupport' },
  { id: 'support', label: 'System Support', icon: Headphones, color: '#00D1FF', link: '/dashboard/support' },
];

export default function FloatingContactButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {open && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-2">
          {contactOptions.map((opt) => (
            <a
              key={opt.id}
              href={opt.link}
              target={opt.id !== 'support' ? '_blank' : undefined}
              rel="noopener noreferrer"
              onClick={() => { if (opt.id === 'support') setOpen(false); }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 hover:scale-105 transition-all duration-300 min-w-[200px] group animate-slide-up"
              style={{ backgroundColor: `${opt.color}15`, borderColor: `${opt.color}30` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${opt.color}25` }}>
                <opt.icon size={20} style={{ color: opt.color }} />
              </div>
              <div>
                <div className="font-bold text-sm text-white">{opt.label}</div>
                <div className="text-[10px] text-gray-400">Click to connect</div>
              </div>
            </a>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #00D1FF 0%, #7C3AED 100%)' }}
      >
        {open ? <X size={24} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
        {!open && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
        )}
      </button>
    </div>
  );
}