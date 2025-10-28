import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Video } from 'lucide-react';
import { Session, BusinessPartner } from '../../types';
import partnersDataImport from '../../data/partners.json';
import SessionModal from './SessionModal';
import { supabase } from '../../lib/supabase';

export default function SessionsList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPartners(partnersDataImport as BusinessPartner[]);
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedSessions: Session[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        shortDescription: row.short_description,
        detailedDescription: row.detailed_description,
        focusArea: row.focus_area,
        subFocusArea: row.sub_focus_area,
        tags: row.tags || [],
        contentType: row.content_type,
        duration: row.duration,
        language: row.language,
        providerId: row.provider_id,
        fileUrl: row.file_url,
        thumbnailUrl: row.thumbnail_url,
        gender: row.gender,
        ageGroup: row.age_group,
        geography: row.geography,
        status: row.status,
        isFree: row.is_free,
        basePrice: row.base_price,
        currency: row.currency,
        createdBy: row.created_by,
        createdDate: row.created_at?.split('T')[0] || '',
      }));

      setSessions(mappedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      alert('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700';
      case 'review':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-blue-100 text-blue-700';
      case 'published':
        return 'bg-green-100 text-green-700';
      case 'archived':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-purple-100 text-purple-700';
      case 'audio':
        return 'bg-blue-100 text-blue-700';
      case 'text':
        return 'bg-green-100 text-green-700';
      case 'interactive':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getProviderName = (providerId: string) => {
    const provider = partners.find(p => p.id === providerId);
    return provider?.name || 'Unknown';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const handleAdd = () => {
    setEditingSession(null);
    setIsModalOpen(true);
  };

  const handleEdit = (session: Session) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', deleteConfirm);

      if (error) throw error;

      setSessions(sessions.filter(s => s.id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session');
    }
  };

  const handleSave = async (session: Session) => {
    try {
      const sessionData = {
        title: session.title,
        short_description: session.shortDescription,
        detailed_description: session.detailedDescription,
        focus_area: session.focusArea,
        sub_focus_area: session.subFocusArea,
        tags: session.tags,
        content_type: session.contentType,
        duration: session.duration,
        language: session.language,
        provider_id: session.providerId,
        file_url: session.fileUrl,
        thumbnail_url: session.thumbnailUrl || null,
        gender: session.gender,
        age_group: session.ageGroup,
        geography: session.geography,
        status: session.status,
        is_free: session.isFree,
        base_price: session.basePrice || null,
        currency: session.currency,
        created_by: session.createdBy || 'usr-001',
        updated_at: new Date().toISOString(),
      };

      if (editingSession) {
        const { error } = await supabase
          .from('sessions')
          .update(sessionData)
          .eq('id', session.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sessions')
          .insert([sessionData]);

        if (error) throw error;
      }

      await loadSessions();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving session:', error);
      alert('Failed to save session');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-600 mt-1">Manage digital content and media assets</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Session
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Session Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Focus Area
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-semibold text-gray-900">{session.title}</div>
                      <div className="text-xs text-gray-500">{session.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{session.focusArea}</div>
                    <div className="text-sm text-gray-600">{session.subFocusArea}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getContentTypeColor(session.contentType)}`}>
                    {session.contentType.charAt(0).toUpperCase() + session.contentType.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {formatDuration(session.duration)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {getProviderName(session.providerId)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(session.status)}`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(session)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(session.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <SessionModal
          session={editingSession}
          partners={partners}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this session? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
