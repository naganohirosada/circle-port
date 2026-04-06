import React from 'react';
import FanLayout from '@/Layouts/FanLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import { Package, Truck, Archive, CreditCard, ChevronRight, PlusCircle, Users, FolderEdit } from 'lucide-react';

export default function Dashboard({ stats }) {
    const { language } = usePage().props;
    const __ = (key) => language?.[key] || key;

    // ステータスカードコンポーネント
    const StatusCard = ({ icon: Icon, label, count, href }) => (
        <Link href={href} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                    <Icon size={24} />
                </div>
                <span className="text-3xl font-black text-slate-900">{count}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{__(label)}</span>
                <ChevronRight size={16} className="text-slate-300" />
            </div>
        </Link>
    );

    return (
        <FanLayout>
            <Head title={__('My Page')} />
            
            <div className="max-w-[1200px] mx-auto px-6 py-12">
                <h1 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">{__('My Page')}</h1>

                <section className="mb-16">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-600 mb-6 flex items-center gap-2">
                        <Archive size={14} /> {__('GO Management')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 参加中のGOへのボタン */}
                        <Link 
                            href={route('fan.go.index')} // ルート名は環境に合わせて調整してください
                            className="flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border-2 border-slate-50 hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-50 transition-all group"
                        >
                            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                                <Users size={32} />
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 block">Activity</span>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{__('Joined GOs')}</h3>
                            </div>
                            <ChevronRight className="text-slate-200 group-hover:text-cyan-600 transition-colors" />
                        </Link>

                        {/* 作成したGO（管理画面）へのボタン */}
                        <Link 
                            href={route('fan.go.managed')} // ルート名は環境に合わせて調整してください
                            className="flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border-2 border-slate-50 hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-50 transition-all group"
                        >
                            <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">
                                <FolderEdit size={32} />
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 block">Organizer</span>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{__('Managed GOs')}</h3>
                            </div>
                            <ChevronRight className="text-slate-200 group-hover:text-cyan-600 transition-colors" />
                        </Link>
                    </div>
                </section>

                {/* 物流ステータスセクション */}
                <section className="mb-16">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-600 mb-6 flex items-center gap-2">
                        <Package size={14} /> {__('Package Management')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatusCard icon={CreditCard} label="Ordered" count={stats.ordered_count} href={route('fan.orders.index')} />
                        <StatusCard icon={Archive} label="In Warehouse" count={stats.warehouse_count} href="#" />
                        <StatusCard icon={Truck} label="In Transit" count={stats.shipping_count} href="#" />
                        <StatusCard icon={Package} label="Consolidation" count={stats.consolidation_count} href="#" />
                    </div>
                </section>

                {/* 新規追加：クリエイター/GOMアクションセクション */}
                <section className="mb-16">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-600 mb-6 flex items-center gap-2">
                        <PlusCircle size={14} /> {__('Creator')} Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* デザインシステムに合わせたSlateベースの特大カード */}
                        <Link 
                            href={route('fan.go.create')} 
                            className="flex items-center justify-between p-8 bg-slate-900 rounded-[2.5rem] hover:bg-cyan-600 transition-all group shadow-xl shadow-slate-200"
                        >
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 group-hover:text-white transition-colors">
                                    {__('Start a Campaign')}
                                </span>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                    {__('Create GO')}
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <ChevronRight size={24} />
                            </div>
                        </Link>
                    </div>
                </section>

                {/* アカウント設定へのクイックリンク */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-slate-50 rounded-[3rem] p-10">
                        <h3 className="text-xl font-bold mb-8">{__('Account Settings')}</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Profile', href: route('fan.mypage.profile.edit') },
                                { label: 'Shipping Addresses', href: route('fan.mypage.addresses.index') },
                                { label: 'Payment Methods', href: route('fan.mypage.payments.index') },
                            ].map((item) => (
                                <Link key={item.label} href={item.href} className="flex items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 hover:border-cyan-500 transition-all group">
                                    <span className="font-bold text-slate-700">{__(item.label)}</span>
                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-cyan-600" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-cyan-600 rounded-[3rem] p-10 text-white">
                        <h3 className="text-xl font-bold mb-4">{__('Need Help?')}</h3>
                        <p className="text-cyan-100 text-sm leading-relaxed mb-8">
                            {__('Check our FAQ for international shipping and customs guides.')}
                        </p>
                        <Link className="block w-full bg-white text-cyan-600 text-center py-4 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                            {__('Support Center')}
                        </Link>
                    </div>
                </section>
            </div>
        </FanLayout>
    );
}