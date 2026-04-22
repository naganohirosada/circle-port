import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <AdminLayout user={auth.user} header="ダッシュボード">
            <Head title="Admin Dashboard" />
            <div className="max-w-4xl mx-auto mb-10">
                <BarcodeScanner />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <p className="text-sm text-gray-500">未検品の荷物</p>
                    <p className="text-3xl font-bold mt-1">15 件</p>
                </div>
            </div>
        </AdminLayout>
    );
}