import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Bundle, BusinessPartner } from '../../types';

interface BundleModalProps {
  bundle: Bundle | null;
  partners: BusinessPartner[];
  onClose: () => void;
  onSave: (bundle: Bundle) => void;
}

export default function BundleModal({ bundle, partners, onClose, onSave }: BundleModalProps) {
  const [formData, setFormData] = useState<Omit<Bundle, 'id' | 'createdBy' | 'createdDate'>>({
    title: '',
    shortDescription: '',
    detailedDescription: '',
    focusArea: 'General Wellness',
    subFocusArea: '',
    tags: [],
    bundleType: 'mixed',
    includedPrograms: [],
    includedClasses: [],
    providerId: '',
    gender: 'Any',
    ageGroup: 'Adult',
    geography: 'Global',
    status: 'draft',
    bundlePrice: 0,
    discountPercent: 0,
    originalPrice: 0,
    currency: 'INR',
    validityDays: 90,
  });

  useEffect(() => {
    if (bundle) {
      setFormData({
        title: bundle.title,
        shortDescription: bundle.shortDescription,
        detailedDescription: bundle.detailedDescription,
        focusArea: bundle.focusArea,
        subFocusArea: bundle.subFocusArea,
        tags: bundle.tags,
        bundleType: bundle.bundleType,
        includedPrograms: bundle.includedPrograms,
        includedClasses: bundle.includedClasses,
        providerId: bundle.providerId,
        gender: bundle.gender,
        ageGroup: bundle.ageGroup,
        geography: bundle.geography,
        status: bundle.status,
        bundlePrice: bundle.bundlePrice,
        discountPercent: bundle.discountPercent,
        originalPrice: bundle.originalPrice,
        currency: bundle.currency,
        validityDays: bundle.validityDays,
      });
    }
  }, [bundle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.shortDescription || !formData.providerId) {
      alert('Please fill in all required fields');
      return;
    }

    const fullBundle: Bundle = {
      ...formData,
      id: bundle?.id || '',
      createdBy: bundle?.createdBy || 'usr-001',
      createdDate: bundle?.createdDate || new Date().toISOString().split('T')[0],
    };

    onSave(fullBundle);
  };

  const providerPartners = partners.filter(p => p.type === 'provider' || p.type === 'dual');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {bundle ? 'Edit Bundle' : 'Add New Bundle'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bundle Title <span className="text-red-500">*</span>
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
                Bundle Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.bundleType}
                onChange={(e) => setFormData({ ...formData, bundleType: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="programs">Programs Only</option>
                <option value="classes">Classes Only</option>
                <option value="mixed">Mixed</option>
              </select>
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

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Original Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discount % <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.discountPercent}
                onChange={(e) => {
                  const discount = parseFloat(e.target.value) || 0;
                  const bundlePrice = formData.originalPrice * (1 - discount / 100);
                  setFormData({ ...formData, discountPercent: discount, bundlePrice });
                }}
                min="0"
                max="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bundle Price
              </label>
              <input
                type="number"
                value={formData.bundlePrice}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Validity Days <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.validityDays}
              onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 90 })}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
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
              {bundle ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
