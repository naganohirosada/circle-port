// resources/js/Pages/Fan/Auth/Register.jsx

import React, { useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import { Mail, Lock, User, Globe, AtSign, Languages, Sparkles, Rocket } from 'lucide-react';

export default function Register({ countries = [], languages = [] }) {
    // Middlewareから共有された海外ファン用ロケールと言語翻訳データをロード
    const { language, current_locale } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        unique_id: '',
        email: '',
        country_id: '',
        language_id: '',
        password: '',
        password_confirmation: '',
    });

    // ユーザー指定の「countriesテーブルに存在する、許可すべき16の海外拠点」のISOコードリスト
    const allowedOverseasCodes = [
        'US', 'CA', 'GB', 'FR', 'DE', 'ID', 'TH', 'VN', 'CN', 'TW', 'HK', 'KR', 'AU', 'NZ', 'SG', 'MY'
    ];

    // 【17カ国多言語・完全補斉マトリクス】元の白ベースレイアウトのヘッドエリアに動的表示する文言
    const welcomeMatrix = {
        en: {
            msg: "Create your passport to Japan's premium Indie Art scene.",
            badge: "GLOBAL CROSS-BORDER PORT",
            accentText: "text-indigo-600"
        },
        id: {
            msg: "Buat paspor internasionalmu untuk mendukung kreator Jepang secara langsung.",
            badge: "REGION INDONESIA DETECTED",
            accentText: "text-emerald-600"
        },
        zh: {
            msg: "建立您的海外專屬帳戶，直通日本繪師與原創同人港。",
            badge: "大中華及東亞區節點開啟",
            accentText: "text-purple-600"
        },
        th: {
            msg: "สร้างพาสปอร์ตของคุณเพื่อเข้าสู่คอมมูนิตี้ครีเอเตอร์ญี่ปุ่นโดยตรง",
            badge: "THAILAND Live Node",
            accentText: "text-amber-600"
        },
        vi: {
            msg: "Tạo hộ chiếu quốc tế của bạn để kết nối trực tiếp với các nhà sáng tạo Nhật Bản.",
            badge: "VIETNAM LIVE NODE",
            accentText: "text-red-600"
        },
        ko: {
            msg: "일본 프리미엄 버튜버 동인지 및 오리지널 굿즈 직배송 포트 가입.",
            badge: "KOREA Live Node",
            accentText: "text-blue-600"
        },
        fr: {
            msg: "Créez votre passeport pour soutenir directement la culture Vtuber au Japon.",
            badge: "NODE EU / FRANCE ACTIVE",
            accentText: "text-sky-600"
        },
        de: {
            msg: "Erstellen Sie Ihren Pass, um japanische Vtuber-Künstler zollkonform zu unterstützen.",
            badge: "NODE EU / DEUTSCHLAND ACTIVE",
            accentText: "text-amber-700"
        }
    };

    const currentWelcome = welcomeMatrix[current_locale] || welcomeMatrix.en;

    const submit = (e) => {
        e.preventDefault();
        post(route('fan.register.store'));
    };

    const inputWrapperStyle = "relative group";
    const iconStyle = "absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors";
    const inputStyle = "w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100/70 rounded-2xl font-bold text-slate-900 outline-none focus:border-cyan-500 focus:bg-white transition-all placeholder:text-slate-300 font-sans";

    return (
        <FanLayout>
            <Head title={__('Join CirclePort')} />

            {/* 配置や白ベースのトンマナ（bg-slate-50）は前のまま完全維持 */}
            <div className="max-w-[500px] mx-auto px-4 py-16 font-sans text-slate-800">
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/40 p-8 md:p-12 space-y-8">
                    
                    {/* Header Area */}
                    <div className="text-center space-y-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black uppercase tracking-widest ${currentWelcome.accentText}`}>
                            <Rocket size={12} />
                            {currentWelcome.badge}
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{__('Create Account')}</h1>
                        <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-sm mx-auto">
                            {currentWelcome.msg}
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Name */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">{__('Display Name')}</label>
                            <div className={inputWrapperStyle}>
                                <User size={18} className={iconStyle} />
                                <input type="text" placeholder="John Doe" value={data.name} className={inputStyle} onChange={e => setData('name', e.target.value)} />
                            </div>
                            {errors.name && <p className="text-red-500 text-[10px] font-black mt-1 ml-4 uppercase tracking-widest">{errors.name}</p>}
                        </div>

                        {/* Global User ID */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">{__('Global User ID')}</label>
                            <div className={inputWrapperStyle}>
                                <AtSign size={18} className={iconStyle} />
                                <input type="text" placeholder="holofan_99" value={data.unique_id} className={inputStyle} onChange={e => setData('unique_id', e.target.value)} />
                            </div>
                            {errors.unique_id && <p className="text-red-500 text-[10px] font-black mt-1 ml-4 uppercase tracking-widest">{errors.unique_id}</p>}
                        </div>

                        {/* Region / Country Selection (【大掃除バグ修正】：c.iso_codeへと正確に紐づけを修正) */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">{__('Your Region / Country')}</label>
                            <div className={inputWrapperStyle}>
                                <Globe size={18} className={iconStyle} />
                                <select value={data.country_id} className={`${inputStyle} appearance-none text-slate-700`} onChange={e => setData('country_id', e.target.value)}>
                                    <option value="" className="text-slate-300">{__('Select Your Country')}</option>
                                    {countries.filter(c => allowedOverseasCodes.includes(c.iso_code)).map(c => (
                                        <option key={c.id} value={c.id} className="text-slate-800 font-bold">{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.country_id && <p className="text-red-500 text-[10px] font-black mt-1 ml-4 uppercase tracking-widest">{errors.country_id}</p>}
                        </div>

                        {/* System Language */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">{__('Preferred Language')}</label>
                            <div className={inputWrapperStyle}>
                                <Languages size={18} className={iconStyle} />
                                <select value={data.language_id} className={`${inputStyle} appearance-none text-slate-700`} onChange={e => setData('language_id', e.target.value)}>
                                    <option value="" className="text-slate-300">{__('Select Language')}</option>
                                    {languages.map(lang => (
                                        <option key={lang.id} value={lang.id} className="text-slate-800 font-bold">{lang.native_name || lang.name}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.language_id && <p className="text-red-500 text-[10px] font-black mt-1 ml-4 uppercase tracking-widest">{errors.language_id}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">{__('Email Address')}</label>
                            <div className={inputWrapperStyle}>
                                <Mail size={18} className={iconStyle} />
                                <input type="email" placeholder="you@example.com" value={data.email} className={inputStyle} onChange={e => setData('email', e.target.value)} />
                            </div>
                            {errors.email && <p className="text-red-500 text-[10px] font-black mt-1 ml-4 uppercase tracking-widest">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">{__('Password')}</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className={inputWrapperStyle}>
                                    <Lock size={18} className={iconStyle} />
                                    <input type="password" placeholder={__('Password')} value={data.password} className={inputStyle} onChange={e => setData('password', e.target.value)} />
                                </div>
                                <div className={inputWrapperStyle}>
                                    <Lock size={18} className={iconStyle} />
                                    <input type="password" placeholder={__('Confirm')} value={data.password_confirmation} className={inputStyle} onChange={e => setData('password_confirmation', e.target.value)} />
                                </div>
                            </div>
                            {errors.password && <p className="text-red-500 text-[10px] font-black mt-1 ml-4 uppercase tracking-widest">{errors.password}</p>}
                        </div>

                        <button disabled={processing} className="group w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg uppercase tracking-[0.2em] hover:bg-cyan-600 transition-all active:scale-[0.99] flex items-center justify-center gap-2 shadow-xl shadow-slate-100 mt-6">
                            {processing ? __('Processing...') : __('Join CirclePort')}
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-slate-100">
                        <p className="text-slate-400 font-bold text-xs">
                            {__('Already have an account?')}
                            <Link href={route('fan.login')} className="ml-2 text-slate-900 hover:text-cyan-600 underline underline-offset-4 font-black transition-colors">
                                {__('Log in')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </FanLayout>
    );
}