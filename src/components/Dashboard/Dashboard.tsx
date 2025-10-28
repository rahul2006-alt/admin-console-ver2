import { useState, useEffect } from 'react';
import { Users, BookOpen, Package, UserCircle } from 'lucide-react';
import tenantData from '../../data/tenant.json';
import partnersData from '../../data/partners.json';
import usersData from '../../data/users.json';
import { supabase } from '../../lib/supabase';

interface DashboardProps {
  onNavigate: (module: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [sessionCount, setSessionCount] = useState(0);
  const [serviceCount, setServiceCount] = useState(0);
  const [programCount, setProgramCount] = useState(0);
  const [classCount, setClassCount] = useState(0);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const [sessionsResult, servicesResult, programsResult, classesResult] = await Promise.all([
        supabase.from('sessions').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('programs').select('*', { count: 'exact', head: true }),
        supabase.from('classes').select('*', { count: 'exact', head: true })
      ]);

      setSessionCount(sessionsResult.count || 0);
      setServiceCount(servicesResult.count || 0);
      setProgramCount(programsResult.count || 0);
      setClassCount(classesResult.count || 0);
    } catch (error) {
      console.error('Error loading counts:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{tenantData.name}</h1>
            <p className="text-sm text-gray-600">{tenantData.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Admin User</span>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Admin Console</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => onNavigate('user-management')}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 p-8 text-left group hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600 mb-4">Manage business partners and users</p>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-900">{partnersData.length}</span>
                <span className="text-gray-600"> Partners</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{usersData.length}</span>
                <span className="text-gray-600"> Users</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('content-service')}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 p-8 text-left group hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Content & Service</h3>
            <p className="text-gray-600 mb-4">Sessions and services management</p>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-900">{sessionCount}</span>
                <span className="text-gray-600"> Sessions</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{serviceCount}</span>
                <span className="text-gray-600"> Services</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('product-management')}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-200 p-8 text-left group hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Product Management</h3>
            <p className="text-gray-600 mb-4">Programs, classes, and bundles</p>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-900">{programCount}</span>
                <span className="text-gray-600"> Programs</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">{classCount}</span>
                <span className="text-gray-600"> Classes</span>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
