import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ProgramItemData, Session, Service } from '../../types';
import { supabase } from '../../lib/supabase';

interface ProgramItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<ProgramItemData, 'id' | 'planId' | 'createdBy' | 'createdDate'>) => void;
  programDuration: number;
  existingItem?: ProgramItemData;
}

export default function ProgramItemForm({
  isOpen,
  onClose,
  onSave,
  programDuration,
  existingItem,
}: ProgramItemFormProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({
    assetType: existingItem?.assetType || 'session' as 'session' | 'service',
    assetId: existingItem?.assetId || '',
    dayNo: existingItem?.dayNo || 1,
    sequenceNo: existingItem?.sequenceNo || 1,
    title: existingItem?.title || '',
    isOptional: existingItem?.isOptional || false,
    completionRequired: existingItem?.completionRequired ?? true,
  });

  useEffect(() => {
    if (isOpen) {
      loadAssets();
    }
  }, [isOpen]);

  const loadAssets = async () => {
    try {
      const [sessionsResult, servicesResult] = await Promise.all([
        supabase.from('sessions').select('*').order('title'),
        supabase.from('services').select('*').order('title'),
      ]);

      if (sessionsResult.data) {
        setSessions(sessionsResult.data.map(row => ({
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
        })));
      }

      if (servicesResult.data) {
        setServices(servicesResult.data.map(row => ({
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
        })));
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.assetId) {
      alert('Please select a session or service');
      return;
    }

    if (formData.dayNo < 1 || formData.dayNo > programDuration) {
      alert(`Day number must be between 1 and ${programDuration}`);
      return;
    }

    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const availableAssets = formData.assetType === 'session' ? sessions : services;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">
            {existingItem ? 'Edit' : 'Add'} Program Item
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Asset Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.assetType}
              onChange={(e) => setFormData({ ...formData, assetType: e.target.value as 'session' | 'service', assetId: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="session">Session</option>
              <option value="service">Service</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {formData.assetType === 'session' ? 'Session' : 'Service'} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.assetId}
              onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select...</option>
              {availableAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Day Number <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={programDuration}
                value={formData.dayNo}
                onChange={(e) => setFormData({ ...formData, dayNo: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">1-{programDuration}</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sequence <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.sequenceNo}
                onChange={(e) => setFormData({ ...formData, sequenceNo: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Day 7: Mid-Point Assessment"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isOptional}
                onChange={(e) => setFormData({ ...formData, isOptional: e.target.checked })}
                className="mr-2 w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-gray-700">Optional Item</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.completionRequired}
                onChange={(e) => setFormData({ ...formData, completionRequired: e.target.checked })}
                className="mr-2 w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-gray-700">Completion Required</span>
            </label>
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
              {existingItem ? 'Update' : 'Add'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
