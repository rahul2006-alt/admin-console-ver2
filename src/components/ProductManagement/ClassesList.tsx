import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { Class, BusinessPartner } from '../../types';
import partnersDataImport from '../../data/partners.json';
import ClassModal from './ClassModal';
import { supabase } from '../../lib/supabase';

export default function ClassesList() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPartners(partnersDataImport as BusinessPartner[]);
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedClasses: Class[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        shortDescription: row.short_description,
        detailedDescription: row.detailed_description,
        focusArea: row.focus_area,
        subFocusArea: row.sub_focus_area,
        tags: row.tags || [],
        serviceId: row.service_id,
        recurrencePattern: row.recurrence_pattern,
        mode: row.mode,
        capacity: row.capacity,
        providerId: row.provider_id,
        centerId: row.center_id,
        gender: row.gender,
        ageGroup: row.age_group,
        geography: row.geography,
        status: row.status,
        subscriptionType: row.subscription_type,
        basePrice: row.base_price,
        currency: row.currency,
        createdBy: row.created_by,
        createdDate: row.created_at?.split('T')[0] || '',
      }));

      setClasses(mappedClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
      alert('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'published': return 'bg-green-100 text-green-700';
      case 'archived': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'online': return 'bg-blue-100 text-blue-700';
      case 'offline': return 'bg-green-100 text-green-700';
      case 'hybrid': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getProviderName = (providerId: string) => {
    const provider = partners.find(p => p.id === providerId);
    return provider?.name || 'Unknown';
  };

  const handleSave = async (classData: Class) => {
    try {
      const dataToSave = {
        title: classData.title,
        short_description: classData.shortDescription,
        detailed_description: classData.detailedDescription,
        focus_area: classData.focusArea,
        sub_focus_area: classData.subFocusArea,
        tags: classData.tags,
        service_id: classData.serviceId,
        recurrence_pattern: classData.recurrencePattern,
        mode: classData.mode,
        capacity: classData.capacity,
        provider_id: classData.providerId,
        center_id: classData.centerId || null,
        gender: classData.gender,
        age_group: classData.ageGroup,
        geography: classData.geography,
        status: classData.status,
        subscription_type: classData.subscriptionType,
        base_price: classData.basePrice,
        currency: classData.currency,
        created_by: classData.createdBy || 'usr-001',
        updated_at: new Date().toISOString(),
      };

      if (editingClass) {
        const { error } = await supabase
          .from('classes')
          .update(dataToSave)
          .eq('id', classData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('classes').insert([dataToSave]);
        if (error) throw error;
      }

      await loadClasses();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Failed to save class');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const { error } = await supabase.from('classes').delete().eq('id', deleteConfirm);
      if (error) throw error;
      setClasses(classes.filter(c => c.id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class');
    }
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center"><div className="text-gray-600">Loading classes...</div></div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600 mt-1">Recurring service offerings</p>
        </div>
        <button
          onClick={() => { setEditingClass(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Class
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Class Title</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Schedule</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mode</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-semibold text-gray-900">{cls.title}</div>
                      <div className="text-xs text-gray-500">{cls.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{cls.recurrencePattern}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getModeColor(cls.mode)}`}>
                    {cls.mode.charAt(0).toUpperCase() + cls.mode.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">₹{cls.basePrice}</div>
                  <div className="text-xs text-gray-500">/{cls.subscriptionType}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{getProviderName(cls.providerId)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(cls.status)}`}>
                    {cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditingClass(cls); setIsModalOpen(true); }} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteConfirm(cls.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && <ClassModal class={editingClass} partners={partners} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this class?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
