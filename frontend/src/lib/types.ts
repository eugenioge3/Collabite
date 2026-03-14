// ── User ────────────────────────────────────────────────────────────────────

export type UserRole = 'business' | 'influencer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  id_token: string;
  refresh_token: string;
  token_type: string;
}

// ── Profiles ────────────────────────────────────────────────────────────────

export type BusinessCategory = 'restaurant' | 'bar' | 'hotel' | 'cafe';
export type Niche = 'food' | 'nightlife' | 'travel' | 'lifestyle' | 'fitness';
export type SubscriptionStatus = 'free' | 'active' | 'canceled';

export interface BusinessProfile {
  user_id: string;
  business_name: string;
  category: BusinessCategory | null;
  city: string | null;
  state: string | null;
  country: string | null;
  google_maps_url: string | null;
  logo_url: string | null;
  description: string | null;
  instagram_handle: string | null;
  instagram_verified: boolean;
  tiktok_handle: string | null;
  tiktok_verified: boolean;
  verified: boolean;
  subscription_status: SubscriptionStatus;
  created_at: string;
}

export interface InfluencerProfile {
  user_id: string;
  display_name: string;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  niche: Niche | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  followers_instagram: number;
  followers_tiktok: number;
  followers_youtube: number;
  engagement_rate: number;
  profile_photo_url: string | null;
  portfolio_urls: string[];
  estimated_price_per_post: number | null;
  instagram_verified: boolean;
  tiktok_verified: boolean;
  verified: boolean;
  subscription_status: SubscriptionStatus;
  created_at: string;
}

export interface InfluencerPublicRanking {
  alias: string;
  city: string | null;
  state: string | null;
  niche: Niche | null;
  followers_range: string;
  engagement_range: string;
  verified: boolean;
}

export interface InfluencerBusinessRanking {
  user_id: string;
  display_name: string;
  city: string | null;
  state: string | null;
  country: string | null;
  niche: Niche | null;
  followers_instagram: number;
  followers_tiktok: number;
  followers_youtube: number;
  engagement_rate: number;
  estimated_price_per_post: number | null;
  verified: boolean;
  instagram_verified: boolean;
  tiktok_verified: boolean;
  created_at: string;
}

// ── Campaigns ───────────────────────────────────────────────────────────────

export type CampaignStatus =
  | 'draft'
  | 'funded'
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'canceled'
  | 'disputed';

export type Currency = 'MXN' | 'USD';

export interface Deliverable {
  type: string;
  quantity: number;
}

export interface Campaign {
  id: string;
  business_user_id: string;
  title: string;
  description: string | null;
  budget: number;
  currency: Currency;
  city: string | null;
  state: string | null;
  niche_required: Niche | null;
  min_followers: number;
  max_followers: number | null;
  deliverables: Deliverable[];
  includes: string[];
  status: CampaignStatus;
  escrow_funded: boolean;
  deadline: string | null;
  max_applicants: number | null;
  created_at: string;
}

export interface CampaignPublic {
  id: string;
  title: string;
  description: string | null;
  budget: number;
  currency: Currency;
  city: string | null;
  state: string | null;
  niche_required: Niche | null;
  min_followers: number;
  max_followers: number | null;
  deliverables: Deliverable[];
  includes: string[];
  status: CampaignStatus;
  deadline: string | null;
  max_applicants: number | null;
  business_hint?: string | null;
  already_applied?: boolean;
  created_at: string;
}

// ── Applications ────────────────────────────────────────────────────────────

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'disputed';
export type PayoutStatus = 'pending' | 'released' | 'disputed';

export interface ApplicationCandidate {
  user_id: string;
  display_name: string;
  city: string | null;
  state: string | null;
  country: string | null;
  niche: Niche | null;
  followers_instagram: number;
  followers_tiktok: number;
  followers_youtube: number;
  engagement_rate: number;
  estimated_price_per_post: number | null;
  verified: boolean;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  youtube_handle: string | null;
}

export interface Application {
  id: string;
  campaign_id: string;
  influencer_user_id: string;
  status: ApplicationStatus;
  message: string | null;
  deliverable_links: string[];
  payout_amount: number | null;
  payout_status: PayoutStatus;
  contact_unlocked: boolean;
  candidate: ApplicationCandidate | null;
  created_at: string;
}

// ── Social Verification ─────────────────────────────────────────────────────

export type VerificationPlatform = 'instagram' | 'tiktok';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'expired';

export interface SocialVerificationInitRequest {
  platform: VerificationPlatform;
  account_handle: string;
}

export interface SocialVerificationInitResponse {
  verification_id: string;
  platform: VerificationPlatform;
  account_handle: string;
  code: string;
  expires_at: string;
  instructions: string;
}

export interface SocialVerificationStatusResponse {
  verification_id: string;
  platform: VerificationPlatform;
  account_handle: string;
  status: VerificationStatus;
  code: string;
  expires_at: string;
  verified_at: string | null;
  review_notes: string | null;
}

export interface ManualPendingVerificationItem {
  verification_id: string;
  user_id: string;
  user_email: string;
  user_role: UserRole;
  platform: VerificationPlatform;
  account_handle: string;
  code: string;
  status: VerificationStatus;
  expires_at: string;
  created_at: string;
}
