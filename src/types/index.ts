export interface Tenant {
  id: string;
  name: string;
  description: string;
}

export interface BusinessPartner {
  id: string;
  name: string;
  type: 'provider' | 'institution' | 'center' | 'dual';
  roles: string[];
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  city: string;
  state: string;
  country: string;
  status: 'active' | 'inactive';
  parentId?: string;
}

export type UserRole =
  | 'super_admin'
  | 'provider_admin'
  | 'institution_admin'
  | 'content_author'
  | 'instructor'
  | 'consultant'
  | 'end_user';

export type RelationshipType = 'admin' | 'member' | 'instructor' | 'consultant' | 'author';

export interface PartnerLink {
  partnerId: string;
  relationshipType: RelationshipType;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: 'active' | 'inactive';
  partnerLinks: PartnerLink[];
}

export type FocusArea = 'Mind' | 'Body' | 'Nutrition' | 'Sleep' | 'General Wellness';

export type ContentType = 'audio' | 'video' | 'text' | 'interactive';

export type ServiceType = 'tele-consult' | 'in-person' | 'hybrid' | 'group-class' | 'workshop';

export type GenderOption = 'Male' | 'Female' | 'Any';

export type AgeGroup = 'Child' | 'Youth' | 'Adult' | 'Elderly';

export type SessionStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';

export type ServiceStatus = 'defined' | 'validated' | 'approved' | 'active' | 'retired';

export type ProgramType = 'sequential' | 'modular';

export type ProgramStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';

export type ClassMode = 'online' | 'offline' | 'hybrid';

export type SubscriptionType = 'monthly' | 'quarterly' | 'annual' | 'per-class';

export type ClassStatus = 'draft' | 'approved' | 'published' | 'archived';

export type BundleType = 'programs' | 'classes' | 'mixed';

export type BundleStatus = 'draft' | 'approved' | 'published' | 'archived';

export interface Session {
  id: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  focusArea: FocusArea;
  subFocusArea: string;
  tags: string[];
  contentType: ContentType;
  duration: number;
  language: string;
  providerId: string;
  fileUrl: string;
  thumbnailUrl?: string;
  gender: GenderOption;
  ageGroup: AgeGroup;
  geography: string;
  status: SessionStatus;
  isFree: boolean;
  basePrice?: number;
  currency?: string;
  createdBy: string;
  createdDate: string;
}

export interface Service {
  id: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  focusArea: FocusArea;
  subFocusArea: string;
  tags: string[];
  serviceType: ServiceType;
  deliveryChannel: string;
  defaultDuration: number;
  defaultCapacity: number;
  qualifiedRoles: string;
  providerId: string;
  centerId?: string;
  gender: GenderOption;
  ageGroup: string;
  geography: string;
  status: ServiceStatus;
  basePrice: number;
  currency: string;
  createdBy: string;
  createdDate: string;
}

export interface ProgramItem {
  assetType: 'session' | 'service';
  assetId: string;
  dayNo: number;
  sequenceNo: number;
  title?: string;
}

export interface Program {
  id: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  focusArea: FocusArea;
  subFocusArea: string;
  tags: string[];
  duration: number;
  programType: ProgramType;
  providerId: string;
  gender: GenderOption;
  ageGroup: string;
  geography: string;
  status: ProgramStatus;
  basePrice: number;
  offerPrice?: number;
  currency: string;
  items: ProgramItem[];
  createdBy: string;
  createdDate: string;
}

export interface Class {
  id: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  focusArea: FocusArea;
  subFocusArea: string;
  tags: string[];
  serviceId: string;
  recurrencePattern: string;
  mode: ClassMode;
  capacity: number;
  providerId: string;
  centerId?: string;
  gender: GenderOption;
  ageGroup: string;
  geography: string;
  status: ClassStatus;
  subscriptionType: SubscriptionType;
  basePrice: number;
  currency: string;
  createdBy: string;
  createdDate: string;
}

export interface Bundle {
  id: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  focusArea: FocusArea;
  subFocusArea: string;
  tags: string[];
  bundleType: BundleType;
  includedPrograms: string[];
  includedClasses: string[];
  providerId: string;
  gender: GenderOption;
  ageGroup: string;
  geography: string;
  status: BundleStatus;
  bundlePrice: number;
  discountPercent: number;
  originalPrice: number;
  currency: string;
  validityDays: number;
  createdBy: string;
  createdDate: string;
}

export type PlanType = 'Day' | 'Step';

export interface ProgramPlan {
  id: string;
  programId: string;
  planType: PlanType;
  sequenceOrder: number;
  title?: string;
  description?: string;
  status: 'active' | 'inactive';
  createdBy: string;
  createdDate: string;
}

export interface ProgramItemData {
  id: string;
  planId: string;
  assetType: 'session' | 'service';
  assetId: string;
  dayNo: number;
  sequenceNo: number;
  title: string;
  isOptional: boolean;
  completionRequired: boolean;
  createdBy: string;
  createdDate: string;
}
