import { useNavigate } from 'react-router-dom';
import { Brain, User, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuthContext } from '../authContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, isLoading, logout } = useAuthContext();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (isLoading) {
        return (
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                            <div className="ml-2 h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </nav>
        );
    }

    const handleSignOut = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Title */}
                    <div
                        className="flex items-center cursor-pointer group transition-all duration-200 hover:scale-105"
                        onClick={() => navigate('/')}
                    >
                        <div className="p-1 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <span className="ml-3 text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            NutriAI
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                {/* Dashboard Button */}
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </button>

                                {/* User Info */}
                                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-full border cursor-pointer hover:bg-gray-100 transition-all duration-200"
                                    onClick={() => { navigate("/profile") }}
                                >
                                    <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full">
                                        <User className="h-4 w-4 text-emerald-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {user.name || user.email || 'User'}
                                    </span>
                                </div>
                                {
                                    user.role == "ADMIN" ?
                                        (
                                            <button
                                                onClick={() => navigate('/admindashboard')}
                                                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                            >
                                                <LayoutDashboard className="h-4 w-4" />
                                                <span>Admin Panel</span>
                                            </button>
                                        )
                                        :
                                        ""
                                }

                                {/* Sign Out Button */}
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign Out</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                            >
                                Sign In
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-3">
                            {user ? (
                                <>
                                    {/* Mobile Dashboard Button */}
                                    <button
                                        onClick={() => {
                                            navigate('/dashboard');
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all duration-200"
                                    >
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </button>


                                    {
                                        user.role == "ADMIN" ?
                                            (
                                                <button
                                                    onClick={() => {
                                                        navigate('/admindashboard')
                                                        setIsMobileMenuOpen(false);

                                                    }}
                                                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all duration-200"
                                                >
                                                    <LayoutDashboard className="h-4 w-4" />
                                                    <span>Admin Panel</span>
                                                </button>
                                            )
                                            :
                                            ""
                                    }


                                    {/* Mobile User Info */}
                                    <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200"
                                        onClick={() => {
                                            navigate("/profile");
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full">
                                            <User className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {user.name || user.email || 'User'}
                                        </span>
                                    </div>

                                    {/* Mobile Sign Out Button */}
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Sign Out</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        navigate('/login');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-md"
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;