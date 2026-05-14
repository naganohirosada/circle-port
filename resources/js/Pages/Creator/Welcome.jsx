import React, { useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import { 
    Globe, ArrowRight, Sparkles, Truck, Languages, 
    CreditCard, Gift, BarChart3, MessageSquareHeart, 
    CheckCircle2, Zap, ShieldCheck, PieChart, Calculator,
    Lock, HelpCircle, Users, PackageCheck , Warehouse
} from 'lucide-react';

export default function CreatorWelcome() {
    const [price, setPrice] = useState(10000);
    const feeRate = 0.08;
    const profit = Math.floor(price * (1 - feeRate));

    return (
        <div className="min-h-screen bg-white text-slate-900 selection:bg-[#deff9a] selection:text-slate-900 font-sans overflow-x-hidden">
            <Head title="日本のクリエイターを、世界へ。海外販売を国内配送の手軽さで - CirclePort" />

            {/* --- 1. Navigation --- */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-20 flex items-center">
                <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white group-hover:bg-[#deff9a] group-hover:text-slate-900 transition-all">
                            <Globe size={24} />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase italic tracking-widest">CirclePort</span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link href="/creator/guide" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">ご利用ガイド</Link>
                        <Link href={route('creator.login')} className="px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                            ログイン
                        </Link>
                    </div>
                </div>
            </nav>

            {/* --- 2. Hero Section --- */}
            <section className="pt-40 pb-24 px-6 relative">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#deff9a]/20 border border-[#deff9a] text-slate-900 text-[10px] font-black uppercase tracking-widest">
                        <Sparkles size={14} /> 2026年、新しい海外販売のスタンダード
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black text-slate-900 leading-[0.85] tracking-tighter uppercase italic">
                        創作を、<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">世界へ。</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-slate-500 font-bold text-lg leading-relaxed">
                        海外発送の手間、言語の壁、代金回収の不安。それらすべてをCirclePortが引き受けます。<br />
                        あなたは国内の倉庫へ送るだけ。
                    </p>
                    <Link href={route('creator.register')} className="px-16 py-8 bg-slate-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-[#deff9a] hover:text-slate-900 transition-all shadow-2xl scale-110">
                        今すぐ販売を始める
                    </Link>
                </div>
            </section>

            {/* --- 3. 収益シミュレーター (新要素) --- */}
            <section className="py-24 px-6 bg-slate-50 rounded-[5rem] mx-6">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Profit Simulator</h2>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">シンプルな手数料。あなたの利益をその場で計算。</p>
                    </div>
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1 w-full space-y-6">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">販売設定価格 (JPY)</label>
                            <input 
                                type="range" min="1000" max="50000" step="500" 
                                value={price} onChange={(e) => setPrice(e.target.value)}
                                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-900"
                            />
                            <div className="text-4xl font-black italic">¥{Number(price).toLocaleString()}</div>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-4">
                            <ArrowRight className="hidden md:block text-slate-200" size={40} />
                            <div className="p-8 bg-[#deff9a] rounded-[2rem] text-center min-w-[200px]">
                                <div className="text-[10px] font-black uppercase tracking-widest mb-2">クリエイター収益</div>
                                <div className="text-4xl font-black italic">¥{profit.toLocaleString()}</div>
                                <div className="text-[9px] font-bold uppercase mt-2 opacity-60">※決済手数料・システム料込</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 4. 物流フローの図解 (新要素) --- */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center">
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Simple Logistics</h2>
                        <p className="text-slate-400 font-bold mt-2">あなたがやることは、STEP 1 だけ。</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8 relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 -z-10 hidden md:block"></div>
                        {[
                            { step: "01", title: "国内発送", desc: "注文品を梱包し、日本の拠点へ送る。いつもの国内配送と同じです。", icon: <PackageCheck className="text-slate-900" /> },
                            { step: "02", title: "検品・集約", desc: "CirclePortが検品。他注文と合算し、国際配送用に再梱包します。", icon: <Warehouse className="text-cyan-500" /> },
                            { step: "03", title: "世界へお届け", desc: "通関・国際発送をすべて代行。ファンの元へ安全に届けます。", icon: <Globe className="text-indigo-500" /> }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center space-y-6">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto shadow-inner">{item.icon}</div>
                                <div>
                                    <h4 className="font-black italic text-lg uppercase">{item.title}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed mt-2">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 5. 安心・権利保護 (新要素) --- */}
            <section className="py-32 bg-slate-900 text-white rounded-[5rem] mx-6">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <h2 className="text-5xl font-black italic uppercase leading-none">
                            Your Rights,<br />
                            <span className="text-[#deff9a]">Protected.</span>
                        </h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <ShieldCheck className="text-[#deff9a] flex-shrink-0" />
                                <p className="text-sm font-bold uppercase tracking-wide leading-relaxed text-slate-400">
                                    <span className="text-white">代金回収を100%保証。</span><br />
                                    海外販売で不安なチャージバックや未払いのリスクはCirclePortがすべて負担します。
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <Lock className="text-[#deff9a] flex-shrink-0" />
                                <p className="text-sm font-bold uppercase tracking-wide leading-relaxed text-slate-400">
                                    <span className="text-white">正規品証明の付与。</span><br />
                                    海賊版からあなたの作品を守るため、CirclePort経由の発送には正規品であることを示す証明を付随させます。
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="relative aspect-square bg-white/5 rounded-[4rem] border border-white/10 flex items-center justify-center overflow-hidden group">
                        <div className="absolute inset-0 bg-[#deff9a] opacity-0 group-hover:opacity-5 transition-opacity"></div>
                        <Lock size={120} className="text-white/10 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                </div>
            </section>

            {/* --- Footer --- */}
            <footer className="py-24 px-6 border-t border-slate-100 bg-white text-slate-900">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    <div className="flex items-center gap-6">
                        <Globe size={20} className="text-slate-300" />
                        <span className="text-slate-400 font-bold uppercase tracking-widest">© 2026 CirclePort Project.</span>
                    </div>
                    <div className="flex gap-12">
                        <Link href="/creator/guide" className="hover:text-cyan-600 transition-colors">ご利用ガイド</Link>
                        <Link href="/" className="text-slate-900 font-black">ファン向けサイトへ</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}