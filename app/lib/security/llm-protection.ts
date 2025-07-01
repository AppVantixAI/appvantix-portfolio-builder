/**
 * LLM Security & Anti-Tampering Module
 * Prevents users from manipulating AI prompts and settings
 */

export interface LLMSecurityConfig {
  enableRateLimiting: boolean;
  maxRequestsPerHour: number;
  maxTokensPerRequest: number;
  allowedModels: string[];
  protectedPrompts: boolean;
  enableContentFiltering: boolean;
}

export interface SecurePrompt {
  id: string;
  name: string;
  content: string;
  locked: boolean;
  hash: string;
}

// Protected system prompts that cannot be modified by users
export const PROTECTED_PROMPTS: Record<string, SecurePrompt> = {
  LINKEDIN_PARSER: {
    id: 'linkedin_parser',
    name: 'LinkedIn Profile Parser',
    content: `You are an expert LinkedIn profile parser for AppVantix Web Builder. 
Your task is to extract and structure LinkedIn profile data into a standardized format.

STRICT RULES:
1. Only extract factual information present in the profile
2. Do not add fictional or speculative content
3. Maintain professional tone and accuracy
4. Focus on career highlights, skills, and achievements
5. Respect privacy - exclude personal contact information
6. Output structured JSON only

Extract: name, headline, summary, experience, education, skills, certifications, languages.
Format as clean, professional portfolio content.`,
    locked: true,
    hash: 'sha256:linkedin_parser_v1.0'
  },

  PORTFOLIO_GENERATOR: {
    id: 'portfolio_generator', 
    name: 'Portfolio Website Generator',
    content: `You are AppVantix Web Builder AI, an expert portfolio website creator.
Create professional, modern portfolio websites from LinkedIn profile data.

REQUIREMENTS:
1. Generate clean, responsive HTML/CSS/JS
2. Use modern web standards and best practices
3. Ensure mobile-first responsive design
4. Include proper semantic HTML structure
5. Implement accessibility standards (WCAG 2.1)
6. Use provided template framework only
7. Never include external dependencies without approval
8. Maintain AppVantix branding guidelines

FORBIDDEN:
- No malicious code or security vulnerabilities
- No external API calls without permission
- No user tracking scripts
- No copyright violations
- No inappropriate content

Focus on: clean design, fast loading, SEO optimization, professional presentation.`,
    locked: true,
    hash: 'sha256:portfolio_generator_v1.0'
  },

  TEMPLATE_CUSTOMIZER: {
    id: 'template_customizer',
    name: 'Template Customization AI',
    content: `You are a template customization specialist for AppVantix Web Builder.
Modify portfolio templates based on user preferences while maintaining quality.

GUIDELINES:
1. Preserve template structure and functionality
2. Apply color schemes, fonts, and layouts as requested
3. Ensure design consistency and visual hierarchy
4. Maintain responsive behavior across devices
5. Keep loading performance optimized
6. Follow brand guidelines when specified
7. Test all interactive elements
8. Validate CSS and HTML output

RESTRICTIONS:
- No breaking changes to core functionality
- No removal of required elements
- No addition of unapproved third-party resources
- No security vulnerabilities in generated code`,
    locked: true,
    hash: 'sha256:template_customizer_v1.0'
  }
};

export class LLMSecurityService {
  private config: LLMSecurityConfig;
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(config: LLMSecurityConfig) {
    this.config = config;
  }

