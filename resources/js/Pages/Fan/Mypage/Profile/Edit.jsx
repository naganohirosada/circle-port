import React from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { User, Mail, Globe, Languages, Save, ChevronLeft, Clock } from 'lucide-react';

export default function Edit({ profile, countries, languages, timezones, currencies }) {
    const { language } = usePage().props;
    const __ = (key) => language?.[key] || key;

    const { data, setData, patch, processing, errors } = useForm({
        name: profile.name || '',
        email: profile.email || '',
        country_id: profile.country_id || '',
        currency_id: profile.currency_id || '', 
        language_id: profile.language_id || '',
        timezone_id: profile.timezone_id || '',
    });


    // 共通のエラー表示コンポーネント（憲法：DRY原則）
    const ErrorMsg = ({ message }) => (
        message ? <p className="text-pink-500 text-[11px] font-black mt-2 ml-2 tracking-wide animate-pulse">
            {__(message)}
        </p> : null
    );

    // エラーがある時の入力枠スタイル
    const inputClass = (hasError) => `
        w-full bg-slate-50 border-2 rounded-2xl p-5 font-bold text-slate-700 transition-all focus:ring-2 focus:ring-cyan-500 
        ${hasError ? 'border-pink-200 bg-pink-50/30' : 'border-transparent focus:bg-white'}
    `;

    const submit = (e) => {
        e.preventDefault();
        patch(route('fan.mypage.profile.update'));
    };

    return (
        <FanLayout>
            <Head title={__('Profile Settings')} />

            <div className="max-w-[800px] mx-auto px-6 py-16">
                <Link href={route('fan.mypage.dashboard')} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-600 mb-12 transition-colors">
                    <ChevronLeft size={14} /> {__('Back to Dashboard')}
                </Link>

                <h1 className="text-4xl font-black text-slate-900 mb-10 tracking-tight">{__('Profile Settings')}</h1>

                <form onSubmit={submit} className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-12">
                    
                    {/* 基本情報 */}
                    <section className="space-y-8">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-600 border-b border-slate-50 pb-4">{__('Basic Information')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Name */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-3">
                                    <User size={12} /> {__('Full Name')}
                                </label>
                                <input 
                                    type="text" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    className={inputClass(errors.name)} 
                                />
                                <ErrorMsg message={errors.name} />
                            </div>
                            {/* Email */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-3">
                                    <Mail size={12} /> {__('Email Address')}
                                </label>
                                <input 
                                    type="email" 
                                    value={data.email} 
                                    onChange={e => setData('email', e.target.value)} 
                                    className={inputClass(errors.email)} 
                                />
                                <ErrorMsg message={errors.email} />
                            </div>
                        </div>
                    </section>

                    {/* 地域・言語 */}
                    <section className="space-y-8">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-600 border-b border-slate-50 pb-4">{__('Region & Language')}</h2>
                        <div className="space-y-8">
                           {/* Timezone を追加 */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-3">
                                    <Clock size={12} /> {__('Timezone')}
                                </label>
                                <select 
                                    value={data.timezone_id} 
                                    onChange={e => setData('timezone_id', e.target.value)} 
                                    className={inputClass(errors.timezone_id)}
                                >
                                    <option value="">{__('Select Timezone')}</option>
                                    {timezones.map((tz) => (
                                        <option key={tz.id} value={tz.id}>
                                            {tz.display_name}
                                        </option>
                                    ))}
                                </select>
                                <ErrorMsg message={errors.timezone_id} />
                            </div>
                            {/* Country */}
                            <div className="group">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-3">
                                    <Globe size={12} /> {__('Country of Residence')}
                                </label>
                                <select 
                                    value={data.country_id} 
                                    onChange={e => setData('country_id', e.target.value)} 
                                    className={inputClass(errors.country_id)}
                                >
                                    <option value="">{__('Select Country')}</option>
                                    {countries.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <ErrorMsg message={errors.country_id} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Language */}
                                <div className="group">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-3">
                                        <Languages size={12} /> {__('Preferred Language')}
                                    </label>
                                    <select 
                                        value={data.language_id} 
                                        onChange={e => setData('language_id', e.target.value)} 
                                        className={inputClass(errors.language_id)}
                                    >
                                        <option value="">{__('Select Language')}</option>
                                        {languages.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ErrorMsg message={errors.language_id} />
                                </div>
                                {/* Currency */}
                                <div className="group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-3 block">
                                        {__('Preferred Currency')}
                                    </label>
                                    <select 
                                        value={data.currency_id} 
                                        onChange={e => setData('currency_id', e.target.value)} 
                                        className={inputClass(errors.currency_id)}
                                    >
                                        <option value="">{__('Select Currency')}</option>
                                        {currencies.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.code} - {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ErrorMsg message={errors.currency_id} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="pt-6">
                        <button 
                            disabled={processing} 
                            className={`
                                w-full py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl
                                ${processing 
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                    : 'bg-slate-900 text-white hover:bg-cyan-600 active:scale-[0.98] shadow-slate-200'
                                }
                            `}
                        >
                            {processing ? (
                                <>
                                    <div className="w-5 h-5 border-4 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
                                    {__('Saving...')}
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    {__('Update Profile')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </FanLayout>
    );
}