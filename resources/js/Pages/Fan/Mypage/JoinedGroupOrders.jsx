import React from 'react';
import { Head, Link } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { Users, ChevronRight, Calendar, Package, Box } from 'lucide-react';

export default function JoinedGroupOrders({ groupOrders, language }) {
    const __ = (key) => language?.[key] || key;

    return (
        <FanLayout>
            <Head title={`${__('Joined GOs')} - CirclePort`} />

            <div className="max-w-6xl mx-auto px-8 py-16">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-4">
                        {__('Joined GOs')}
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                        {__('Discover Group Orders')}
                    </p>
                </div>

                {groupOrders.length === 0 ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                        <Box className="mx-auto text-slate-300 mb-6" size={48} />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-sm">
                            {__('No projects found')}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {groupOrders.map((go) => {
                            const progress = go.max_participants > 0
                                ? Math.min(Math.round((go.participants_count / go.max_participants) * 100), 100)
                                : 0;
                            return (
                                <Link
                                    key={go.id}
                                    href={route('fan.go.detail', go.id)}
                                    className="group bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:border-cyan-500 transition-all duration-300"
                                >
                                    <div className="p-8 flex flex-col lg:flex-row gap-6">
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                                <div>
                                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                                        {go.title}
                                                    </h2>
                                                    <p className="text-slate-400 uppercase tracking-[0.2em] text-xs mt-2">
                                                        {go.creator?.name || __('Unknown Creator')}
                                                    </p>
                                                </div>
                                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    <Users size={14} /> {go.participants_count} / {go.max_participants > 0 ? go.max_participants : '∞'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-500 text-xs uppercase tracking-[0.2em] font-black">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {new Date(go.recruitment_end_date).toLocaleDateString()} {__('Deadline')}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Package size={14} />
                                                    {go.items_count} {__('Items')}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 rounded-full uppercase bg-slate-100 text-slate-500">
                                                        {go.status_label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end">
                                            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-colors group-hover:bg-cyan-500 group-hover:text-white">
                                                <ChevronRight size={28} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </FanLayout>
    );
}
