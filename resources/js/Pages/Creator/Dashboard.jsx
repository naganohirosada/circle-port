import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { 
    Package, Users, BarChart3, 
    Clock, CreditCard, ShoppingBag, ChevronRight
} from 'lucide-react';

export default function Dashboard({ groupOrders, regularOrders, stats }) {
    
    /**
     * 統計カードコンポーネント
     */
    const StatCard = ({ label, value, sub, icon: Icon, color }) => (
        <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 relative overflow-hidden group">
            <div className={`absolute -right-4 -bottom-4 text-slate-50 group-hover:text-${color}-50 transition-colors`}>
                <Icon size={120} strokeWidth={3} />
            </div>
            <div className="relative z-10">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</div>
                <div className="text-4xl font-black text-slate-900 tracking-tighter">{value}</div>
                <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase">{sub}</div>
            </div>
        </div>
    );

    return (
        <CreatorLayout>
            <Head title="クリエイターダッシュボード" />

            <div className="max-w-7xl mx-auto px-8 py-12">
                {/* ヘッダーセクション */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">
                            Studio Overview
                        </h1>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                            製作数と売上の概況
                        </p>
                    </div>
                    <div className="bg-slate-50 border-2 border-slate-100 px-6 py-3 rounded-2xl">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Role: Creator
                        </span>
                    </div>
                </div>

                {/* 統計セクション */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard 
                        label="今月の売上（税込）"
                        value={`¥${(stats.total_earnings || 0).toLocaleString()}`} 
                        sub={`${new Date().getMonth() + 1}月1日〜現在の合計`}
                        icon={BarChart3} 
                        color="emerald" 
                    />
                    <StatCard 
                        label="進行中のプロジェクト" 
                        value={stats.active_go || 0} 
                        sub="募集・製作中のGO数"
                        icon={Clock} 
                        color="cyan" 
                    />
                    <StatCard 
                        label="全プロジェクト" 
                        value={stats.project_count || 0} 
                        sub="作成済みの全グループオーダー"
                        icon={Package} 
                        color="amber" 
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* 左：進行中のプロジェクト */}
                    <div className="lg:col-span-8 space-y-8">
                        <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                            <div className="p-10 border-b border-slate-50">
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                                    <Package className="text-cyan-500" size={24} />
                                    進行中のプロジェクト
                                </h3>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {groupOrders && groupOrders.length > 0 ? groupOrders.map((go) => (
                                    <div key={go.id} className="p-8 flex items-center justify-between hover:bg-slate-50/30 transition-colors group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-50 flex-shrink-0">
                                                {go.thumbnail ? (
                                                    <img src={go.thumbnail} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <ShoppingBag size={24} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${go.status === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                        {go.status === 1 ? '募集中' : '製作・納品準備中'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                        <Users size={10} /> {go.participants_count}名が参加
                                                    </span>
                                                </div>
                                                <h4 className="font-black text-slate-900 uppercase tracking-tight">
                                                    {go.title}
                                                </h4>
                                            </div>
                                        </div>
                                        
                                        <Link 
                                            href={route('creator.go.production', go.id)}
                                            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all shadow-md active:scale-95"
                                        >
                                            製作数を確認
                                            <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                )) : (
                                    <div className="p-20 text-center">
                                        <p className="text-slate-400 font-bold text-sm italic uppercase tracking-widest">
                                            アクティブなプロジェクトはありません
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* 右：直近の売上通知（HasOneリレーション対応版） */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-slate-50">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                    <CreditCard className="text-emerald-500" size={18} />
                                    直近の通常売上
                                </h3>
                            </div>
                            
                            <div className="divide-y divide-slate-50">
                                {regularOrders && regularOrders.length > 0 ? regularOrders.map((order) => {
                                    
                                    // 憲法第1条（堅牢性）: HasOneリレーションに基づき、payment直下のbreakdownsを計算
                                    // order.payment は単体オブジェクト、order.payment.breakdowns は配列
                                    const breakdowns = order.payment?.breakdowns || [];
                                    
                                    const creatorRevenue = breakdowns.reduce((sum, b) => {
                                        // タイプ 1(商品代) と 5(商品税) だけを抽出して合算
                                        if (b.type === 1 || b.type === 5) {
                                            return sum + (Number(b.amount) || 0);
                                        }
                                        return sum;
                                    }, 0);

                                    return (
                                        <div key={order.id} className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">
                                                    Order: #{order.id}
                                                </span>
                                                <span className="text-[10px] font-black text-emerald-500 uppercase">
                                                    支払い完了
                                                </span>
                                            </div>
                                            <div className="text-xs font-bold text-slate-600 truncate mb-1 uppercase">
                                                {order.order_items?.[0]?.product?.name || '商品'}
                                                {order.order_items?.length > 1 && <span className="ml-1 text-slate-300 font-normal">ほか{order.order_items.length - 1}件</span>}
                                            </div>
                                            <div className="text-sm font-black text-slate-900">
                                                ¥{creatorRevenue.toLocaleString()}
                                            </div>
                                            <div className="text-[8px] font-bold text-slate-400 mt-2">
                                                確定日: {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="p-10 text-center">
                                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
                                            売上データはありません
                                        </div>
                                    </div>
                                )}
                            </div>

                            {regularOrders?.length > 0 && (
                                <div className="p-4 bg-slate-50/50 text-center">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        売上詳細は「精算管理」から確認できます
                                    </span>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </CreatorLayout>
    );
}