import { ProgramPlan, ProgramItemData, Session, Service } from '../types';
import { supabase } from '../lib/supabase';

export async function getProgramPlan(programId: string): Promise<ProgramPlan | null> {
  try {
    const { data, error } = await supabase
      .from('program_plans')
      .select('*')
      .eq('program_id', programId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      programId: data.program_id,
      planType: data.plan_type,
      sequenceOrder: data.sequence_order,
      title: data.title,
      description: data.description,
      status: data.status,
      createdBy: data.created_by,
      createdDate: data.created_at?.split('T')[0] || '',
    };
  } catch (error) {
    console.error('Error fetching program plan:', error);
    return null;
  }
}

export async function getProgramItems(programId: string): Promise<ProgramItemData[]> {
  try {
    const plan = await getProgramPlan(programId);
    if (!plan) return [];

    const { data, error } = await supabase
      .from('program_items')
      .select('*')
      .eq('plan_id', plan.id)
      .order('day_no', { ascending: true })
      .order('sequence_no', { ascending: true });

    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      planId: row.plan_id,
      assetType: row.asset_type,
      assetId: row.asset_id,
      dayNo: row.day_no,
      sequenceNo: row.sequence_no,
      title: row.title,
      isOptional: row.is_optional,
      completionRequired: row.completion_required,
      createdBy: row.created_by,
      createdDate: row.created_at?.split('T')[0] || '',
    }));
  } catch (error) {
    console.error('Error fetching program items:', error);
    return [];
  }
}

export async function getProgramItemCount(programId: string): Promise<number> {
  try {
    const plan = await getProgramPlan(programId);
    if (!plan) return 0;

    const { count, error } = await supabase
      .from('program_items')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', plan.id);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error fetching program item count:', error);
    return 0;
  }
}

export async function getItemAssetDetails(item: ProgramItemData): Promise<Session | Service | null> {
  try {
    const tableName = item.assetType === 'session' ? 'sessions' : 'services';
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', item.assetId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching asset details:', error);
    return null;
  }
}

export async function saveProgramPlan(plan: Omit<ProgramPlan, 'id'> & { id?: string }): Promise<string | null> {
  try {
    const planData = {
      program_id: plan.programId,
      plan_type: plan.planType,
      sequence_order: plan.sequenceOrder,
      title: plan.title,
      description: plan.description,
      status: plan.status,
      created_by: plan.createdBy,
      updated_at: new Date().toISOString(),
    };

    if (plan.id) {
      const { error } = await supabase
        .from('program_plans')
        .update(planData)
        .eq('id', plan.id);

      if (error) throw error;
      return plan.id;
    } else {
      const { data, error } = await supabase
        .from('program_plans')
        .insert([planData])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    }
  } catch (error) {
    console.error('Error saving program plan:', error);
    return null;
  }
}

export async function saveProgramItems(planId: string, items: Omit<ProgramItemData, 'id' | 'planId'>[]): Promise<boolean> {
  try {
    await supabase
      .from('program_items')
      .delete()
      .eq('plan_id', planId);

    if (items.length === 0) return true;

    const itemsData = items.map(item => ({
      plan_id: planId,
      asset_type: item.assetType,
      asset_id: item.assetId,
      day_no: item.dayNo,
      sequence_no: item.sequenceNo,
      title: item.title,
      is_optional: item.isOptional,
      completion_required: item.completionRequired,
      created_by: item.createdBy,
    }));

    const { error } = await supabase
      .from('program_items')
      .insert(itemsData);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving program items:', error);
    return false;
  }
}

export async function deleteProgramPlanAndItems(programId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('program_plans')
      .delete()
      .eq('program_id', programId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting program plan and items:', error);
    return false;
  }
}
