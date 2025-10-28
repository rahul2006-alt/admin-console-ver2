import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';
import { Service, BusinessPartner } from '../../types';
import partnersDataImport from '../../data/partners.json';
import ServiceModal from './ServiceModal';
import { supabase } from '../../lib/supabase';

export default function ServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPartners(partnersDataImport as BusinessPartner[]);
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedServices: Service[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        shortDescription: row.short_description,
        detailedDescription: row.detailed_description,
        focusArea: row.focus_area,
        subFocusArea: row.sub_focus_area,
        tags: row.tags || [],
        serviceType: row.service_type,
        deliveryChannel: row.delivery_channel,
        defaultDuration: row.default_duration,
        defaultCapacity: row.default_capacity,
        qualifiedRoles: row.qualified_roles,
        providerId: row.provider_id,
        centerId: row.center_id,
        gender: row.gender,
        ageGroup: row.age_group,
        geography: row.geography,
        status: row.status,
        basePrice: row.base_price,
        currency: row.currency,
        createdBy: row.created_by,
        createdDate: row.created_at?.split('T')[0] || '',
      }));

      setServices(mappedServices);
    } catch (error) {
      console.error('Error loading services:', error);
      alert('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'defined':
        return 'bg-gray-100 text-gray-700';
      case 'validated':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-blue-100 text-blue-700';
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'retired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'tele-consult':
        return 'bg-blue-100 text-blue-700';
      case 'in-person':
        return 'bg-green-100 text-green-700';
      case 'hybrid':
        return 'bg-purple-100 text-purple-700';
      case 'group-class':
        return 'bg-orange-100 text-orange-700';
      case 'workshop':
        return 'bg-pink-100 text-pink-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getProviderName = (providerId: string) => {
    const provider = partners.find(p => p.id === providerId);
    return provider?.name || 'Unknown';
  };

  const handleAdd = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', deleteConfirm);

      if (error) throw error;

      setServices(services.filter(s => s.id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const handleSave = async (service: Service) => {
    try {
      const serviceData = {
        title: service.title,
        short_description: service.shortDescription,
        detailed_description: service.detailedDescription,
        focus_area: service.focusArea,
        sub_focus_area: service.subFocusArea,
        tags: service.tags,
        service_type: service.serviceType,
        delivery_channel: service.deliveryChannel,
        default_duration: service.defaultDuration,
        default_capacity: service.defaultCapacity,
        qualified_roles: service.qualifiedRoles,
        provider_id: service.providerId,
        center_id: service.centerId || null,
        gender: service.gender,
        age_group: service.ageGroup,
        geography: service.geography,
        status: service.status,
        base_price: service.basePrice,
        currency: service.currency,
        created_by: service.createdBy || 'usr-001',
        updated_at: new Date().toISOString(),
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);

        if (error) throw error;
      }

      await loadServices();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">Manage service templates and offerings</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Service Title
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
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-semibold text-gray-900">{service.title}</div>
                      <div className="text-xs text-gray-500">{service.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{service.focusArea}</div>
                    <div className="text-sm text-gray-600">{service.subFocusArea}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getServiceTypeColor(service.serviceType)}`}>
                    {service.serviceType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {service.defaultDuration} min
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {getProviderName(service.providerId)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(service.status)}`}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
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
        <ServiceModal
          service={editingService}
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
              Are you sure you want to delete this service? This action cannot be undone.
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
