import React from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { User, Mail, Globe, Lock, AtSign, Rocket, ArrowRight } from 'lucide-react';

export default function Register({ countries }) {
    const { language } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        unique_id: '', // 追加：招待用ID
        email: '',
        country_id: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('fan.register.store'));
    };

    const inputWrapperStyle = "relative group";
    const iconStyle = "absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors";
    const inputStyle = "w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-cyan-500 focus:bg-white transition-all placeholder:text-slate-300";

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <Head title={__('Join CirclePort!')} />
            
            <div className="w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200 p-12 md:p-16 relative overflow-hidden">
                {/* 装飾用の背景アクセント */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 opacity-50" />
                
                <div className="relative mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <Rocket size={12} />
                        {__('Start your journey')}
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 leading-tight tracking-tighter">
                        {__('Create Account')}
                    </h1>
                    <p className="text-slate-400 font-bold mt-2 text-sm">
                        {__('Get your passport to Japan\'s Indie Art!')}
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Name */}
                    <div className={inputWrapperStyle}>
                        <User size={20} className={iconStyle} />
                        <input 
                            type="text" 
                            placeholder={__('Display Name')} 
                            value={data.name}
                            className={inputStyle}
                            onChange={e => setData('name', e.target.value)} 
                        />
                        {errors.name && <p className="text-red-500 text-[10px] font-black mt-2 uppercase tracking-widest ml-4">{errors.name}</p>}
                    </div>

                    {/* Unique ID (ハンドル名) */}
                    <div className={inputWrapperStyle}>
                        <AtSign size={20} className={iconStyle} />
                        <input 
                            type="text" 
                            placeholder={__('User ID (e.g. fan_id_123)')} 
                            value={data.unique_id}
                            className={inputStyle}
                            onChange={e => setData('unique_id', e.target.value)} 
                        />
                        <div className="mt-2 ml-4 flex flex-col gap-1">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                {__('This ID will be used for Group Order invitations')}
                            </p>
                            {errors.unique_id && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{errors.unique_id}</p>}
                        </div>
                    </div>

                    {/* Country */}
                    <div className={inputWrapperStyle}>
                        <Globe size={20} className={iconStyle} />
                        <select 
                            value={data.country_id} 
                            className={`${inputStyle} appearance-none`}
                            onChange={e => setData('country_id', e.target.value)}
                        >
                            <option value="">{__('Where do you live?')}</option>
                            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.country_id && <p className="text-red-500 text-[10px] font-black mt-2 uppercase tracking-widest ml-4">{errors.country_id}</p>}
                    </div>

                    {/* Email */}
                    <div className={inputWrapperStyle}>
                        <Mail size={20} className={iconStyle} />
                        <input 
                            type="email" 
                            placeholder={__('Email Address')} 
                            value={data.email}
                            className={inputStyle}
                            onChange={e => setData('email', e.target.value)} 
                        />
                        {errors.email && <p className="text-red-500 text-[10px] font-black mt-2 uppercase tracking-widest ml-4">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={inputWrapperStyle}>
                            <Lock size={20} className={iconStyle} />
                            <input 
                                type="password" 
                                placeholder={__('Password')} 
                                value={data.password}
                                className={inputStyle}
                                onChange={e => setData('password', e.target.value)} 
                            />
                        </div>
                        <div className={inputWrapperStyle}>
                            <Lock size={20} className={iconStyle} />
                            <input 
                                type="password" 
                                placeholder={__('Confirm')} 
                                value={data.password_confirmation}
                                className={inputStyle}
                                onChange={e => setData('password_confirmation', e.target.value)} 
                            />
                        </div>
                    </div>
                    {errors.password && <p className="text-red-500 text-[10px] font-black mt-2 uppercase tracking-widest ml-4">{errors.password}</p>}

                    <button 
                        disabled={processing} 
                        className="group w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] hover:bg-cyan-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-slate-200 mt-8"
                    >
                        {processing ? __('Processing...') : __('Join CirclePort')}
                        {!processing && <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-slate-400 font-bold text-sm">
                        {__('Already have an account?')}
                        <Link href={route('fan.login')} className="ml-2 text-slate-900 hover:text-cyan-600 underline decoration-2 underline-offset-4 transition-colors">
                            {__('Log in here')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}