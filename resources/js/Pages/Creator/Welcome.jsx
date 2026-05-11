import React from 'react';
import { Link, Head } from '@inertiajs/react';
import { 
    Globe, ArrowRight, Sparkles, Truck, Languages, 
    CreditCard, Gift, BarChart3, MessageSquareHeart, 
    CheckCircle2, Zap, ShieldCheck, PieChart
} from 'lucide-react';

export default function CreatorWelcome() {
    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-[#deff9a] selection:text-slate-900 font-sans overflow-x-hidden">
            <Head title="日本のクリエイターを、世界へ。 - CirclePort" />

            {/* --- ナビゲーション --- */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-20 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
                    <div className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:bg-[#deff9a] group-hover:text-slate-900 transition-all">
                            <Globe size={24} />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase italic tracking-widest">CirclePort</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/" className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-600 transition-colors">
                            ファン向けサイトへ
                        </Link>
                        <Link href={route('creator.login')} className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-md">
                            ログイン
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- ヒーローセクション --- */}
            <section className="pt-48 pb-24 px-6 text-center bg-slate-900 relative overflow-hidden text-white">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(222,255,154,0.15),transparent)] pointer-events-none" />
                
                <div className="max-w-5xl mx-auto space-y-10 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-[#deff9a] rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                        <Sparkles size={14} /> YOUR PASSION, GLOBAL SUCCESS
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase italic">
                        世界へ、あなたの<br />
                        <span className="text-[#deff9a]">創作活動を。</span>
                    </h1>
                    <p className="text-lg md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto leading-relaxed">
                        CirclePortは日本のクリエイターと世界中のファンを繋ぎます。<br />
                        あなたは創作に集中してください。国際配送、言語対応、決済はすべて私たちが引き受けます。
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                        <Link href={route('creator.register')} className="w-full sm:w-auto px-12 py-5 bg-[#deff9a] text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl">
                            参加を申し込む <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- 海外展開の壁セクション --- */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase leading-tight">
                            創作への愛に、<br />
                            <span className="text-cyan-600">国境はいらない。</span>
                        </h2>
                        <p className="text-slate-500 font-bold leading-relaxed text-lg">
                            日本の創作物への需要は世界中で過去最高を記録していますが、<br />
                            複雑な手続きが多くのアーティストの足止めをしています。
                        </p>
                        <div className="space-y-6">
                            {[
                                { icon: <Truck />, t: "物流の壁", d: "インボイス作成、高額な海外送料、そして配送紛失のリスク。" },
                                { icon: <Languages />, t: "言語の壁", d: "多言語でのカスタマーサポートや、海外向けのマーケティング。" },
                                { icon: <CreditCard />, t: "決済のリスク", d: "海外決済詐欺や複雑な為替レート、高い決済手数料。" }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <div className="text-cyan-600 mt-1">{item.icon}</div>
                                    <div>
                                        <h4 className="font-black uppercase italic text-sm mb-1">{item.t}</h4>
                                        <p className="text-xs text-slate-500 font-bold">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        {/* 画像がない場合のプレースホルダー対応 */}
                        <div className="aspect-square bg-slate-900 rounded-[4rem] overflow-hidden shadow-2xl relative group flex items-center justify-center">
                            <img 
                                src="/images/creator-studio.jpg" 
                                alt="Creator Studio" 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 absolute inset-0 opacity-40"
                                onError={(e) => e.target.style.display = 'none'} 
                            />
                            <div className="relative z-10 text-center p-12">
                                <Zap size={80} className="text-[#deff9a] mx-auto mb-6 opacity-50" />
                                <p className="text-4xl font-black italic text-white mb-2">Focus on Art.</p>
                                <p className="text-sm font-bold text-[#deff9a] uppercase tracking-widest">描くこと以外、すべてお任せを。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- チップ100%還元セクション --- */}
            <section className="py-24 px-6 bg-[#deff9a] text-slate-900 overflow-hidden">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10">
                        <div className="w-20 h-20 bg-slate-900 text-[#deff9a] rounded-3xl flex items-center justify-center shadow-xl">
                            <Gift size={40} />
                        </div>
                        <h2 className="text-5xl font-black tracking-tighter italic uppercase leading-none">
                            世界中のファンが、<br />
                            あなたの作品を待っています。
                        </h2>
                        <p className="text-lg font-bold leading-relaxed text-slate-700">
                            いま、日本の作品を愛する海外ファンは増え続けています。<br />
                            しかし、多くのファンが「どうすれば安全に、正当な価格でクリエイターを応援できるか」という壁に突き当たっています。
                        </p>
                        <div className="flex gap-10">
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">海外からの需要</p>
                                <p className="text-4xl font-black italic">Rising</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">サポート意欲</p>
                                <p className="text-4xl font-black italic">High</p>
                            </div>
                        </div>
                    </div>

                    {/* 特定の個人の声ではなく、一般的なファンの「願い」として表現 */}
                    <div className="p-12 bg-white rounded-[4rem] shadow-2xl border border-white/50 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 blur-3xl -z-10" />
                        <div className="flex items-center gap-3 text-indigo-600 mb-6">
                            <MessageSquareHeart size={28} />
                            <span className="text-sm font-black uppercase tracking-widest">私たちが解決したい、ファンの想い</span>
                        </div>
                        <blockquote className="text-2xl font-black italic tracking-tight text-slate-800">
                            「余計な手数料や転売価格ではなく、適正な価格で、少しでも多くの利益をクリエイター本人に届けたい」
                        </blockquote>
                        <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                <Globe size={24} />
                            </div>
                            <div>
                                <p className="font-black text-sm uppercase italic">Market Insight</p>
                                <p className="text-[10px] font-bold text-slate-400">世界中のファンが抱いている共通の願い</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- ベネフィット --- */}
            <section className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { icon: <Globe />, t: "グローバルな集客", d: "英語、中国語、タイ語、フランス語圏へのローカライズされた集客。世界中へ即座にアプローチ。" },
                    { icon: <ShieldCheck />, t: "リスクゼロ", d: "不正決済防止や配送保険はすべてCirclePortが対応。あなたは守られています。" },
                    { icon: <BarChart3 />, t: "分析データを提供", d: "ファンがどの国にいて、何を求めているかを正確に把握。次の創作のヒントに。" }
                ].map((feature, i) => (
                    <div key={i} className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-xl transition-all">
                        <div className="w-14 h-14 bg-slate-900 text-[#deff9a] rounded-2xl flex items-center justify-center mb-8">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-black uppercase italic mb-4">{feature.t}</h3>
                        <p className="text-sm text-slate-500 font-bold leading-relaxed">{feature.d}</p>
                    </div>
                ))}
            </section>

            {/* --- 手数料テーブル --- */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto bg-white border border-slate-100 rounded-[4rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#deff9a]/20 blur-[100px] pointer-events-none" />
                    <div className="text-center space-y-12 relative z-10">
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">明快な料金体系</h2>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">販売手数料</p>
                                <p className="text-7xl font-black italic text-slate-900">8%</p>
                                <p className="text-xs font-bold text-slate-500">販売成立時のみ発生</p>
                            </div>
                            <div className="w-px h-20 bg-slate-100 hidden md:block" />
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">チップ手数料</p>
                                <p className="text-7xl font-black italic text-indigo-600">0%</p>
                                <p className="text-xs font-bold text-slate-500">いつでも100%あなたのもの</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 font-bold leading-relaxed pt-8 border-t border-slate-50">
                            初期費用、月額固定費などは一切かかりません。<br />
                            あなたの成功が私たちの成功です。
                        </p>
                    </div>
                </div>
            </section>

            {/* --- フッター --- */}
            <footer className="py-24 px-6 border-t border-slate-100 bg-white text-slate-900">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    <div className="flex items-center gap-6">
                        <Globe size={20} className="text-slate-300" />
                        <span className="text-slate-400 font-bold uppercase tracking-widest">© 2026 CirclePort Project. All rights reserved.</span>
                    </div>
                    <div className="flex gap-12">
                        <Link href="/guide" className="hover:text-cyan-600 transition-colors font-bold uppercase tracking-widest">ご利用ガイド</Link>
                        <a href="#" className="hover:text-cyan-600 transition-colors font-bold uppercase tracking-widest">プライバシーポリシー</a>
                        <Link href="/" className="text-cyan-600 font-black">ファン向けサイトへ切り替え</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}