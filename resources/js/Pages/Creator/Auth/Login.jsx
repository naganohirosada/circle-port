import React from 'react';
import { useForm, Head, Link } from '@inertiajs/react';

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
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
            <Head title="Creator Login" />
            
            <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border-4 border-slate-900">
                {/* 左側：ビジュアルエリア */}
                <div className="md:w-1/2 bg-slate-900 p-12 text-white flex flex-col justify-between relative">
                    <div className="z-10">
                        <h2 className="text-4xl font-black leading-tight mb-6 text-cyan-400">CONNECT TO<br />WORLDWIDE FANS.</h2>
                        <p className="text-slate-400 font-bold">CirclePort Studioへようこそ！あなたの作品を世界へ届ける準備はできましたか？</p>
                    </div>
                    <div className="text-8xl absolute bottom-4 right-4 opacity-20 select-none">🎨</div>
                </div>

                {/* 右側：フォームエリア */}
                <div className="md:w-1/2 p-12">
                    <h1 className="text-3xl font-black text-slate-800 mb-8 underline decoration-cyan-400 decoration-8 underline-offset-4">LOGIN</h1>
                    
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-black text-slate-500 mb-2 uppercase italic">Studio ID (Email)</label>
                            <input type="email" value={data.email}
                                className="w-full border-4 border-slate-100 rounded-2xl py-4 px-6 focus:border-cyan-500 ring-0 transition-all font-bold"
                                onChange={e => setData('email', e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-black text-slate-500 mb-2 uppercase italic">Password</label>
                            <input type="password" value={data.password}
                                className="w-full border-4 border-slate-100 rounded-2xl py-4 px-6 focus:border-cyan-500 ring-0 transition-all font-bold"
                                onChange={e => setData('password', e.target.value)} />
                        </div>

                        <button disabled={processing} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-cyan-500 hover:shadow-[8px_8px_0px_#A5F3FC] transition-all transform active:scale-95">
                            ENTER STUDIO →
                        </button>
                    </form>

                    <div className="mt-10 pt-6 border-t-2 border-slate-50">
                        <Link href={route('creator.register')} className="text-cyan-600 font-black hover:underline">新規サークル登録はこちら &raquo;</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}