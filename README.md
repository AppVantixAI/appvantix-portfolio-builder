# AppVantix Web Builder

🚀 **Transform LinkedIn profiles into stunning professional websites using AI**

AppVantix Web Builder is a commercial AI-powered platform that converts LinkedIn profiles into beautiful, professional portfolio websites. Built on the foundation of bolt.diy, it's specifically designed for businesses and professionals who want to create impressive web presences quickly and efficiently.

## ✨ Features

### 🎯 Core Functionality
- **LinkedIn to Portfolio Conversion**: Import LinkedIn profiles and transform them into professional websites
- **AI-Powered Design**: Multiple LLM support for intelligent website generation
- **Real-time Preview**: See changes instantly as AI builds your site
- **Template Library**: Curated portfolio templates optimized for different industries
- **Custom Domains**: Connect your own domain for professional branding

### 🔒 Business Features
- **Paywall Integration**: Monetize with Stripe checkout and Supabase user management
- **Subscription Management**: Flexible pricing tiers and billing cycles
- **User Authentication**: Secure login and user profile management
- **Usage Analytics**: Track user engagement and conversion metrics
- **Admin Dashboard**: Manage users, subscriptions, and platform settings

### 🛡️ Security & Compliance
- **Tamper-Proof LLM Settings**: Secured AI configuration to prevent user manipulation
- **SOC 2 Compliant**: Enterprise-grade security standards
- **Data Privacy**: GDPR and CCPA compliant data handling
- **Rate Limiting**: Prevent abuse and ensure fair usage

## 🏗️ Architecture

Built with modern, scalable technologies:
- **Frontend**: Remix + React + TypeScript + Vite
- **Backend**: Node.js + Cloudflare Workers
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Authentication**: Supabase Auth
- **Deployment**: Google Cloud Run
- **AI**: Multi-provider support (OpenAI, Anthropic, Google, etc.)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and pnpm
- Docker (optional)
- Google Cloud CLI
- Git

### Local Development

1. **Clone and Setup**
```bash
git clone https://github.com/AppVantixAI/appvantix-web-builder.git
cd appvantix-web-builder
pnpm install
```

2. **Environment Configuration**
```bash
cp .env.example .env.local
# Edit .env.local with your API keys and configuration
```

3. **Start Development Server**
```bash
pnpm run dev
```

4. **Access Application**
Visit http://localhost:5173

### Docker Development

```bash
# Development with hot reload
pnpm run docker:dev

# Production build
pnpm run docker:prod
```

## 🌐 Production Deployment

### Google Cloud Run (Recommended)

1. **Setup Google Cloud**
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

2. **Deploy**
```bash
# Build and deploy in one command
gcloud builds submit --config cloudbuild.yaml

# Or use the npm script
npm run gcp:deploy
```

3. **Configure Environment Variables**
```bash
gcloud run services update appvantix-web-builder \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="OPENAI_API_KEY=openai-key:latest,STRIPE_SECRET_KEY=stripe-secret:latest"
```

### GitHub Actions CI/CD

The repository includes automated deployment via GitHub Actions:

1. **Setup Secrets** in your GitHub repository:
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `WIF_PROVIDER`: Workload Identity Federation provider
   - `WIF_SERVICE_ACCOUNT`: Service account for deployment

2. **Automatic Deployment**: Push to `main` branch triggers deployment

## 💳 Monetization Setup

### Stripe Configuration

1. **Create Stripe Products**
```bash
# Basic Plan
stripe products create --name="Basic Portfolio" --description="Single portfolio website"

# Pro Plan  
stripe products create --name="Pro Portfolio" --description="Unlimited websites + custom domains"

# Enterprise Plan
stripe products create --name="Enterprise" --description="White-label solution"
```

2. **Configure Webhooks**
Point Stripe webhooks to: `https://your-domain.com/api/webhooks/stripe`

### Supabase Setup

1. **Create Project** at https://supabase.com
2. **Run Migrations**:
```sql
-- Users table extension
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  stripe_customer_id TEXT,
  portfolio_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolios table
CREATE TABLE portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  linkedin_data JSONB,
  website_data JSONB,
  domain TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## ⚙️ Configuration

### LLM Security Settings

Prevent users from tampering with AI settings:

```typescript
// app/lib/security/llm-protection.ts
export const PROTECTED_PROMPTS = {
  SYSTEM_PROMPT: `You are AppVantix Web Builder AI...`, // Read-only
  LINKEDIN_PARSER: `Parse LinkedIn profile data...`,   // Secured
  PORTFOLIO_GENERATOR: `Generate portfolio HTML...`    // Locked
};

