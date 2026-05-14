import React from 'react';
import { Link, Head } from '@inertiajs/react';
import { 
    ShoppingBag, Box, Users, ArrowRight, ShieldCheck, Zap, 
    Truck, Warehouse, Receipt, Coins, Ban, Flag, Boxes, 
    Timer, AlertCircle, CheckCircle2, Globe, HelpCircle,
    ShieldAlert, CreditCard, Clock, Sparkles, MapPin
} from 'lucide-react';

export default function CreatorGuide() {
    // クリエイター側は日本語固定
    const __ = (key) => key;

    const menuItems = [
        { id: 'flow', title: '販売の流れ', icon: <ShoppingBag size={18} /> },
        { id: 'go-system', title: 'Group Orderの仕組み', icon: <Users size={18} /> },
        { id: 'countries', title: '販売対応地域一覧', icon: <Globe size={18} /> },
        { id: 'payout', title: '入金スケジュール', icon: <Receipt size={18} /> },
        { id: 'prohibited', title: '禁制品について', icon: <Ban size={18} /> },
        { id: 'fees', title: '利用手数料', icon: <Coins size={18} /> },
        { id: 'shipping', title: '国内拠点への配送', icon: <Warehouse size={18} /> },
        { id: 'timeline', title: '作業スケジュール', icon: <Timer size={18} /> },
        { id: 'precautions', title: '注意事項', icon: <AlertCircle size={18} /> },
    ];

    // ファン側と合わせた16カ国・地域
    const targetCountries = [
        "アメリカ", "カナダ", "イギリス", "フランス", "ドイツ", 
        "インドネシア", "タイ", "シンガポール", "マレーシア", "ベトナム", 
        "中国", "台湾", "香港", "韓国", "オーストラリア", "ニュージーランド"
    ];

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-[#deff9a]">
            <Head title="クリエイターガイド - CirclePort" />

            {/* --- 1. HERO SECTION --- */}
            <header className="pt-32 pb-16 px-6 bg-slate-900 text-white rounded-b-[4rem]">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex items-center gap-3 text-[#deff9a]">
                        <HelpCircle size={24} />
                        <span className="text-xs font-black uppercase tracking-[0.3em]">Creator Support</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none italic">Creator Guide</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-tight max-w-2xl text-sm leading-relaxed">
                        海外販売を、いつもの国内発送と同じ手軽さで。クリエイターの負担を最小限に、世界への扉を開きます。
                    </p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row gap-16">
                
                {/* --- 2. SIDEBAR NAVIGATION --- */}
                <aside className="lg:w-80 flex-shrink-0">
                    <div className="sticky top-24 space-y-2 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-4">目次</h3>
                        {menuItems.map((item) => (
                            <a 
                                key={item.id} href={`#${item.id}`}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all group"
                            >
                                <span className="text-slate-300 group-hover:text-slate-900 transition-colors">{item.icon}</span>
                                <span className="text-[11px] font-black uppercase tracking-tight">{item.title}</span>
                            </a>
                        ))}
                    </div>
                </aside>

                {/* --- 3. MAIN CONTENT --- */}
                <main className="flex-1 space-y-32 pb-40">

                    {/* 販売の流れ */}
                    <section id="flow" className="scroll-mt-32 space-y-8">
                        <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                            <ShoppingBag className="text-slate-900" size={32} />
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">販売の流れ</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { s: "01", t: "作品登録", d: "画像と情報を入力。システムが自動で多言語化し、世界へ公開します。" },
                                { s: "02", t: "国内拠点へ配送", d: "注文が入ったら、指定の国内拠点(千葉・大阪)へ発送。通関書類は不要です。" },
                                { s: "03", t: "売上の受取", d: "拠点での検品完了後、翌月15日に指定の国内口座へ日本円で振り込まれます。" }
                            ].map((item, i) => (
                                <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <div className="text-2xl font-black text-[#deff9a] italic mb-2">{item.s}</div>
                                    <h4 className="text-lg font-black mb-2 italic">{item.t}</h4>
                                    <p className="text-xs text-slate-500 font-bold leading-relaxed">{item.d}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Group Orderの仕組み */}
                    <section id="go-system" className="scroll-mt-32 space-y-8">
                        <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                            <Users className="text-slate-900" size={32} />
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">Group Orderの仕組み</h2>
                        </div>
                        <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] space-y-8 relative overflow-hidden">
                            <Sparkles className="absolute -right-10 -bottom-10 text-[#deff9a]/10" size={240} />
                            <p className="text-sm font-bold leading-relaxed text-slate-300 relative z-10">
                                ファンがチームを組んで国際送料を分担する、2026年のグローバルスタンダードな販売形式です。目標数に達した場合のみ製作を開始できるため、在庫リスクなしで海外展開が可能です。
                            </p>
                            <div className="grid md:grid-cols-2 gap-6 relative z-10">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <h4 className="text-[#deff9a] font-black text-xs uppercase mb-2">クリエイターの作業</h4>
                                    <p className="text-[10px] text-slate-400">成立した注文を「まとめて一箱」で国内倉庫へ送るだけ。個別の発送作業は不要です。</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <h4 className="text-[#deff9a] font-black text-xs uppercase mb-2">手数料の仕組み</h4>
                                    <p className="text-[10px] text-slate-400">GOに伴う追加の手数料はファン側が負担するため、クリエイターの収益率は変わりません。</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 販売対応地域一覧 */}
                    <section id="countries" className="scroll-mt-32 space-y-8">
                        <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                            <Globe className="text-slate-900" size={32} />
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">販売対応地域一覧</h2>
                        </div>
                        <div className="space-y-6">
                            <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                以下の16カ国・地域への販売・配送に対応しています。通関書類作成や海外配送トラブルの対応はすべて弊社が行います。
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {targetCountries.map((country, i) => (
                                    <div key={i} className="px-6 py-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                        <MapPin size={14} className="text-[#deff9a]" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{country}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 入金スケジュール */}
                    <section id="payout" className="scroll-mt-32 space-y-8">
                        <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                            <Receipt className="text-slate-900" size={32} />
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">入金スケジュール</h2>
                        </div>
                        <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100">
                            <div className="flex flex-col md:flex-row items-center gap-12 mb-10 text-center md:text-left">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-slate-400 uppercase">売上締め日</div>
                                    <div className="text-4xl font-black italic">毎月末日</div>
                                </div>
                                <ArrowRight className="hidden md:block text-slate-200" size={32} />
                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-cyan-600 uppercase">お振込日</div>
                                    <div className="text-4xl font-black italic">翌月15日</div>
                                </div>
                            </div>
                            <div className="space-y-3 text-[10px] font-bold text-slate-500 border-t border-slate-200 pt-8">
                                <p>・国内拠点での検品完了をもって売上が確定し、支払対象となります。</p>
                                <p>・15日が休日の場合は、その前営業日に振り込まれます。</p>
                            </div>
                        </div>
                    </section>

                    {/* 禁制品について */}
                    <section id="prohibited" className="scroll-mt-32 space-y-8">
                        <div className="flex items-center gap-4 border-b-4 border-rose-500 pb-4">
                            <Ban className="text-rose-500" size={32} />
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">禁制品について</h2>
                        </div>
                        <div className="bg-rose-50 p-10 rounded-[3rem] border border-rose-100">
                            <p className="text-sm font-bold text-rose-700 mb-8">
                                国際配送上の規制により、以下の物品は取り扱いできません。
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                {[
                                    { t: "引火性液体", d: "香水・オイル等", icon: <Zap size={20} /> },
                                    { t: "電池単体", d: "リチウム電池等", icon: <ShieldAlert size={20} /> },
                                    { t: "生鮮食品", d: "肉類・要冷蔵品", icon: <Truck size={20} /> },
                                    { t: "成人向け作品", d: "R-18指定作品", icon: <Ban size={20} /> }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white p-5 rounded-2xl border border-rose-100 flex flex-col items-center gap-2">
                                        <div className="text-rose-400">{item.icon}</div>
                                        <div className="text-[10px] font-black uppercase text-rose-600">{item.t}</div>
                                        <div className="text-[8px] font-bold text-rose-300">{item.d}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 利用手数料 */}
                    <section id="fees" className="scroll-mt-32 space-y-8">
                        <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                            <Coins className="text-slate-900" size={32} />
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">利用手数料</h2>
                        </div>
                        <div className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        { label: "販売システム利用料", fee: "8%", desc: "多言語翻訳、海外決済、サポート対応費が含まれます" },
                                        { label: "応援チップ手数料", fee: "0%", desc: "ファンからのチップは全額クリエイターへ還元されます" },
                                        { label: "振込手数料", fee: "一律 220円", desc: "お振込1回あたりの銀行手数料実費となります" }
                                    ].map((f, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-10 py-8">
                                                <div className="text-[11px] font-black uppercase tracking-widest">{f.label}</div>
                                                <div className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{f.desc}</div>
                                            </td>
                                            <td className="px-10 py-8 text-xl font-black text-right italic">{f.fee}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 国内拠点への配送 */}
                    <section id="shipping" className="scroll-mt-32 space-y-8">
                        <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                            <Warehouse className="text-slate-900" size={32} />
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">国内拠点への配送</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <p className="text-sm font-bold text-slate-500 leading-relaxed">
                                    注文が入った商品は、指定された日本の集約拠点へ送るだけ。海外用の梱包は一切不要です。
                                </p>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                                    <Truck className="text-cyan-500" />
                                    <span className="text-[10px] font-black">千葉県・大阪府の配送センター</span>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-900 text-white rounded-[3rem] space-y-4">
                                <h4 className="text-[#deff9a] font-black text-sm uppercase">国内配送料について</h4>
                                <p className="text-xs text-slate-400 font-bold leading-relaxed">
                                    国内拠点までの配送料はクリエイター様のご負担となりますが、Group Order(GO)の場合、複数学を1箱で送ることで、1個あたりの国内送料を大幅に削減できます。
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 作業スケジュール */}
                    <section id="timeline" className="scroll-mt-32 space-y-8">
                        <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                            <Timer className="text-slate-900" size={32} />
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">作業スケジュール</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { t: "拠点到着・検品", d: "到着後 1〜2 営業日以内に完了" },
                                { t: "国際発送準備", d: "検品完了後 1〜3 営業日以内に海外発送" },
                                { t: "売上反映", d: "検品完了の翌日にダッシュボードへ計上" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <span className="text-lg font-black italic uppercase">{item.t}</span>
                                    <span className="text-xs font-bold text-slate-400">{item.d}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 注意事項 */}
                    <section id="precautions" className="scroll-mt-32 space-y-8">
                        <div className="flex items-center gap-4 border-b-4 border-slate-900 pb-4">
                            <AlertCircle className="text-slate-900" size={32} />
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">注意事項</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                "販売価格は日本円(JPY)で設定。ファン側では決済時の為替で自動計算されます。",
                                "関税や輸入消費税は、すべて受取人（ファン）の負担となります。",
                                "拠点検品後の国際発送トラブル（紛失等）はCirclePortが責任を負います。"
                            ].map((text, i) => (
                                <div key={i} className="flex gap-4 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                    <div className="w-6 h-6 bg-slate-900 text-[#deff9a] rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0">!</div>
                                    <p className="text-xs text-slate-600 font-bold">{text}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>

            {/* --- 4. FINAL CTA --- */}
            <footer className="py-32 bg-slate-900 text-white text-center px-6">
                <div className="max-w-4xl mx-auto space-y-12">
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                        Ready to Share<br />
                        <span className="text-[#deff9a]">Your Art?</span>
                    </h2>
                    <Link href={route('creator.register')} className="inline-block px-16 py-8 bg-[#deff9a] text-slate-900 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-2xl">
                        今すぐクリエイター登録
                    </Link>
                </div>
            </footer>
        </div>
    );
}