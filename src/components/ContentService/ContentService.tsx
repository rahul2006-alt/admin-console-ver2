import { useState } from 'react';
import { ArrowLeft, Video, Briefcase } from 'lucide-react';
import SessionsList from './SessionsList';
import ServicesList from './ServicesList';

interface ContentServiceProps {
  onNavigate: (module: string) => void;
}

type ActiveView = 'sessions' | 'services';

export default function ContentService({ onNavigate }: ContentServiceProps) {
  const [activeView, setActiveView] = useState<ActiveView>('sessions');

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

          <h2 className="text-lg font-bold text-gray-900 mb-6">Content & Service</h2>

          <nav className="space-y-2">
            <button
              onClick={() => setActiveView('sessions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'sessions'
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Video className="w-5 h-5" />
              <span>Sessions</span>
            </button>

            <button
              onClick={() => setActiveView('services')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeView === 'services'
                  ? 'bg-green-50 text-green-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              <span>Services</span>
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1">
        {activeView === 'sessions' ? <SessionsList /> : <ServicesList />}
      </main>
    </div>
  );
}
