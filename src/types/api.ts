/**
 * Domain types mirroring the backend models and response shapes
 * (Backend: src/models, src/controller, src/services).
 */

export type RoleName = 'Admin' | 'Supervisor' | 'Analyst' | 'Client';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type SocialPlatform = 'Facebook' | 'Instagram' | 'X';

export interface Role {
  id: number;
  name: RoleName;
}

export interface UserRef {
  id: string;
  username: string;
  email: string;
  role?: Role;
}

export interface CompanyRef {
  id: number;
  company_name: string;
  industry: string | null;
  sub_industry: string | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  currentPage?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

// ---------------------------------------------------------------- Users

export interface Subsidiary {
  id: number;
  company_id?: number;
  subsidiary_company_id: number | null;
  subsidiary_id?: number | null;
  company_name: string;
  industry: string | null;
  sub_industry: string | null;
}

export interface SubsidiaryMonitoring {
  id: number;
  company_monitoring_id: number | null;
  subsidiary_id: number;
  competitor_subsidiary_ids: number[];
  media_prominence: string[];
  subsidiary?: Subsidiary;
  competitor_subsidiaries?: Subsidiary[];
}

export interface CompanyMonitoring {
  id: number;
  company_id: number;
  competitor_company_ids: number[];
  media_prominence: string[];
  monitoring_date: string;
  company?: CompanyRef;
  competitor_companies?: CompanyRef[];
  subsidiary_monitorings?: SubsidiaryMonitoring[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  country_code: string;
  mobile_number: string;
  status: UserStatus;
  role: Role;
  role_id?: number;
  supervisor_id: string | null;
  requires_password_change: boolean;
  supervisor_data?: UserRef | null;
  analysts_data?: UserRef[];
  company_monitorings?: CompanyMonitoring[];
  subsidiary_monitorings?: SubsidiaryMonitoring[];
  createdAt: string;
  updatedAt: string;
}

export interface Supervisor extends UserRef {
  analysts_data: UserRef[];
}

// ---------------------------------------------------------------- Companies

export interface Company extends CompanyRef {
  office_address: string | null;
  office_state: string | null;
  office_country: string | null;
  email: string | null;
  contact_person: string | null;
  ceo: string | null;
  additional_info: string | null;
  phone_no: string | null;
  website: string | null;
  facebook_link: string | null;
  instagram_link: string | null;
  twitter_link: string | null;
  linkedin_link: string | null;
  youtube_link: string | null;
  subsidiaries?: Subsidiary[];
  createdAt?: string;
}

// ---------------------------------------------------------------- Reference data

export interface Publication {
  id: number;
  name: string;
  type: string | null;
  website: string | null;
  description: string | null;
  createdAt: string;
}

export interface SentimentKeywordIndicator {
  id: number;
  keyword_indicator: string;
  sentiment_score: number;
  classification: string;
}

export interface ParameterValue {
  id: number;
  dataParametersCategoryId: number;
  value: string;
}

export interface ParameterCategory {
  id: number;
  dataParameterId: number;
  name: string;
  description: string | null;
  values: ParameterValue[];
}

export interface DataParameter {
  id: number;
  name: string;
  categories: ParameterCategory[];
}

// ---------------------------------------------------------------- Content workflow

interface ReviewFields {
  id: number;
  status: ReviewStatus;
  created_by: string | null;
  approved_by: string | null;
  reviewed_at: string | null;
  analyst_note?: string | null;
  supervisor_note?: string | null;
  creator_data?: UserRef | null;
  approver_data?: UserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface SwotItem { analysis: string }

export interface SwotAnalysis extends ReviewFields {
  company_id: number;
  date: string;
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
  company?: CompanyRef;
}

export interface InsightItem { category: string; insight: string }

export interface OutcomeInsight extends ReviewFields {
  company_id: number;
  date: string;
  insights: InsightItem[];
  company?: CompanyRef;
}

export interface IndustryLandscapeOverview extends ReviewFields {
  company_id: number;
  date: string;
  sector: string;
  highlights: string[];
  company_data?: CompanyRef;
}

export type MentionSentiment = 'positive' | 'negative' | 'neutral';

export interface MentionItem {
  headline?: string | null;
  content?: string | null;
  reporter?: string | null;
  source?: string | null;
  sentiment: MentionSentiment;
  page?: string | number | null;
  publication_date?: string | null;
  urls: string[];
}

export const MENTION_CATEGORIES = ['industry', 'competitors', 'subsidiaries', 'passive', 'advert'] as const;
export type MentionCategory = (typeof MENTION_CATEGORIES)[number];

export interface DailyMention extends ReviewFields, Record<MentionCategory, MentionItem[]> {
  company_id: number | null;
  publication: string | null;
  date: string | null;
  filename: string | null;
  original_name: string | null;
  file_type: string | null;
  company?: CompanyRef | null;
}

export type SocialMetrics = Record<string, number | string | null>;

export interface SocialMediaMention extends ReviewFields {
  company_id: number;
  date: string;
  social_media_type: SocialPlatform;
  metrics: SocialMetrics[];
  company_data?: CompanyRef;
}

/** Editorials are returned through the backend's EditorialResource formatter. */
export interface Editorial {
  id: number;
  date: string;
  online_channel: string | null;
  source: string | null;
  audience_reach: number | null;
  company: CompanyRef | null;
  media_type: string | null;
  placement: string | null;
  title: string | null;
  reporter: string | null;
  country: string | null;
  spokesperson: string | null;
  activity: string | null;
  sentiment: string | null;
  sentiment_keyword_indicator: Pick<SentimentKeywordIndicator, 'id' | 'keyword_indicator' | 'sentiment_score' | 'classification'> | null;
  advert_spend: number | null;
  circulation: number | null;
  status: ReviewStatus;
  page_size: string | null;
  page_number: string | null;
  language: string | null;
  ceo_media_presence: string | null;
  ceo_thought_leadership: string | null;
  print_web_clips: string | null;
  analyst_note: string | null;
  supervisor_note: string | null;
  admin_note: string | null;
  created_by: UserRef | null;
  approved_by: UserRef | null;
  reviewed_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EditorialCollection {
  editorial: Editorial[];
  meta: { total: number; currentPage: number; totalPage: number; pageSize: number };
}

export interface SupervisorDashboard<T> {
  supervisor: UserRef;
  analysts: UserRef[];
  stats: Record<string, number>;
  recent: { data: T[]; pagination: Pagination };
}

// ---------------------------------------------------------------- Audit

export type Severity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

export interface AuditLog {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  description: string | null;
  severity: Severity;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  createdAt: string;
  user?: UserRef | null;
}

export interface AuditStats {
  total_users: number;
  total_admins: number;
  total_clients: number;
  total_supervisors: number;
  total_analysts: number;
  content_pending: number;
  content_approved: number;
  content_rejected: number;
  totalActions: number;
  activeUsers: number;
  resourceTypes: number;
  todayActions: number;
  criticalEvents: number;
  actionsByType: { action: string; count: number }[];
  actionsBySeverity: { severity: Severity; count: number }[];
  timeline: { date: string; count: number }[];
}

// ---------------------------------------------------------------- Client monitoring & reports

export interface MonitoringPair {
  pair_id: number;
  pair_number: number;
  base_company: CompanyRef;
  competitors: { id: number; company_name: string }[];
  subsidiaries: {
    subsidiary_company: CompanyRef;
    competitor_subsidiaries: { id: number; name: string }[];
    media_prominence: string[];
  }[];
  media_prominence: string[];
  monitoring_date: string;
  is_expired: boolean;
  status: 'active' | 'expired';
  summary: { total_competitors: number; total_subsidiaries: number; total_companies_monitored: number };
}

export interface ReportPeriod { start: string; end: string }
