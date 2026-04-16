import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CreatorLayout from '@/Layouts/CreatorLayout';
import { Plus, Calendar, Target, Layers, ChevronRight } from 'lucide-react';

export default function Index({ projects }) {
    const getStatusStyle = (status) => {
        switch(status) {
            case 10: return 'bg-slate-200 text-slate-600'; // 下書き
            case 20: return 'bg-cyan-400 text-slate-900'; // 公開中
            case 30: return 'bg-lime-400 text-slate-900'; // 成功
            default: return 'bg-slate-900 text-white';
        }
    };

    const getStatusLabel = (status) => {
        switch(status) {
            case 10: return 'Draft / 下書き';
            case 20: return 'Active / 公開中';
            case 30: return 'Success / 成功';
            default: return 'Unknown / 不明';
        }
    };

    return (
        <CreatorLayout>
            <Head title="プロジェクト管理 - CP STUDIO." />

            <div className="p-8 max-w-[1200px] mx-auto space-y-10">
                <header className="flex justify-between items-end border-b-8 border-slate-900 pb-8">
                    <div>
                        <h1 className="text-6xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
                            Project <span className="text-cyan-400">Map</span>
                        </h1>
                        <p className="text-sm font-bold mt-2 text-slate-500 uppercase italic tracking-widest">全プロジェクトのステータスと管理</p>
                    </div>
                    <Link 
                        href={route('creator.project.create')}
                        className="bg-slate-900 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-400 hover:text-slate-900 transition-all shadow-[8px_8px_0px_#A5F3FC] flex items-center gap-3 active:translate-y-1 active:shadow-none"
                    >
                        <Plus size={20} strokeWidth={3} /> 新規プロジェクト始動
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {projects && projects.length > 0 ? projects.map(project => {
                        const translation = project.translations[0] || { title: 'UNTITLED / 未設定' };
                        return (
                            <div key={project.id} className="bg-white border-4 border-slate-900 rounded-[3rem] overflow-hidden shadow-[12px_12px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group">
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-2 border-slate-900 ${getStatusStyle(project.status)}`}>
                                            {getStatusLabel(project.status)}
                                        </span>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-wider">Target / 目標</p>
                                            <p className="text-xl font-black italic">¥{Number(project.target_amount).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <h2 className="text-3xl font-black text-slate-900 uppercase leading-tight group-hover:text-cyan-500 transition-colors">
                                        {translation.title}
                                    </h2>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-slate-400" />
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Delivery / お届け</p>
                                                <p className="text-xs font-bold">{project.delivery_date || 'TBD / 未定'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Target size={16} className="text-slate-400" />
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Support / 支援額</p>
                                                <p className="text-xs font-bold text-cyan-500">¥{Number(project.current_amount).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Link 
                                            href={route('creator.project.edit', project.id)}
                                            className="flex-1 bg-slate-100 text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center hover:bg-slate-900 hover:text-white transition-all border-2 border-transparent hover:border-slate-900 shadow-[4px_4px_0px_#cbd5e1] hover:shadow-none"
                                        >
                                            Edit / 編集
                                        </Link>
                                        <Link 
                                            href={route('creator.project.announcement.index', project.id)}
                                            className="px-6 bg-cyan-400 text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border-2 border-slate-900 shadow-[4px_4px_0px_#000] hover:shadow-none active:translate-y-0.5"
                                        >
                                            Announce / 報告
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="col-span-full py-20 bg-white border-4 border-dashed border-slate-200 rounded-[3rem] text-center">
                            <Layers size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-black italic uppercase tracking-widest">プロジェクトがまだありません</p>
                            <Link href={route('creator.project.create')} className="mt-4 inline-block text-cyan-500 font-black uppercase text-xs hover:underline">
                                最初のプロジェクトを開始する &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </CreatorLayout>
    );
}