#!/bin/bash
# Generate Wrangler bindings for environment variables

BINDINGS=""

# Add environment variables as Wrangler bindings
if [ ! -z "$GROQ_API_KEY" ]; then
    BINDINGS="$BINDINGS --var GROQ_API_KEY:$GROQ_API_KEY"
fi

if [ ! -z "$OPENAI_API_KEY" ]; then
    BINDINGS="$BINDINGS --var OPENAI_API_KEY:$OPENAI_API_KEY"
fi

if [ ! -z "$ANTHROPIC_API_KEY" ]; then
    BINDINGS="$BINDINGS --var ANTHROPIC_API_KEY:$ANTHROPIC_API_KEY"
fi

if [ ! -z "$SUPABASE_URL" ]; then
    BINDINGS="$BINDINGS --var SUPABASE_URL:$SUPABASE_URL"
fi

if [ ! -z "$SUPABASE_ANON_KEY" ]; then
    BINDINGS="$BINDINGS --var SUPABASE_ANON_KEY:$SUPABASE_ANON_KEY"
fi

if [ ! -z "$STRIPE_PUBLISHABLE_KEY" ]; then
    BINDINGS="$BINDINGS --var STRIPE_PUBLISHABLE_KEY:$STRIPE_PUBLISHABLE_KEY"
fi

if [ ! -z "$VITE_LOG_LEVEL" ]; then
    BINDINGS="$BINDINGS --var VITE_LOG_LEVEL:$VITE_LOG_LEVEL"
fi

if [ ! -z "$DEFAULT_NUM_CTX" ]; then
    BINDINGS="$BINDINGS --var DEFAULT_NUM_CTX:$DEFAULT_NUM_CTX"
fi

# Load from .env.local if it exists
if [ -f ".env.local" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip comments and empty lines
        if [[ $line =~ ^[[:space:]]*# ]] || [[ -z "${line// }" ]]; then
            continue
        fi
        
        # Extract key=value pairs
        if [[ $line =~ ^([^=]+)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            
            # Remove quotes if present
            value="${value%\"}"
            value="${value#\"}"
            value="${value%\'}"
            value="${value#\'}"
            
            BINDINGS="$BINDINGS --var $key:$value"
        fi
    done < ".env.local"
fi

echo $BINDINGS
