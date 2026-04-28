import React, { useState } from 'react';
import { Share2, Copy, Check, MessageSquare } from 'lucide-react';

export default function ShareSection({ go, language }) {
    const [copied, setCopied] = useState(false);
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const shareUrl = go.invite_code 
        ? `${window.location.origin}/fan/go/detail/${go.id}?invite=${go.invite_code}`
        : `${window.location.origin}/fan/go/detail/${go.id}`;

    const shareText = __(`Check out this Group Order on CirclePort: :title`).replace(':title', go.title);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // --- SNSアイコンをSVGで定義（Lucideのエラーを完全に回避） ---
    const XIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
        </svg>
    );

    const FacebookIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
    );

    const WhatsAppIcon = () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z"/>
        </svg>
    );

    const snsLinks = [
        {
            name: 'X',
            icon: <XIcon />,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            color: 'bg-black'
        },
        {
            name: 'Facebook',
            icon: <FacebookIcon />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: 'bg-blue-600'
        },
        {
            name: 'WhatsApp',
            icon: <WhatsAppIcon />,
            url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
            color: 'bg-green-500'
        }
    ];

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
                    <Share2 size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-black uppercase tracking-widest">{__('Share & Invite')}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{__('Share this link to reach the goal faster!')}</p>
                </div>
            </div>

            <div className="flex gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                <input 
                    readOnly 
                    value={shareUrl} 
                    className="flex-1 bg-transparent border-none text-[10px] font-bold text-slate-500 focus:ring-0 px-3" 
                />
                <button 
                    onClick={handleCopy} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-cyan-600'}`}
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? __('Copied') : __('Copy')}
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {snsLinks.map((sns) => (
                    <a 
                        key={sns.name} 
                        href={sns.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`flex flex-col items-center justify-center py-3 rounded-2xl text-white transition-all hover:scale-105 ${sns.color}`}
                    >
                        {sns.icon}
                        <span className="text-[8px] font-black uppercase mt-1.5">{sns.name}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}