  /**
   * Validate and secure user prompt input
   */
  validatePrompt(userPrompt: string, userId: string): { valid: boolean; sanitized?: string; error?: string } {
    try {
      // Check for prompt injection attempts
      const injectionPatterns = [
        /ignore\s+previous\s+instructions/i,
        /forget\s+everything\s+above/i,
        /you\s+are\s+now\s+a/i,
        /system\s*:\s*/i,
        /assistant\s*:\s*/i,
        /\/\*[\s\S]*?\*\//g, // Block comments
        /<script[\s\S]*?<\/script>/gi,
        /javascript:/i,
        /data:text\/html/i,
        /eval\s*\(/i,
        /function\s*\(/i,
      ];

      for (const pattern of injectionPatterns) {
        if (pattern.test(userPrompt)) {
          return {
            valid: false,
            error: 'Prompt contains potentially harmful content. Please rephrase your request.'
          };
        }
      }

      // Length validation
      if (userPrompt.length > 4000) {
        return {
          valid: false,
          error: 'Prompt too long. Please keep requests under 4000 characters.'
        };
      }

      // Content filtering
      if (this.config.enableContentFiltering) {
        const inappropriateContent = this.detectInappropriateContent(userPrompt);
        if (inappropriateContent) {
          return {
            valid: false,
            error: 'Prompt contains inappropriate content. Please revise your request.'
          };
        }
      }

      // Sanitize the prompt
      const sanitized = this.sanitizePrompt(userPrompt);

      return { valid: true, sanitized };
    } catch (error) {
      return {
        valid: false,
        error: 'Error validating prompt. Please try again.'
      };
    }
  }

  /**
   * Check rate limiting for user
   */
  checkRateLimit(userId: string): { allowed: boolean; resetTime?: number } {
    if (!this.config.enableRateLimiting) {
      return { allowed: true };
    }

    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    const userLimit = this.rateLimitStore.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize limit
      this.rateLimitStore.set(userId, {
        count: 1,
        resetTime: now + hourMs
      });
      return { allowed: true };
    }

    if (userLimit.count >= this.config.maxRequestsPerHour) {
      return {
        allowed: false,
        resetTime: userLimit.resetTime
      };
    }

    // Increment count
    userLimit.count++;
    return { allowed: true };
  }

  /**
   * Get protected prompt by ID
   */
  getProtectedPrompt(promptId: string): SecurePrompt | null {
    const prompt = PROTECTED_PROMPTS[promptId];
    if (!prompt) return null;

    // Verify prompt integrity
    if (this.config.protectedPrompts && !this.verifyPromptIntegrity(prompt)) {
      throw new Error('Protected prompt integrity check failed');
    }

    return prompt;
  }

  /**
   * Combine user prompt with protected system prompt
   */
  buildSecurePrompt(promptId: string, userInput: string, context?: any): string {
    const systemPrompt = this.getProtectedPrompt(promptId);
    if (!systemPrompt) {
      throw new Error(`Protected prompt '${promptId}' not found`);
    }

    const contextStr = context ? `\n\nContext: ${JSON.stringify(context, null, 2)}` : '';
    
    return `${systemPrompt.content}${contextStr}\n\nUser Request: ${userInput}`;
  }

  /**
   * Validate model selection
   */
  validateModel(modelId: string): boolean {
    return this.config.allowedModels.includes(modelId);
  }

  /**
   * Sanitize user prompt input
   */
  private sanitizePrompt(prompt: string): string {
    return prompt
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
      .trim();
  }

  /**
   * Detect inappropriate content
   */
  private detectInappropriateContent(text: string): boolean {
    const inappropriatePatterns = [
      /\b(hack|exploit|vulnerability)\b/i,
      /\b(malware|virus|trojan)\b/i,
      /\b(steal|theft|fraud)\b/i,
      // Add more patterns as needed
    ];

    return inappropriatePatterns.some(pattern => pattern.test(text));
  }

  /**
   * Verify protected prompt integrity
   */
  private verifyPromptIntegrity(prompt: SecurePrompt): boolean {
    // In production, implement proper hash verification
    // For now, just check if the prompt exists and is locked
    return prompt.locked && prompt.hash.startsWith('sha256:');
  }

  /**
   * Log security events
   */
  logSecurityEvent(userId: string, event: string, details: any) {
    console.log(`[SECURITY] User: ${userId}, Event: ${event}`, details);
    // In production, send to proper logging service
  }
}

// Factory function
export function createLLMSecurityService(env: any): LLMSecurityService {
  const config: LLMSecurityConfig = {
    enableRateLimiting: env.ENABLE_RATE_LIMITING !== 'false',
    maxRequestsPerHour: parseInt(env.MAX_REQUESTS_PER_HOUR || '50'),
    maxTokensPerRequest: parseInt(env.MAX_TOKENS_PER_REQUEST || '4000'),
    allowedModels: (env.ALLOWED_MODELS || 'gpt-4,claude-3-sonnet,claude-3-haiku').split(','),
    protectedPrompts: env.PROTECT_PROMPTS !== 'false',
    enableContentFiltering: env.ENABLE_CONTENT_FILTERING !== 'false',
  };

  return new LLMSecurityService(config);
}

// Middleware helper for routes
export async function secureAIRequest(
  userId: string, 
  promptId: string, 
  userPrompt: string, 
  modelId: string,
  env: any
): Promise<{ secure: boolean; prompt?: string; error?: string }> {
  const security = createLLMSecurityService(env);

  // Check rate limiting
  const rateLimit = security.checkRateLimit(userId);
  if (!rateLimit.allowed) {
    return {
      secure: false,
      error: `Rate limit exceeded. Try again after ${new Date(rateLimit.resetTime!).toLocaleTimeString()}`
    };
  }

  // Validate model
  if (!security.validateModel(modelId)) {
    security.logSecurityEvent(userId, 'invalid_model', { modelId });
    return {
      secure: false,
      error: 'Selected AI model is not allowed'
    };
  }

  // Validate and sanitize prompt
  const validation = security.validatePrompt(userPrompt, userId);
  if (!validation.valid) {
    security.logSecurityEvent(userId, 'prompt_validation_failed', { 
      reason: validation.error,
      prompt: userPrompt.substring(0, 100) 
    });
    return {
      secure: false,
      error: validation.error
    };
  }

  try {
    // Build secure prompt
    const securePrompt = security.buildSecurePrompt(promptId, validation.sanitized!);
    return {
      secure: true,
      prompt: securePrompt
    };
  } catch (error) {
    security.logSecurityEvent(userId, 'prompt_build_failed', { 
      promptId, 
      error: (error as Error).message 
    });
    return {
      secure: false,
      error: 'Failed to build secure prompt'
    };
  }
}
