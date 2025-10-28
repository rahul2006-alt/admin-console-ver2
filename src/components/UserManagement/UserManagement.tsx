import { useState } from 'react';
import { ArrowLeft, Plus, Users, Building2 } from 'lucide-react';
import PartnersList from './PartnersList';
import UsersList from './UsersList';

interface UserManagementProps {
  onNavigate: (module: string) => void;
}

type ActiveView = 'partners' | 'users';

export default function UserManagement({ onNavigate }: UserManagementProps) {
  const [activeView, setActiveView] = useState<ActiveView>('partners');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>

          <h2 className="text-lg font-bold text-gray-900 mb-6">User Management</h2>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveView('partners')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'partners'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>Business Partners</span>
            </button>

            <button
              onClick={() => setActiveView('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'users'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Users</span>
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1">
        {activeView === 'partners' ? <PartnersList /> : <UsersList />}
      </main>
    </div>
  );
}
