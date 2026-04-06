import React from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function Login() {
    const { language } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('fan.login.store'));
    };

    const inputWrapperStyle = "relative group";
    const iconStyle = "absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors";
    const inputStyle = "w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-cyan-500 focus:bg-white transition-all placeholder:text-slate-300";

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <Head title={__('Welcome Back!')} />
            
            <div className="w-full max-w-lg bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200 p-12 md:p-16 relative overflow-hidden">
                {/* 装飾用の背景アクセント */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-50 rounded-full -ml-16 -mt-16 opacity-50" />
                
                <div className="relative mb-12 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <Sparkles size={12} />
                        {__('Ready for more treasures?')}
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 leading-tight tracking-tighter">
                        {__('Welcome Back')}
                    </h1>
                    <p className="text-slate-400 font-bold mt-2 text-sm">
                        {__('Login to your passport to Japan\'s Indie Art')}
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-7">
                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">
                            {__('Email Address')}
                        </label>
                        <div className={inputWrapperStyle}>
                            <Mail size={20} className={iconStyle} />
                            <input 
                                type="email" 
                                placeholder="you@example.com"
                                value={data.email}
                                className={inputStyle}
                                onChange={e => setData('email', e.target.value)} 
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-[10px] font-black mt-2 uppercase tracking-widest ml-4">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center ml-4 pr-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {__('Password')}
                            </label>
                            <Link href="#" className="text-[10px] font-bold text-cyan-600 hover:text-slate-900 transition-colors uppercase tracking-widest">
                                {__('Forgot Password?')}
                            </Link>
                        </div>
                        <div className={inputWrapperStyle}>
                            <Lock size={20} className={iconStyle} />
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                value={data.password}
                                className={inputStyle}
                                onChange={e => setData('password', e.target.value)} 
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-[10px] font-black mt-2 uppercase tracking-widest ml-4">{errors.password}</p>}
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center ml-4">
                        <label className="flex items-center cursor-pointer group">
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    id="remember" 
                                    checked={data.remember}
                                    className="sr-only"
                                    onChange={e => setData('remember', e.target.checked)} 
                                />
                                <div className={`w-6 h-6 rounded-lg border-2 transition-all ${data.remember ? 'bg-cyan-500 border-cyan-500' : 'bg-slate-50 border-slate-200 group-hover:border-cyan-200'}`}>
                                    {data.remember && <ShieldCheck size={16} className="text-white absolute top-1 left-1" />}
                                </div>
                            </div>
                            <span className="ml-3 text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
                                {__('Remember Me')}
                            </span>
                        </label>
                    </div>

                    <button 
                        disabled={processing} 
                        className="group w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] hover:bg-cyan-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-slate-200 mt-4"
                    >
                        {processing ? __('Processing...') : __('Log In')}
                        {!processing && <LogIn size={24} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <div className="mt-12 pt-10 border-t border-slate-100 text-center">
                    <p className="text-slate-400 font-bold text-sm">
                        {__('New to CirclePort?')}
                        <Link href={route('fan.register')} className="ml-2 text-slate-900 hover:text-cyan-600 underline decoration-2 underline-offset-4 transition-colors">
                            {__('Create Account!')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}