import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import FanLayout from '@/Layouts/FanLayout';
import GoCreateForm from '../../components/models/go/GoCreateForm/Index';

export default function Create() {
    const { language } = usePage().props;
    const __ = (key) => (language && language[key]) ? language[key] : key;

    return (
        <FanLayout>
            <Head title={`${__('Launch New Box')} - CirclePort`} />
            
            <div className="max-w-[1400px] mx-auto px-8 py-16">
                <GoCreateForm />
            </div>
        </FanLayout>
    );
}