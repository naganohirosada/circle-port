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
        post(route('fan.login.store'));
    };

    return (
        <div className="min-h-screen bg-[#FDF2F8] flex items-center justify-center p-6">
            <Head title="Welcome Back! (^_^)" />
            
            <div className="w-full max-w-md bg-white border-[6px] border-indigo-600 rounded-[3rem] shadow-[12px_12px_0px_#A5B4FC] p-10 relative">
                {/* 装飾デコ */}
                <div className="absolute -top-6 -left-6 text-6xl transform -rotate-12 animate-bounce">♥</div>
                <div className="absolute -bottom-6 -right-6 text-6xl transform rotate-12">★</div>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-indigo-600 tracking-tighter">WELCOME BACK!</h1>
                    <p className="font-bold text-pink-500 mt-2 italic">Ready to find more treasures? ✨</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-2 ml-2">Email Address</label>
                        <input type="email" value={data.email}
                            className="w-full px-6 py-4 bg-indigo-50 border-4 border-indigo-100 rounded-2xl font-bold focus:border-indigo-600 focus:ring-0 transition-all"
                            placeholder="you@example.com"
                            onChange={e => setData('email', e.target.value)} />
                        {errors.email && <div className="text-pink-500 text-xs mt-2 font-bold">{errors.email}</div>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2 ml-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-indigo-300">Password</label>
                            <Link href="#" className="text-xs font-bold text-indigo-400 hover:text-pink-500">Forgot? (T_T)</Link>
                        </div>
                        <input type="password" value={data.password}
                            className="w-full px-6 py-4 bg-indigo-50 border-4 border-indigo-100 rounded-2xl font-bold focus:border-indigo-600 focus:ring-0 transition-all"
                            onChange={e => setData('password', e.target.value)} />
                    </div>

                    <div className="flex items-center ml-2">
                        <input type="checkbox" id="remember" checked={data.remember}
                            className="w-6 h-6 rounded-lg border-4 border-indigo-100 text-indigo-600 focus:ring-0"
                            onChange={e => setData('remember', e.target.checked)} />
                        <label htmlFor="remember" className="ml-3 text-sm font-black text-indigo-300">Remember Me</label>
                    </div>

                    <button disabled={processing} className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-2xl hover:bg-pink-500 hover:shadow-[6px_6px_0px_#F9A8D4] transition-all transform active:scale-95 shadow-[4px_4px_0px_#4338CA]">
                        LOG IN! 🚀
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t-4 border-indigo-50 text-center">
                    <p className="text-sm font-bold text-indigo-300">
                        New here? 
                        <Link href={route('fan.register')} className="ml-2 text-indigo-600 hover:text-pink-500 underline decoration-4 underline-offset-4">Create Account! &raquo;</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}