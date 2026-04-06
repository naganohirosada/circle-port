import React from 'react';
import { Lock, Globe, Truck, Users, X, Search, User } from 'lucide-react';
export default function BasicSection({
    data,
    setData,
    errors,
    __,
    creators,
    isCreatorFixed,
    handleCreatorChange,
    onFanSearch,
    onRemoveFan
}) {
    const labelStyle = "text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 block";
    const inputStyle = "w-full p-5 rounded-2xl bg-slate-50/50 border-2 border-slate-100 focus:border-cyan-500 focus:bg-white outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300";

    return (
        <div className="space-y-10">
            <div className="space-y-4 p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-xl">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-2 block">{__('Target Creator')}</label>
                {isCreatorFixed ? (
                    <div className="flex items-center gap-4 py-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-black text-lg">
                            {creators?.find(c => c.id == data.creator_id)?.name?.charAt(0)}
                        </div>
                        <div className="space-y-1">
                            <div className="text-xl font-black italic uppercase tracking-wider">{creators?.find(c => c.id == data.creator_id)?.name}</div>
                            <div className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">{__('Selected Creator Locked')}</div>
                        </div>
                    </div>
                ) : (
                    <select 
                        value={data.creator_id} onChange={(e) => handleCreatorChange(e.target.value)}
                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-5 font-black text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                    >
                        <option value="">{__('SELECT A CREATOR')}</option>
                        {creators?.map(creator => <option key={creator.id} value={creator.id}>{creator.name}</option>)}
                    </select>
                )}
            </div>

            {/* --- 新規：配送モード選択 --- */}
            <div className="space-y-4">
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{__('Shipping Mode')}</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setData('shipping_mode', 'individual')}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center gap-3 ${data.shipping_mode === 'individual' ? 'border-cyan-500 bg-cyan-50' : 'border-slate-100 bg-white'}`}
                    >
                        <Truck size={24} className={data.shipping_mode === 'individual' ? 'text-cyan-600' : 'text-slate-400'} />
                        <div>
                            <p className="font-black text-sm uppercase tracking-wider">{__('Individual')}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">{__('Direct to Fan')}</p>
                        </div>
                    </button>
                    <button
                        type="button"
                        onClick={() => setData('shipping_mode', 'bulk')}
                        className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center text-center gap-3 ${data.shipping_mode === 'bulk' ? 'border-cyan-500 bg-cyan-50' : 'border-slate-100 bg-white'}`}
                    >
                        <Users size={24} className={data.shipping_mode === 'bulk' ? 'text-cyan-600' : 'text-slate-400'} />
                        <div>
                            <p className="font-black text-sm uppercase tracking-wider">{__('Bulk')}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">{__('Gather at GOM')}</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* --- 新規：限定公開（招待制）設定 --- */}
            <div className="p-8 bg-slate-900 rounded-[3rem] text-white space-y-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${data.is_private ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                            <Lock size={24} />
                        </div>
                        <div>
                            <p className="font-black text-lg tracking-tight">{__('Private Group')}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{__('Invitation Only')}</p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={() => setData('is_private', !data.is_private)}
                        className={`w-14 h-7 rounded-full transition-all relative ${data.is_private ? 'bg-cyan-500' : 'bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg transition-all ${data.is_private ? 'left-8' : 'left-1'}`} />
                    </button>
                </div>

                {data.is_private && (
                    <div className="space-y-6 pt-6 border-t border-slate-800">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder={__('Enter Fan ID (e.g. FAN-12345)')}
                                className="w-full p-4 pr-12 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 outline-none text-sm font-bold placeholder:text-slate-600"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        onFanSearch(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
                        </div>

                        {/* 招待済みリスト */}
                        <div className="flex flex-wrap gap-3">
                            {data.allowed_fans?.map(fan => (
                                <div key={fan.id} className="flex items-center gap-3 pl-2 pr-1 py-1 bg-slate-800 border border-slate-700 rounded-full">
                                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                        <User size={12} className="text-cyan-400" />
                                    </div>
                                    <span className="text-xs font-bold">{fan.name}</span>
                                    <button 
                                        type="button"
                                        onClick={() => onRemoveFan(fan.id)}
                                        className="p-1 hover:bg-slate-700 rounded-full transition-colors"
                                    >
                                        <X size={12} className="text-slate-500" />
                                    </button>
                                </div>
                            ))}
                            {data.allowed_fans?.length === 0 && (
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">
                                    {__('No fans invited yet')}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <label className={labelStyle}>{__('GO Project Title')}</label>
                <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className={inputStyle} placeholder={__('ENTER GO PROJECT NAME')} />
                {errors.title && <div className="text-red-500 text-[10px] font-bold uppercase mt-2">{errors.title}</div>}
            </div>

            <div className="space-y-4">
                <label className={labelStyle}>{__('GO Policy & Description')}</label>
                <textarea value={data.description} onChange={e => setData('description', e.target.value)} className={`${inputStyle} h-48 resize-none`} placeholder={__('DESCRIBE YOUR GO RULES...')} />
                {errors.description && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className={labelStyle}>{__('Recruitment Start')}</label>
                    <input type="datetime-local" value={data.recruitment_start_date} onChange={e => setData('recruitment_start_date', e.target.value)} className={inputStyle} />
                    {errors.recruitment_start_date && <p className="text-red-500 text-[10px] font-black uppercase mt-2">{errors.recruitment_start_date}</p>}
                </div>
                <div className="space-y-4">
                    <label className={labelStyle}>{__('Recruitment Deadline')}</label>
                    <input type="datetime-local" value={data.recruitment_end_date} onChange={e => setData('recruitment_end_date', e.target.value)} className={inputStyle} />
                    {errors.recruitment_end_date && <p className="text-red-500 text-[10px] font-black uppercase mt-2">{errors.recruitment_end_date}</p>}
                </div>
            </div>

            <div className="space-y-4">
                <label className={labelStyle}>{__('Payment Structure')}</label>
                <button
                    type="button" onClick={() => setData('is_secondary_payment_required', !data.is_secondary_payment_required)}
                    className={`w-full p-6 rounded-2xl border-2 flex items-center justify-between transition-all ${data.is_secondary_payment_required ? 'border-cyan-500 bg-white shadow-lg shadow-cyan-50' : 'border-slate-100 bg-slate-50/50'}`}
                >
                    <div className="text-left font-black text-slate-900 uppercase tracking-widest">{__('Require Secondary Payment')}</div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${data.is_secondary_payment_required ? 'bg-cyan-500' : 'bg-slate-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${data.is_secondary_payment_required ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                </button>
            </div>
        </div>
    );
}