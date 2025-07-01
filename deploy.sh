#!/bin/bash
# AppVantix Web Builder - Google Cloud Run Deployment Script

set -e

echo "🚀 Starting AppVantix Web Builder deployment to Google Cloud Run..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${1:-your-project-id}"
REGION="${2:-us-central1}"
SERVICE_NAME="appvantix-web-builder"
IMAGE_NAME="appvantix-web-builder"

if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo -e "${RED}❌ Error: Please provide your Google Cloud Project ID${NC}"
    echo "Usage: $0 <PROJECT_ID> [REGION]"
    echo "Example: $0 my-gcp-project us-central1"
    exit 1
fi

echo -e "${BLUE}📋 Configuration:${NC}"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service: $SERVICE_NAME"
echo "Image: $IMAGE_NAME"
echo ""

# Step 1: Authenticate and set project
echo -e "${YELLOW}🔐 Step 1: Setting up Google Cloud authentication...${NC}"
gcloud auth login --brief
gcloud config set project $PROJECT_ID

# Step 2: Enable required APIs
echo -e "${YELLOW}🔧 Step 2: Enabling required Google Cloud APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Step 3: Create Artifact Registry repository
echo -e "${YELLOW}📦 Step 3: Creating Artifact Registry repository...${NC}"
gcloud artifacts repositories create $IMAGE_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="AppVantix Web Builder container repository" \
    || echo "Repository might already exist, continuing..."

# Step 4: Configure Docker authentication
echo -e "${YELLOW}🐳 Step 4: Configuring Docker authentication...${NC}"
gcloud auth configure-docker $REGION-docker.pkg.dev

# Step 5: Build and push the container image
echo -e "${YELLOW}🏗️ Step 5: Building and pushing container image...${NC}"
docker build \
    --target bolt-ai-production \
    --tag $REGION-docker.pkg.dev/$PROJECT_ID/$IMAGE_NAME/$SERVICE_NAME:latest \
    --tag $REGION-docker.pkg.dev/$PROJECT_ID/$IMAGE_NAME/$SERVICE_NAME:$(git rev-parse --short HEAD) \
    .

docker push $REGION-docker.pkg.dev/$PROJECT_ID/$IMAGE_NAME/$SERVICE_NAME:latest
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$IMAGE_NAME/$SERVICE_NAME:$(git rev-parse --short HEAD)

# Step 6: Create secrets (you'll need to add the actual values)
echo -e "${YELLOW}🔐 Step 6: Creating secrets in Secret Manager...${NC}"
echo "Creating secrets (you'll need to update these with real values)..."

# Create placeholder secrets (update these with your actual values)
echo "placeholder-openai-key" | gcloud secrets create openai-api-key --data-file=- || echo "Secret exists"
echo "placeholder-anthropic-key" | gcloud secrets create anthropic-api-key --data-file=- || echo "Secret exists"
echo "https://your-supabase-project.supabase.co" | gcloud secrets create supabase-url --data-file=- || echo "Secret exists"
echo "placeholder-supabase-anon-key" | gcloud secrets create supabase-anon-key --data-file=- || echo "Secret exists"
echo "pk_test_placeholder" | gcloud secrets create stripe-publishable-key --data-file=- || echo "Secret exists"

# Step 7: Deploy to Cloud Run
echo -e "${YELLOW}🚀 Step 7: Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $REGION-docker.pkg.dev/$PROJECT_ID/$IMAGE_NAME/$SERVICE_NAME:latest \
    --region $REGION \
    --platform managed \
    --port 8080 \
    --memory 2Gi \
    --cpu 2 \
    --concurrency 80 \
    --max-instances 100 \
    --min-instances 1 \
    --execution-environment gen2 \
    --cpu-boost \
    --timeout 900 \
    --set-env-vars="NODE_ENV=production,VITE_LOG_LEVEL=info,VITE_APP_NAME=AppVantix Web Builder,VITE_ENABLE_PAYWALL=true" \
    --set-secrets="OPENAI_API_KEY=openai-api-key:latest,ANTHROPIC_API_KEY=anthropic-api-key:latest,SUPABASE_URL=supabase-url:latest,SUPABASE_ANON_KEY=supabase-anon-key:latest,STRIPE_PUBLISHABLE_KEY=stripe-publishable-key:latest" \
    --allow-unauthenticated

# Step 8: Get the service URL
echo -e "${YELLOW}🌐 Step 8: Getting service URL...${NC}"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --region $REGION \
    --format 'value(status.url)')

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Service URL: $SERVICE_URL${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Update secrets with your actual API keys:"
echo "   gcloud secrets versions add openai-api-key --data-file=<your-openai-key-file>"
echo "   gcloud secrets versions add anthropic-api-key --data-file=<your-anthropic-key-file>"
echo "   gcloud secrets versions add supabase-url --data-file=<your-supabase-url-file>"
echo "   gcloud secrets versions add supabase-anon-key --data-file=<your-supabase-key-file>"
echo "   gcloud secrets versions add stripe-publishable-key --data-file=<your-stripe-key-file>"
echo ""
echo "2. Test the deployment: curl $SERVICE_URL"
echo ""
echo "3. Set up custom domain (optional):"
echo "   gcloud run domain-mappings create --service $SERVICE_NAME --domain your-domain.com --region $REGION"
echo ""
echo "4. Monitor the service:"
echo "   gcloud run services logs tail $SERVICE_NAME --region $REGION"
echo ""
echo -e "${GREEN}🎉 Your AppVantix Web Builder is now live!${NC}"
