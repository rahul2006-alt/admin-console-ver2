import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { BusinessPartner } from '../../types';
import partnersDataImport from '../../data/partners.json';
import PartnerModal from './PartnerModal';

export default function PartnersList() {
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<BusinessPartner | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setPartners(partnersDataImport as BusinessPartner[]);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'provider':
        return 'bg-blue-100 text-blue-700';
      case 'institution':
        return 'bg-green-100 text-green-700';
      case 'center':
        return 'bg-purple-100 text-purple-700';
      case 'dual':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getParentName = (parentId?: string) => {
    if (!parentId) return null;
    const parent = partners.find(p => p.id === parentId);
    return parent?.name;
  };

  const handleAdd = () => {
    setEditingPartner(null);
    setIsModalOpen(true);
  };

  const handleEdit = (partner: BusinessPartner) => {
    setEditingPartner(partner);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const hasChildren = partners.some(p => p.parentId === id);
    if (hasChildren) {
      alert('Cannot delete partner with associated centers. Please delete centers first.');
      return;
    }
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      setPartners(partners.filter(p => p.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const handleSave = (partner: BusinessPartner) => {
    if (editingPartner) {
      setPartners(partners.map(p => p.id === partner.id ? partner : p));
    } else {
      const newPartner = {
        ...partner,
        id: `bp-${Date.now()}`,
      };
      setPartners([...partners, newPartner]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Partners</h1>
          <p className="text-gray-600 mt-1">Manage providers, institutions, and centers</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Partner
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Partner Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Location
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
            {partners.map((partner) => (
              <tr key={partner.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-semibold text-gray-900">{partner.name}</div>
                    {partner.parentId && (
                      <div className="text-sm text-gray-600">
                        Parent: {getParentName(partner.parentId)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(partner.type)}`}>
                    {partner.type.charAt(0).toUpperCase() + partner.type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{partner.contactPerson}</div>
                    <div className="text-gray-600">{partner.contactEmail}</div>
                    <div className="text-gray-600">{partner.contactPhone}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div>{partner.city}, {partner.state}</div>
                  <div>{partner.country}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    partner.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(partner)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id)}
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
        <PartnerModal
          partner={editingPartner}
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
              Are you sure you want to delete this partner? This action cannot be undone.
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
