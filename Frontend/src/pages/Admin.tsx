import React, { useEffect, useState } from 'react';
// import { supabase } from '../lib/supabase';
// import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  created_at: string;
}

export default function Admin() {
  // const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   if (isAdmin) {
  //     fetchUsers();
  //   }
  // }, []);

  // const fetchUsers = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('users')
  //       .select('*')
  //       .order('created_at', { ascending: false });

  //     if (error) throw error;
  //     setUsers(data || []);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to fetch users');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // if (!user || !isAdmin) {
  //   return <Navigate to="/login\" replace />;
  // }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Admin Dashboard</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {users.map((user) => (
                <li key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}