import React, { useEffect } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { Brain } from 'lucide-react';

export default function Auth() {
    const location = useLocation();
    const isLogin = location.pathname === '/login';


    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="max-w-md w-full">
                <div className="flex justify-center mb-8">
                    <Brain className="h-12 w-12 text-emerald-600" />
                </div>
                <AuthForm type={isLogin ? 'login' : 'register'} />
            </div>
        </div>
    );
}