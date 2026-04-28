import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { 
    Calendar, Users, Lock, Globe, Ship, 
    Search, UserPlus, Trash2, ShieldCheck,
    Home, UserCheck, Info, AlertCircle
} from 'lucide-react';
import axios from 'axios';

export default function BasicSection({ data, setData, errors, mode = 'all' }) {
    const { language } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const [fanSearchQuery, setFanSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const searchFans = async (query) => {
        if (!query) return;
        setIsSearching(true);
        try {
            const response = await axios.get(route('fan.api.fans.search', { query }));
            setSearchResults(response.data);
        } catch (error) {
            console.error('Fan search failed', error);
        } finally {
            setIsSearching(false);
        }
    };

    const addAllowedFan = (fan) => {
        if (data.allowed_fans.find(f => f.id === fan.id)) return;
        setData('allowed_fans', [...data.allowed_fans, fan]);
        setSearchResults([]);
        setFanSearchQuery('');
    };

    const removeAllowedFan = (fanId) => {
        setData('allowed_fans', data.allowed_fans.filter(f => f.id !== fanId));
    };

    // ステップ3: 内容（タイトル・説明）
    const renderContentFields = () => (
        <div className="space-y-8">
            <div className="space-y-2">
                <InputLabel value={__('Campaign Title')} />
                <TextInput
                    className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-cyan-500 py-4 font-bold"
                    value={data.title}
                    onChange={e => setData('title', e.target.value)}
                    placeholder={__('e.g. Special Group Order for European Fans')}
                />
                <InputError message={errors.title} />
            </div>
            <div className="space-y-2">
                <InputLabel value={__('Project Story / Description')} />
                <textarea
                    className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-cyan-500 rounded-3xl text-sm min-h-[250px] p-6 font-medium leading-loose"
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    placeholder={__('Explain why you are starting this GO...')}
                />
                <InputError message={errors.description} />
            </div>
        </div>
    );

    // ステップ2: 目標・配送・公開設定
    const renderGoalFields = () => (
        <div className="space-y-12">
            {/* 期間と人数 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 ml-1"><Calendar size={14} className="text-cyan-500" /><InputLabel value={__('Start Date')} /></div>
                    <TextInput type="date" className="w-full bg-slate-50 border-none" value={data.recruitment_start_date} onChange={e => setData('recruitment_start_date', e.target.value)} />
                    <InputError message={errors.recruitment_start_date} />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 ml-1"><Calendar size={14} className="text-rose-500" /><InputLabel value={__('End Date')} /></div>
                    <TextInput type="date" className="w-full bg-slate-50 border-none" value={data.recruitment_end_date} onChange={e => setData('recruitment_end_date', e.target.value)} />
                    <InputError message={errors.recruitment_end_date} />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 ml-1"><Users size={14} className="text-cyan-500" /><InputLabel value={__('Max Participants')} /></div>
                    <TextInput type="number" className="w-full bg-slate-50 border-none" value={data.max_participants} onChange={e => setData('max_participants', e.target.value)} placeholder={__('Unlimited')} />
                    <InputError message={errors.max_participants} />
                </div>
            </div>

            {/* 配送モード選択 (shipping_mode) */}
            <div className="space-y-6">
                <div>
                    <InputLabel value={__('Shipping Mode')} className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1" />
                    <p className="text-[10px] text-slate-500 font-bold mb-4">{__('Choose how items will be delivered from Japan to participants.')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* モード1: GOM宅へ一括配送 */}
                    <button
                        type="button"
                        onClick={() => setData('shipping_mode', 'bulk_to_gom')}
                        className={`p-8 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group
                            ${data.shipping_mode === 'bulk_to_gom' ? 'border-cyan-500 bg-cyan-50 shadow-xl shadow-cyan-100' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                        <div className="flex items-start gap-4 relative z-10">
                            <div className={`p-4 rounded-2xl ${data.shipping_mode === 'bulk_to_gom' ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <Home size={24} />
                            </div>
                            <div className="space-y-2">
                                <span className="text-sm font-black uppercase block">{__('Bulk Delivery to GOM')}</span>
                                <div className="space-y-1">
                                    <p className="text-[11px] text-slate-600 font-bold leading-relaxed italic">
                                        {__('Best for friends & local groups.')}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-tight bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                                        <ShieldCheck size={12} /> {__('Split International Shipping')}
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-2">
                                    {__('All items are shipped in one box to the Manager\'s address. Participants save significantly by splitting the international courier fee.')}
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* モード2: 個別配送 */}
                    <button
                        type="button"
                        onClick={() => setData('shipping_mode', 'individual')}
                        className={`p-8 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group
                            ${data.shipping_mode === 'individual' ? 'border-cyan-500 bg-cyan-50 shadow-xl shadow-cyan-100' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                    >
                        <div className="flex items-start gap-4 relative z-10">
                            <div className={`p-4 rounded-2xl ${data.shipping_mode === 'individual' ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <UserCheck size={24} />
                            </div>
                            <div className="space-y-2">
                                <span className="text-sm font-black uppercase block">{__('Direct to Each Participant')}</span>
                                <div className="space-y-1">
                                    <p className="text-[11px] text-slate-600 font-bold leading-relaxed italic">
                                        {__('Safe for public groups.')}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-cyan-600 uppercase tracking-tight bg-cyan-50 px-2 py-1 rounded-lg w-fit">
                                        <ShieldCheck size={12} /> {__('Split Domestic Shipping')}
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-2">
                                    {__('Items are sorted at our warehouse and sent to each fan individually. Participants only split the domestic shipping cost from the Creator.')}
                                </p>
                            </div>
                        </div>
                    </button>
                </div>
                <InputError message={errors.shipping_mode} />
            </div>

            {/* 公開設定と許可ユーザー */}
            <div className="space-y-6 pt-6 border-t border-slate-100">
                <div className={`p-6 rounded-[2.5rem] border-2 transition-all flex items-center justify-between cursor-pointer
                    ${data.is_private ? 'bg-slate-900 border-slate-900 shadow-2xl shadow-slate-200' : 'bg-slate-50 border-slate-100'}`}
                    onClick={() => setData('is_private', !data.is_private)}
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${data.is_private ? 'bg-white/10 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                            {data.is_private ? <Lock size={20} /> : <Globe size={20} />}
                        </div>
                        <div>
                            <span className={`text-[10px] font-black uppercase tracking-widest block ${data.is_private ? 'text-cyan-400' : 'text-slate-400'}`}>
                                {data.is_private ? __('Private Box (Restricted)') : __('Public Box (Visible to All)')}
                            </span>
                            <span className={`text-xs font-bold ${data.is_private ? 'text-white' : 'text-slate-700'}`}>
                                {data.is_private ? __('Only selected fans can join') : __('Visible in global search results')}
                            </span>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${data.is_private ? 'bg-cyan-500' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.is_private ? 'right-1' : 'left-1'}`}></div>
                    </div>
                </div>

                {data.is_private && (
                    <div className="bg-white border-2 border-slate-900 rounded-[2.5rem] p-8 space-y-6 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={16} className="text-cyan-500" /> {__('Allowed Participants')}</h4>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-cyan-500"
                                placeholder={__('Search fans by name or unique ID...')}
                                value={fanSearchQuery}
                                onChange={(e) => {
                                    setFanSearchQuery(e.target.value);
                                    if (e.target.value.length > 2) searchFans(e.target.value);
                                }}
                            />
                            {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-2 border-cyan-500 border-t-transparent"></div>}
                        </div>
                        {searchResults.length > 0 && (
                            <div className="bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden">
                                {searchResults.map(fan => (
                                    <button key={fan.id} type="button" onClick={() => addAllowedFan(fan)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-none">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 text-[10px] font-black">FAN</div>
                                            <span className="text-xs font-bold">{fan.name}</span>
                                        </div>
                                        <UserPlus size={16} className="text-cyan-500" />
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {data.allowed_fans.map(fan => (
                                <div key={fan.id} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest group">
                                    <span>{fan.name}</span>
                                    <button type="button" onClick={() => removeAllowedFan(fan.id)} className="text-slate-500 hover:text-rose-400 transition-colors"><Trash2 size={12} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    if (mode === 'content_only') return renderContentFields();
    if (mode === 'goals_only') return renderGoalFields();

    return (
        <div className="space-y-12">
            {renderContentFields()}
            <div className="h-px bg-slate-100" />
            {renderGoalFields()}
        </div>
    );
}