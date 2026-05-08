import React from 'react';
import { Link, Head } from '@inertiajs/react';
import { Truck, Globe, Zap, ShieldCheck, BarChart3, CreditCard, ArrowRight } from 'lucide-react';

export default function CreatorWelcome() {
    return (
        <div className="min-h-screen bg-[#0f172a] text-white">
            <Head title="CirclePort for Creators - Sell Internationally, Ship Domestically" />
            
            {/* --- Hero: 負担軽減とグローバル展開を強調 --- */}
            <section className="pt-40 pb-24 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto space-y-10 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                        <Zap size={14} /> For Professional Japanese Creators
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                        国内配送だけで、<br />
                        <span className="text-indigo-400 italic">世界中に作品を。</span>
                    </h1>
                    <p className="max-w-2xl text-lg text-slate-400 font-bold">
                        CirclePortは、面倒な海外発送・インボイス作成・多言語対応をすべて代行。あなたは作品を日本の倉庫へ送るだけ。
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Link href={route('creator.register')} className="w-full sm:w-auto px-12 py-6 bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white hover:text-slate-900 transition-all shadow-2xl shadow-indigo-500/20">
                            Start Selling Globally <ArrowRight size={20} className="inline ml-2" />
                        </Link>
                        <Link href={route('welcome')} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                            Back to Fan Site
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- Creator Benefits --- */}
            <section className="py-24 px-6 bg-white/5 backdrop-blur-sm border-y border-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <Benefit icon={<Truck />} title="国内発送で完結" desc="商品は日本のCirclePort倉庫へ。国際配送の手続きは一切不要です。" />
                    <Benefit icon={<BarChart3 />} title="一括注文のGO" desc="海外ファンによる共同購入で、一度にまとまった在庫を効率的に動かせます。" />
                    <Benefit icon={<ShieldCheck />} title="日本円100%保証" desc="為替リスクはCirclePortが負担。設定した日本円が確実に支払われます。" />
                    <Benefit icon={<CreditCard />} title="チップ収益" desc="ファンからの応援チップは、決済手数料を除き100%クリエイターに還元。" />
                </div>
            </section>
        </div>
    );
}

function Benefit({ icon, title, desc }) {
    return (
        <div className="space-y-4 p-6 border-l-2 border-indigo-500/30 hover:border-indigo-500 transition-colors">
            <div className="text-indigo-400">{icon}</div>
            <h3 className="text-lg font-black uppercase italic tracking-tight">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">{desc}</p>
        </div>
    );
}