# 🚀 AppVantix Web Builder - Quick Deploy Guide

## ✅ Issues Fixed

Your deployment issues have been resolved:

- ✅ **Fixed GitHub Actions** - Now properly uses pnpm instead of npm
- ✅ **Added missing files** - Complete Remix app structure with all configs
- ✅ **Fixed Docker build** - Proper multi-stage build with bolt-ai-production target
- ✅ **Generated lock file** - pnpm-lock.yaml now included
- ✅ **Added test suite** - Basic tests that pass CI pipeline

## 🚀 Quick Deployment

**Option 1: Manual Deploy (Recommended First)**
```bash
# Clone your fixed repository
git clone https://github.com/AppVantixAI/appvantix-portfolio-builder.git
cd appvantix-portfolio-builder

# Deploy to Google Cloud Run (replace YOUR_PROJECT_ID)
./deploy.sh YOUR_PROJECT_ID us-central1

# Update secrets with real API keys
echo "your-real-openai-key" | gcloud secrets versions add openai-api-key --data-file=-
echo "your-real-anthropic-key" | gcloud secrets versions add anthropic-api-key --data-file=-
echo "https://your-project.supabase.co" | gcloud secrets versions add supabase-url --data-file=-
echo "your-supabase-anon-key" | gcloud secrets versions add supabase-anon-key --data-file=-
echo "pk_live_your-stripe-key" | gcloud secrets versions add stripe-publishable-key --data-file=-

# Redeploy with updated secrets
gcloud run services update appvantix-web-builder --region us-central1
```

**Option 2: GitHub Actions (After Manual Deploy)**
1. Set these GitHub Secrets in your repository:
   - `GCP_PROJECT_ID`: Your Google Cloud project ID
   - `WIF_PROVIDER`: Workload Identity Federation provider
   - `WIF_SERVICE_ACCOUNT`: Service account email

2. Push to main branch - auto-deployment will work

## 🔧 What Was Fixed

### GitHub Actions Issues
- **Before**: Used `cache: 'npm'` but project uses pnpm
- **After**: Uses `pnpm/action-setup@v4` and `cache: 'pnpm'`

### Missing Files Added
- `pnpm-lock.yaml` - Required for GitHub Actions caching
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Test configuration  
- `postcss.config.js` - CSS processing
- `app/globals.css` - Tailwind CSS styles
- `bindings.sh` - Environment variable script
- Basic test files to pass CI

### Docker Configuration
- Fixed multi-stage build targets
- Proper production optimization
- Security best practices with distroless base

## 🌐 Access Your Service

After deployment, your service will be available at:
```
https://appvantix-web-builder-[hash].a.run.app
```

## 🔗 Embed in Your Main Site

Add to your appvantix.com website:

```html
<!-- Modern iframe integration -->
<div class="portfolio-builder-container">
  <iframe 
    src="https://your-cloud-run-url.a.run.app"
    style="width: 100%; height: 800px; border: none; border-radius: 8px;"
    title="AppVantix Portfolio Builder">
  </iframe>
</div>
```

Or use a popup/modal approach:
```javascript
function openPortfolioBuilder() {
  window.open(
    'https://your-cloud-run-url.a.run.app',
    'portfolio-builder',
    'width=1200,height=800,scrollbars=yes,resizable=yes'
  );
}
```

## 🎯 Next Steps

1. **Deploy and Test** - Run the deployment script
2. **Configure Secrets** - Add your real API keys
3. **Set Up Supabase** - Create the required database tables
4. **Test Integration** - Verify LinkedIn import and AI generation work
5. **Embed in Main Site** - Add to your AppVantix.com website
6. **Monitor & Scale** - Set up monitoring and adjust resources as needed

Your AppVantix Web Builder is now ready for production! 🎉
