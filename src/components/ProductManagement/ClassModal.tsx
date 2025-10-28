import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Class, BusinessPartner } from '../../types';

interface ClassModalProps {
  class: Class | null;
  partners: BusinessPartner[];
  onClose: () => void;
  onSave: (classData: Class) => void;
}

export default function ClassModal({ class: classData, partners, onClose, onSave }: ClassModalProps) {
  const [formData, setFormData] = useState<Omit<Class, 'id' | 'createdBy' | 'createdDate'>>({
    title: '',
    shortDescription: '',
    detailedDescription: '',
    focusArea: 'Body',
    subFocusArea: '',
    tags: [],
    serviceId: 'svc-001',
    recurrencePattern: '',
    mode: 'online',
    capacity: 20,
    providerId: '',
    centerId: undefined,
    gender: 'Any',
    ageGroup: 'Adult',
    geography: 'India',
    status: 'draft',
    subscriptionType: 'monthly',
    basePrice: 0,
    currency: 'INR',
  });

  useEffect(() => {
    if (classData) {
      setFormData({
        title: classData.title,
        shortDescription: classData.shortDescription,
        detailedDescription: classData.detailedDescription,
        focusArea: classData.focusArea,
        subFocusArea: classData.subFocusArea,
        tags: classData.tags,
        serviceId: classData.serviceId,
        recurrencePattern: classData.recurrencePattern,
        mode: classData.mode,
        capacity: classData.capacity,
        providerId: classData.providerId,
        centerId: classData.centerId,
        gender: classData.gender,
        ageGroup: classData.ageGroup,
        geography: classData.geography,
        status: classData.status,
        subscriptionType: classData.subscriptionType,
        basePrice: classData.basePrice,
        currency: classData.currency,
      });
    }
  }, [classData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.shortDescription || !formData.providerId) {
      alert('Please fill in all required fields');
      return;
    }

    const fullClassData: Class = {
      ...formData,
      id: classData?.id || '',
      createdBy: classData?.createdBy || 'usr-001',
      createdDate: classData?.createdDate || new Date().toISOString().split('T')[0],
    };

    onSave(fullClassData);
  };

  const providerPartners = partners.filter(p => p.type === 'provider' || p.type === 'dual');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {classData ? 'Edit Class' : 'Add New Class'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Class Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Short Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Recurrence Pattern <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.recurrencePattern}
                onChange={(e) => setFormData({ ...formData, recurrencePattern: e.target.value })}
                placeholder="e.g., Mon,Wed 6:00 PM - 7:00 PM"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mode <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Provider <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.providerId}
                onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select provider</option>
                {providerPartners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subscription Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subscriptionType}
                onChange={(e) => setFormData({ ...formData, subscriptionType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
                <option value="per-class">Per Class</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Base Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              {classData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
