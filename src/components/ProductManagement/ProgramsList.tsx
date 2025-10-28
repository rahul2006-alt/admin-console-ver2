import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { Program, BusinessPartner, ProgramItemData } from '../../types';
import partnersDataImport from '../../data/partners.json';
import ProgramModal from './ProgramModal';
import { supabase } from '../../lib/supabase';
import { saveProgramPlan, saveProgramItems, getProgramPlan, deleteProgramPlanAndItems } from '../../utils/programHelpers';

export default function ProgramsList() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [partners, setPartners] = useState<BusinessPartner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPartners(partnersDataImport as BusinessPartner[]);
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedPrograms: Program[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        shortDescription: row.short_description,
        detailedDescription: row.detailed_description,
        focusArea: row.focus_area,
        subFocusArea: row.sub_focus_area,
        tags: row.tags || [],
        duration: row.duration,
        programType: row.program_type,
        providerId: row.provider_id,
        gender: row.gender,
        ageGroup: row.age_group,
        geography: row.geography,
        status: row.status,
        basePrice: row.base_price,
        offerPrice: row.offer_price,
        currency: row.currency,
        items: row.items || [],
        createdBy: row.created_by,
        createdDate: row.created_at?.split('T')[0] || '',
      }));

      setPrograms(mappedPrograms);
    } catch (error) {
      console.error('Error loading programs:', error);
      alert('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'review': return 'bg-yellow-100 text-yellow-700';
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

  const handleAdd = () => {
    setEditingProgram(null);
    setIsModalOpen(true);
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteProgramPlanAndItems(deleteConfirm);

      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', deleteConfirm);

      if (error) throw error;

      setPrograms(programs.filter(p => p.id !== deleteConfirm));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting program:', error);
      alert('Failed to delete program');
    }
  };

  const handleSave = async (program: Program, items: Omit<ProgramItemData, 'id' | 'planId' | 'createdBy' | 'createdDate'>[]) => {
    try {
      const programData = {
        title: program.title,
        short_description: program.shortDescription,
        detailed_description: program.detailedDescription,
        focus_area: program.focusArea,
        sub_focus_area: program.subFocusArea,
        tags: program.tags,
        duration: program.duration,
        program_type: program.programType,
        provider_id: program.providerId,
        gender: program.gender,
        age_group: program.ageGroup,
        geography: program.geography,
        status: program.status,
        base_price: program.basePrice,
        offer_price: program.offerPrice || null,
        currency: program.currency,
        items: program.items,
        created_by: program.createdBy || 'usr-001',
        updated_at: new Date().toISOString(),
      };

      let programId = program.id;

      if (editingProgram) {
        const { error } = await supabase
          .from('programs')
          .update(programData)
          .eq('id', program.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('programs')
          .insert([programData])
          .select('id')
          .single();

        if (error) throw error;
        programId = data.id;
      }

      const existingPlan = await getProgramPlan(programId);
      const planId = await saveProgramPlan({
        id: existingPlan?.id,
        programId,
        planType: program.programType === 'sequential' ? 'Day' : 'Step',
        sequenceOrder: 1,
        title: `${program.title} - Plan`,
        description: `Execution plan for ${program.title}`,
        status: 'active',
        createdBy: program.createdBy || 'usr-001',
        createdDate: existingPlan?.createdDate || new Date().toISOString().split('T')[0],
      });

      if (planId && items.length > 0) {
        await saveProgramItems(
          planId,
          items.map(item => ({
            ...item,
            createdBy: program.createdBy || 'usr-001',
          }))
        );
      }

      await loadPrograms();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Failed to save program');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-600">Loading programs...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-600 mt-1">Structured wellness experiences</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Program
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Program Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Focus Area
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Items
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
            {programs.map((program) => (
              <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-semibold text-gray-900">{program.title}</div>
                      <div className="text-xs text-gray-500">{program.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{program.focusArea}</div>
                    <div className="text-sm text-gray-600">{program.subFocusArea}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {program.duration} days
                </td>
                <td className="px-6 py-4">
                  {program.offerPrice ? (
                    <div>
                      <div className="font-semibold text-gray-900">₹{program.offerPrice}</div>
                      <div className="text-sm text-gray-500 line-through">₹{program.basePrice}</div>
                    </div>
                  ) : (
                    <div className="font-semibold text-gray-900">₹{program.basePrice}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {program.items.length} items
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {getProviderName(program.providerId)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(program.status)}`}>
                    {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(program)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(program.id)}
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
        <ProgramModal
          program={editingProgram}
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
              Are you sure you want to delete this program? This action cannot be undone.
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
