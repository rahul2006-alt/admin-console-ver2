import { FocusArea } from '../types';

export const focusAreas: FocusArea[] = ['Mind', 'Body', 'Nutrition', 'Sleep', 'General Wellness'];

export const subFocusAreas: Record<FocusArea, string[]> = {
  Mind: ['Stress Management', 'Sleep', 'Meditation', 'Mindfulness'],
  Body: ['Spine Health', 'General Fitness', 'Cardio Fitness', 'Pain Management', 'Flexibility'],
  Nutrition: ['General Nutrition', 'Diet Planning', 'Weight Management'],
  Sleep: ['Sleep Quality', 'Insomnia', 'Sleep Hygiene'],
  'General Wellness': ['Holistic Health', 'Lifestyle', 'Preventive Care']
};

export const contentTypes = ['audio', 'video', 'text', 'interactive'];

export const serviceTypes = ['tele-consult', 'in-person', 'hybrid', 'group-class', 'workshop'];

export const genderOptions = ['Male', 'Female', 'Any'];

export const ageGroupOptions = ['Child', 'Youth', 'Adult', 'Elderly'];

export const sessionStatuses = ['draft', 'review', 'approved', 'published', 'archived'];

export const serviceStatuses = ['defined', 'validated', 'approved', 'active', 'retired'];
