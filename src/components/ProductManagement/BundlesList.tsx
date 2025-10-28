import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
import { Bundle, BusinessPartner } from '../../types';
import partnersDataImport from '../../data/partners.json';
import BundleModal from './BundleModal';
import { supabase } from '../../lib/supabase';

export default function BundlesList() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPartners(partnersDataImport as BusinessPartner[]);
    loadBundles();
  }, []);

  const loadBundles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedBundles: Bundle[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        shortDescription: row.short_description,
        detailedDescription: row.detailed_description,
        focusArea: row.focus_area,
        subFocusArea: row.sub_focus_area,
        tags: row.tags || [],
        bundleType: row.bundle_type,
        includedPrograms: row.included_programs || [],
        includedClasses: row.included_classes || [],
        providerId: row.provider_id,
        gender: row.gender,
        ageGroup: row.age_group,
        geography: row.geography,
        status: row.status,
        bundlePrice: row.bundle_price,
        discountPercent: row.discount_percent,
        originalPrice: row.original_price,
        currency: row.currency,
        validityDays: row.validity_days,
        createdBy: row.created_by,
        createdDate: row.created_at?.split('T')[0] || '',
      }));

      setBundles(mappedBundles);
    } catch (error) {
      console.error('Error loading bundles:', error);
      alert('Failed to load bundles');
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

  const getProviderName = (providerId: string) => {
    const provider = partners.find(p => p.id === providerId);
    return provider?.name || 'Unknown';
  };

  const handleSave = async (bundle: Bundle) => {
    try {
      const dataToSave = {
        title: bundle.title,
        short_description: bundle.shortDescription,
        detailed_description: bundle.detailedDescription,
        focus_area: bundle.focusArea,
        sub_focus_area: bundle.subFocusArea,
        tags: bundle.tags,
        bundle_type: bundle.bundleType,
        included_programs: bundle.includedPrograms,
        included_classes: bundle.includedClasses,
        provider_id: bundle.providerId,
        gender: bundle.gender,
        age_group: bundle.ageGroup,
        geography: bundle.geography,
        status: bundle.status,
        bundle_price: bundle.bundlePrice,
        discount_percent: bundle.discountPercent,
        original_price: bundle.originalPrice,
        currency: bundle.currency,
        validity_days: bundle.validityDays,
        created_by: bundle.createdBy || 'usr-001',
        updated_at: new Date().toISOString(),
      };

      if (editingBundle) {
        const { error } = await supabase
          .from('bundles')
          .update(dataToSave)
          .eq('id', bundle.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('bundles').insert([dataToSave]);
        if (error) throw error;
      }

      await loadBundles();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving bundle:', error);
      alert('Failed to save bundle');
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      const { error } = await supabase.from('bundles').delete().eq('id', deleteConfirm);
      if (error) throw error;
      setBundles(bundles.filter(b => b.id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting bundle:', error);
      alert('Failed to delete bundle');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading bundles...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bundles</h1>
          <p className="text-gray-600 mt-1">Grouped product offerings</p>
        </div>
        <button
          onClick={() => { setEditingBundle(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Bundle
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bundle Title</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Included Items</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Validity</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bundles.map((bundle) => (
              <tr key={bundle.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-semibold text-gray-900">{bundle.title}</div>
                      <div className="text-xs text-gray-500">{bundle.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {bundle.includedPrograms.length} Programs, {bundle.includedClasses.length} Classes
                </td>
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">�{bundle.bundlePrice}</div>
                  <div className="text-xs text-gray-500">({bundle.discountPercent}% off)</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {bundle.validityDays} days
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">{getProviderName(bundle.providerId)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bundle.status)}`}>
                    {bundle.status.charAt(0).toUpperCase() + bundle.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setEditingBundle(bundle); setIsModalOpen(true); }}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(bundle.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <BundleModal
          bundle={editingBundle}
          partners={partners}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this bundle?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
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
