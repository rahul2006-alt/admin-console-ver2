import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { User, UserRole, RelationshipType, BusinessPartner, PartnerLink } from '../../types';

interface UserModalProps {
  user: User | null;
  partners: BusinessPartner[];
  onClose: () => void;
  onSave: (user: User) => void;
}

export default function UserModal({ user, partners, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    name: '',
    email: '',
    mobile: '',
    role: 'end_user',
    status: 'active',
    partnerLinks: [],
  });

  const [newLink, setNewLink] = useState<{ partnerId: string; relationshipType: RelationshipType }>({
    partnerId: '',
    relationshipType: 'member',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        partnerLinks: user.partnerLinks,
      });
    }
  }, [user]);

  const roles: { value: UserRole; label: string }[] = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'provider_admin', label: 'Provider Admin' },
    { value: 'institution_admin', label: 'Institution Admin' },
    { value: 'content_author', label: 'Content Author' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'end_user', label: 'End User' },
  ];

  const relationshipTypes: { value: RelationshipType; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
    { value: 'instructor', label: 'Instructor' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'author', label: 'Author' },
  ];

  const handleAddLink = () => {
    if (!newLink.partnerId) {
      alert('Please select a partner');
      return;
    }

    const alreadyLinked = formData.partnerLinks.some(
      link => link.partnerId === newLink.partnerId && link.relationshipType === newLink.relationshipType
    );

    if (alreadyLinked) {
      alert('This partner link already exists');
      return;
    }

    setFormData({
      ...formData,
      partnerLinks: [...formData.partnerLinks, { ...newLink }],
    });

    setNewLink({ partnerId: '', relationshipType: 'member' });
  };

  const handleRemoveLink = (index: number) => {
    setFormData({
      ...formData,
      partnerLinks: formData.partnerLinks.filter((_, i) => i !== index),
    });
  };

  const getPartnerName = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    return partner?.name || 'Unknown';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.mobile) {
      alert('Please fill in all required fields');
      return;
    }

    const userData: User = {
      ...formData,
      id: user?.id || '',
    };

    onSave(userData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {user ? 'Edit User' : 'Add New User'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="inactive"
                  checked={formData.status === 'inactive'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium text-gray-700">Inactive</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-4">Partner Links</label>

            {formData.partnerLinks.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.partnerLinks.map((link, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900">{getPartnerName(link.partnerId)}</span>
                      <span className="text-gray-500 text-sm ml-2">({link.relationshipType})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(index)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <p className="text-sm font-semibold text-gray-700">Add New Link</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Partner</label>
                  <select
                    value={newLink.partnerId}
                    onChange={(e) => setNewLink({ ...newLink, partnerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select partner</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Relationship</label>
                  <select
                    value={newLink.relationshipType}
                    onChange={(e) => setNewLink({ ...newLink, relationshipType: e.target.value as RelationshipType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {relationshipTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddLink}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Link
              </button>
            </div>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {user ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