// Rate limiting and validation
export const LLM_LIMITS = {
  MAX_REQUESTS_PER_HOUR: 50,
  MAX_TOKENS_PER_REQUEST: 4000,
  ALLOWED_MODELS: ['gpt-4', 'claude-3-sonnet']
};
```

### Feature Flags

Control functionality via environment variables:

```bash
# Feature toggles
VITE_ENABLE_LINKEDIN_IMPORT=true
VITE_ENABLE_CUSTOM_DOMAINS=true
VITE_ENABLE_AI_SUGGESTIONS=true
VITE_REQUIRE_SUBSCRIPTION=true

# Security settings
VITE_ENABLE_PAYWALL=true
VITE_ENABLE_USER_MANAGEMENT=true
```

## 📊 Monitoring & Analytics

### Google Cloud Monitoring

```bash
# Enable monitoring
gcloud services enable monitoring.googleapis.com

# Create custom metrics
gcloud logging metrics create portfolio_creations \
  --description="Track portfolio creation events" \
  --log-filter='resource.type="cloud_run_revision" AND jsonPayload.event="portfolio_created"'
```

### Business Metrics

Track key business metrics:
- Portfolio creation rate
- Conversion funnel (signup → subscription)
- User engagement time
- Template popularity
- Revenue per user

## 🔧 Customization

### Adding New Templates

1. **Create Template**:
```typescript
// app/lib/templates/professional.ts
export const ProfessionalTemplate = {
  id: 'professional',
  name: 'Professional',
  category: 'business',
  preview: '/templates/professional-preview.jpg',
  html: `<div class="professional-template">...</div>`,
  css: `/* Professional styles */`,
  customization: {
    colors: ['#1a202c', '#2d3748', '#4a5568'],
    fonts: ['Inter', 'Roboto', 'Open Sans']
  }
};
```

2. **Register Template**:
```typescript
// app/lib/templates/index.ts
import { ProfessionalTemplate } from './professional';

export const AVAILABLE_TEMPLATES = [
  ProfessionalTemplate,
  // ... other templates
];
```

### Custom AI Prompts

Enhance AI generation for specific industries:

```typescript
// app/lib/prompts/industry-specific.ts
export const INDUSTRY_PROMPTS = {
  TECH: `Create a modern, technical portfolio emphasizing coding skills...`,
  DESIGN: `Design a visually striking portfolio showcasing creative work...`,
  BUSINESS: `Build a professional business-focused portfolio...`,
  HEALTHCARE: `Generate a trustworthy, professional healthcare portfolio...`
};
```

## 🚧 Roadmap

### Phase 1 (Q1 2025) ✅
- [x] LinkedIn profile import
- [x] Basic template library
- [x] Stripe integration
- [x] Google Cloud Run deployment

### Phase 2 (Q2 2025) 🚧
- [ ] Advanced template customization
- [ ] White-label solutions
- [ ] API for third-party integrations
- [ ] Advanced analytics dashboard

### Phase 3 (Q3 2025) 📋
- [ ] Multi-language support
- [ ] Team collaboration features
- [ ] Enterprise SSO integration
- [ ] Advanced SEO optimization

### Phase 4 (Q4 2025) 💡
- [ ] AI-powered design suggestions
- [ ] Integration with job boards
- [ ] Portfolio performance analytics
- [ ] Mobile app companion

## 📝 License & Commercial Use

This project is licensed under MIT for the code, but includes:

### Commercial Licensing Required For:
- **WebContainers API**: Production commercial use requires licensing from StackBlitz
- **Stripe Integration**: Standard Stripe fees apply
- **Third-party AI APIs**: Usage fees from OpenAI, Anthropic, etc.

### What's Included:
- ✅ Source code modification rights
- ✅ Commercial deployment rights
- ✅ White-label customization
- ✅ Integration with your existing services

### What Requires Additional Licensing:
- ❌ WebContainers in production (contact StackBlitz)
- ❌ Redistribution of the complete platform
- ❌ Using AppVantix branding without permission

## 🤝 Support & Community

- **Email**: support@appvantix.com
- **Documentation**: https://docs.appvantix.com
- **Status Page**: https://status.appvantix.com
- **Feature Requests**: GitHub Issues

### Enterprise Support
For enterprise customers:
- 24/7 priority support
- Custom feature development
- White-label licensing
- Dedicated account management

Contact enterprise@appvantix.com for pricing.

## 🔒 Security

Report security issues to security@appvantix.com

### Security Features:
- Regular dependency updates
- Container vulnerability scanning
- SOC 2 Type II compliance
- Data encryption in transit and at rest
- Rate limiting and DDoS protection

---

**Built with ❤️ by [AppVantix LLC](https://appvantix.com)**

*Transform your LinkedIn profile into a stunning portfolio website in minutes, not hours.*
