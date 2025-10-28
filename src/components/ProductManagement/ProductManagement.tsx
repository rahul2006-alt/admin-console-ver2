import { useState } from 'react';
import { ArrowLeft, Calendar, Users, Layers } from 'lucide-react';
import ProgramsList from './ProgramsList';
import ClassesList from './ClassesList';
import BundlesList from './BundlesList';

interface ProductManagementProps {
  onNavigate: (module: string) => void;
}

type ActiveView = 'programs' | 'classes' | 'bundles';

export default function ProductManagement({ onNavigate }: ProductManagementProps) {
  const [activeView, setActiveView] = useState<ActiveView>('programs');

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

          <h2 className="text-lg font-bold text-gray-900 mb-6">Product Management</h2>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveView('programs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'programs'
                  ? 'bg-purple-50 text-purple-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Programs</span>
            </button>

            <button
              onClick={() => setActiveView('classes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'classes'
                  ? 'bg-purple-50 text-purple-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>Classes</span>
            </button>

            <button
              onClick={() => setActiveView('bundles')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'bundles'
                  ? 'bg-purple-50 text-purple-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Layers className="w-5 h-5" />
              <span>Bundles</span>
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1">
        {activeView === 'programs' && <ProgramsList />}
        {activeView === 'classes' && <ClassesList />}
        {activeView === 'bundles' && <BundlesList />}
      </main>
    </div>
  );
}
