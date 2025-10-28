import { useState, useEffect } from 'react';
import { X, Plus, XCircle, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Program, BusinessPartner, FocusArea, ProgramType, ProgramStatus, ProgramItemData, Session, Service } from '../../types';
import { focusAreas, subFocusAreas } from '../../constants/contentService';
import { programTypes, productStatuses } from '../../constants/productManagement';
import { getProgramItems } from '../../utils/programHelpers';
import ProgramItemForm from './ProgramItemForm';
import { supabase } from '../../lib/supabase';

interface ProgramModalProps {
  program: Program | null;
  partners: BusinessPartner[];
  onClose: () => void;
  onSave: (program: Program, items: Omit<ProgramItemData, 'id' | 'planId' | 'createdBy' | 'createdDate'>[]) => void;
}

export default function ProgramModal({ program, partners, onClose, onSave }: ProgramModalProps) {
  const [formData, setFormData] = useState<Omit<Program, 'id' | 'createdBy' | 'createdDate'>>({
    title: '',
    shortDescription: '',
    detailedDescription: '',
    focusArea: 'Mind',
    subFocusArea: '',
    tags: [],
    duration: 7,
    programType: 'sequential',
    providerId: '',
    gender: 'Any',
    ageGroup: 'Adult',
    geography: 'Global',
    status: 'draft',
    basePrice: 0,
    offerPrice: undefined,
    currency: 'INR',
    items: [],
  });

  const [newTag, setNewTag] = useState('');
  const [builderItems, setBuilderItems] = useState<Omit<ProgramItemData, 'id' | 'planId' | 'createdBy' | 'createdDate'>[]>([]);
  const [showItemBuilder, setShowItemBuilder] = useState(false);
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAssets();
    if (program) {
      setFormData({
        title: program.title,
        shortDescription: program.shortDescription,
        detailedDescription: program.detailedDescription,
        focusArea: program.focusArea,
        subFocusArea: program.subFocusArea,
        tags: program.tags,
        duration: program.duration,
        programType: program.programType,
        providerId: program.providerId,
        gender: program.gender,
        ageGroup: program.ageGroup,
        geography: program.geography,
        status: program.status,
        basePrice: program.basePrice,
        offerPrice: program.offerPrice,
        currency: program.currency,
        items: program.items,
      });
      loadProgramItems(program.id);
    }
  }, [program]);

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

  const loadProgramItems = async (programId: string) => {
    const items = await getProgramItems(programId);
    setBuilderItems(items.map(item => ({
      assetType: item.assetType,
      assetId: item.assetId,
      dayNo: item.dayNo,
      sequenceNo: item.sequenceNo,
      title: item.title,
      isOptional: item.isOptional,
      completionRequired: item.completionRequired,
    })));
  };

  const handleFocusAreaChange = (focusArea: FocusArea) => {
    setFormData({ ...formData, focusArea, subFocusArea: '' });
  };

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.shortDescription || !formData.providerId ||
        formData.duration <= 0 || formData.basePrice < 0) {
      alert('Please fill in all required fields');
      return;
    }

    if (formData.offerPrice && formData.offerPrice >= formData.basePrice) {
      alert('Offer price must be less than base price');
      return;
    }

    const programData: Program = {
      ...formData,
      id: program?.id || '',
      createdBy: program?.createdBy || 'usr-001',
      createdDate: program?.createdDate || new Date().toISOString().split('T')[0],
    };

    onSave(programData, builderItems);
  };

  const providerPartners = partners.filter(p => p.type === 'provider' || p.type === 'dual');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {program ? 'Edit Program' : 'Add New Program'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Program Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Detailed Description
                </label>
                <textarea
                  value={formData.detailedDescription}
                  onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Classification</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Focus Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.focusArea}
                    onChange={(e) => handleFocusAreaChange(e.target.value as FocusArea)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    {focusAreas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sub-Focus Area
                  </label>
                  <select
                    value={formData.subFocusArea}
                    onChange={(e) => setFormData({ ...formData, subFocusArea: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select sub-focus area</option>
                    {subFocusAreas[formData.focusArea].map((subArea) => (
                      <option key={subArea} value={subArea}>
                        {subArea}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-purple-900"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Program Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (days) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Program Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.programType}
                  onChange={(e) => setFormData({ ...formData, programType: e.target.value as ProgramType })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  {programTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Provider <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.providerId}
                  onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ProgramStatus })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  {productStatuses.program.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Pricing</h3>
            <div className="grid grid-cols-3 gap-4">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Offer Price
                </label>
                <input
                  type="number"
                  value={formData.offerPrice || ''}
                  onChange={(e) => setFormData({ ...formData, offerPrice: parseFloat(e.target.value) || undefined })}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* NEW SECTION - Program Items Builder */}
          <div className="mt-8 border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Program Items</h3>
                <p className="text-sm text-gray-600 mt-1">Define the sessions and services in this program</p>
              </div>
              <button
                type="button"
                onClick={() => setShowItemBuilder(!showItemBuilder)}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {showItemBuilder ? (
                  <><ChevronUp className="w-4 h-4" /> Hide Builder</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> Show Builder ({builderItems.length} items)</>
                )}
              </button>
            </div>

            {showItemBuilder && (
              <div className="grid grid-cols-2 gap-4 border rounded-lg overflow-hidden" style={{ height: '400px' }}>
                {/* Left Panel - Available Assets */}
                <div className="border-r p-4 overflow-y-auto bg-gray-50">
                  <h4 className="font-medium mb-3 text-gray-900">Available Assets</h4>

                  <input
                    type="text"
                    placeholder="Search sessions/services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 text-sm"
                  />

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Sessions ({sessions.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase())).length})
                    </p>
                    <div className="space-y-1">
                      {sessions
                        .filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((session) => (
                          <div
                            key={session.id}
                            className="p-2 bg-white border border-gray-200 rounded text-sm hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                            onClick={() => {
                              setEditingItemIndex(null);
                              setIsItemFormOpen(true);
                            }}
                          >
                            <p className="font-medium text-gray-900">{session.title}</p>
                            <p className="text-xs text-gray-500">{session.duration} min • {session.focusArea}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Services ({services.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase())).length})
                    </p>
                    <div className="space-y-1">
                      {services
                        .filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((service) => (
                          <div
                            key={service.id}
                            className="p-2 bg-white border border-gray-200 rounded text-sm hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                            onClick={() => {
                              setEditingItemIndex(null);
                              setIsItemFormOpen(true);
                            }}
                          >
                            <p className="font-medium text-gray-900">{service.title}</p>
                            <p className="text-xs text-gray-500">{service.serviceType} • {service.focusArea}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Right Panel - Program Items */}
                <div className="p-4 overflow-y-auto bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Program Items ({builderItems.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItemIndex(null);
                        setIsItemFormOpen(true);
                      }}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>

                  {builderItems.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="font-medium">No items added yet</p>
                      <p className="text-sm mt-1">Click "Add Item" or select from the left panel</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {builderItems
                        .sort((a, b) => {
                          if (a.dayNo !== b.dayNo) return a.dayNo - b.dayNo;
                          return a.sequenceNo - b.sequenceNo;
                        })
                        .map((item, index) => {
                          const asset = item.assetType === 'session'
                            ? sessions.find(s => s.id === item.assetId)
                            : services.find(s => s.id === item.assetId);

                          return (
                            <div
                              key={index}
                              className="p-3 border border-gray-200 rounded-lg bg-white hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`inline-block w-2 h-2 rounded-full ${
                                      item.assetType === 'session' ? 'bg-blue-500' : 'bg-green-500'
                                    }`}></span>
                                    <p className="font-medium text-sm text-gray-900 truncate">{item.title}</p>
                                  </div>
                                  {asset && (
                                    <p className="text-xs text-gray-600 truncate mb-1">{asset.title}</p>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span>Day {item.dayNo}</span>
                                    <span>•</span>
                                    <span>Seq {item.sequenceNo}</span>
                                    {item.isOptional && (
                                      <><span>•</span>
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                                        Optional
                                      </span></>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingItemIndex(index);
                                      setIsItemFormOpen(true);
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                                    title="Edit item"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBuilderItems(builderItems.filter((_, i) => i !== index));
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Remove item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              {program ? 'Update' : 'Create'}
            </button>
          </div>
        </form>

        {/* Program Item Form Modal */}
        {isItemFormOpen && (
          <ProgramItemForm
            isOpen={isItemFormOpen}
            onClose={() => {
              setIsItemFormOpen(false);
              setEditingItemIndex(null);
            }}
            onSave={(item) => {
              if (editingItemIndex !== null) {
                const updated = [...builderItems];
                updated[editingItemIndex] = item;
                setBuilderItems(updated);
              } else {
                setBuilderItems([...builderItems, item]);
              }
              setIsItemFormOpen(false);
              setEditingItemIndex(null);
            }}
            programDuration={formData.duration}
            existingItem={editingItemIndex !== null ? {
              ...builderItems[editingItemIndex],
              id: '',
              planId: '',
              createdBy: '',
              createdDate: '',
            } : undefined}
          />
        )}
      </div>
    </div>
  );
}
