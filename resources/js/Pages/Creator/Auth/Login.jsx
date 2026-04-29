// resources/js/Pages/Creator/Auth/Login.jsx

import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('creator.login.store'));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
            <Head title="クリエイターログイン" />
            
            <div className="w-full max-w-md">
                {/* ヘッダー */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-3xl shadow-xl mb-6 transform -rotate-6">
                        <LogIn className="text-cyan-400" size={32} />
                    </div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
                        Studio Login
                    </h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                        クリエイター専用管理パネル
                    </p>
                </div>

                {/* ログインフォーム */}
                <form onSubmit={submit} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 space-y-8">
                    
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest ml-1">
                            <Mail size={14} className="text-cyan-400" /> メールアドレス
                        </label>
                        <input 
                            type="email" 
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                            placeholder="mail@example.com"
                        />
                        {errors.email && <p className="text-rose-500 text-[10px] font-black italic ml-1">{errors.email}</p>}
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 tracking-widest ml-1">
                            <Lock size={14} className="text-cyan-400" /> パスワード
                        </label>
                        <input 
                            type="password" 
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl font-bold py-4 px-6 focus:bg-white focus:border-cyan-400 focus:ring-0 transition-all"
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-rose-500 text-[10px] font-black italic ml-1">{errors.password}</p>}
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit"
                            disabled={processing}
                            className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-sm transition-all flex items-center justify-center gap-3 shadow-xl ${processing ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white hover:bg-cyan-500 active:scale-[0.98]'}`}
                        >
                            {processing ? '接続中...' : 'スタジオに入る'}
                            <ArrowRight size={18} />
                        </button>
                    </div>

                    {/* 新規登録へのリンク */}
                    <div className="text-center pt-2">
                        <Link 
                            href={route('creator.register')} 
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-500 transition-colors flex flex-col items-center gap-2"
                        >
                            アカウントをお持ちでないですか？
                            <span className="text-slate-900 underline decoration-cyan-400 decoration-2 underline-offset-4">サークル新規登録はこちら</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}