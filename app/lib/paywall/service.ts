import { createClient } from '@supabase/supabase-js';
import { redirect } from '@remix-run/cloudflare';

export interface PaywallConfig {
  enabled: boolean;
  requireSubscription: boolean;
  freeTierLimit: number;
  trialDays: number;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  portfolioLimit: number;
  customDomain: boolean;
  aiCredits: number;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['1 Portfolio', 'Basic Templates', 'AppVantix Branding'],
    portfolioLimit: 1,
    customDomain: false,
    aiCredits: 5,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 29,
    features: ['Unlimited Portfolios', 'Premium Templates', 'Custom Domain', 'Remove Branding'],
    portfolioLimit: -1, // unlimited
    customDomain: true,
    aiCredits: 100,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    features: ['Everything in Pro', 'White-label', 'Priority Support', 'Custom Templates'],
    portfolioLimit: -1,
    customDomain: true,
    aiCredits: -1, // unlimited
  },
];

export class PaywallService {
  private supabase;
  private config: PaywallConfig;

  constructor(supabaseUrl: string, supabaseKey: string, config: PaywallConfig) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = config;
  }

  async checkAccess(userId: string, action: string): Promise<{ allowed: boolean; reason?: string }> {
    if (!this.config.enabled) {
      return { allowed: true };
    }

    try {
      const { data: profile, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        return { allowed: false, reason: 'User profile not found' };
      }

      // Check subscription status
      if (this.config.requireSubscription && profile.subscription_status !== 'active') {
        return { allowed: false, reason: 'Active subscription required' };
      }

      // Check feature limits based on subscription tier
      const tier = SUBSCRIPTION_TIERS.find(t => t.id === profile.subscription_tier);
      if (!tier) {
        return { allowed: false, reason: 'Invalid subscription tier' };
      }

      // Check portfolio limits
      if (action === 'create_portfolio' && tier.portfolioLimit !== -1) {
        if (profile.portfolio_count >= tier.portfolioLimit) {
          return { allowed: false, reason: 'Portfolio limit reached for your tier' };
        }
      }

      // Check AI credits
      if (action === 'use_ai' && tier.aiCredits !== -1) {
        if (profile.ai_credits_used >= tier.aiCredits) {
          return { allowed: false, reason: 'AI credits exhausted for this month' };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Paywall check error:', error);
      return { allowed: false, reason: 'System error' };
    }
  }

  async upgradeRequired(userId: string, requiredTier: string) {
    const currentProfile = await this.getUserProfile(userId);
    const current = SUBSCRIPTION_TIERS.find(t => t.id === currentProfile?.subscription_tier);
    const required = SUBSCRIPTION_TIERS.find(t => t.id === requiredTier);

    if (!current || !required) return true;

    return current.price < required.price;
  }

  async getUserProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUsage(userId: string, action: string, amount = 1) {
    const updates: any = {};

    switch (action) {
      case 'create_portfolio':
        updates.portfolio_count = { increment: amount };
        break;
      case 'use_ai':
        updates.ai_credits_used = { increment: amount };
        break;
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await this.supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
    }
  }

  async requireSubscription(userId: string, request: Request): Promise<void> {
    const access = await this.checkAccess(userId, 'general');
    
    if (!access.allowed) {
      const url = new URL(request.url);
      const redirectUrl = `/upgrade?reason=${encodeURIComponent(access.reason || 'Subscription required')}&return=${encodeURIComponent(url.pathname)}`;
      throw redirect(redirectUrl);
    }
  }
}

// Helper function to initialize paywall service
export function createPaywallService(env: any): PaywallService {
  return new PaywallService(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      enabled: env.VITE_ENABLE_PAYWALL === 'true',
      requireSubscription: env.VITE_REQUIRE_SUBSCRIPTION === 'true',
      freeTierLimit: parseInt(env.FREE_TIER_LIMIT || '1'),
      trialDays: parseInt(env.TRIAL_DAYS || '7'),
    }
  );
}

// Remix loader helper
export async function requireValidSubscription(userId: string, request: Request, env: any) {
  const paywall = createPaywallService(env);
  await paywall.requireSubscription(userId, request);
  return paywall;
}
