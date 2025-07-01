/**
 * LinkedIn Profile Import Service
 * Handles parsing and structuring LinkedIn data for portfolio generation
 */

export interface LinkedInProfile {
  personal: {
    name: string;
    headline: string;
    location: string;
    summary: string;
    profileImage?: string;
  };
  contact: {
    email?: string;
    phone?: string;
    website?: string;
    linkedin: string;
  };
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  languages: Language[];
  projects: Project[];
  volunteer: VolunteerExperience[];
}

export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
  skills: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  activities: string[];
  description?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Language {
  name: string;
  proficiency: 'elementary' | 'limited' | 'professional' | 'full' | 'native';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  startDate: string;
  endDate?: string;
  skills: string[];
  teamSize?: number;
}

export interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  cause: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export class LinkedInImportService {
  /**
   * Parse LinkedIn profile text or JSON data
   */
  async parseProfile(profileData: string, format: 'text' | 'json' = 'text'): Promise<LinkedInProfile> {
    try {
      if (format === 'json') {
        return this.parseJSONProfile(JSON.parse(profileData));
      } else {
        return this.parseTextProfile(profileData);
      }
    } catch (error) {
      throw new Error(`Failed to parse LinkedIn profile: ${(error as Error).message}`);
    }
  }

  /**
   * Parse structured JSON LinkedIn data
   */
  private parseJSONProfile(data: any): LinkedInProfile {
    return {
      personal: {
        name: data.name || data.fullName || '',
        headline: data.headline || data.title || '',
        location: data.location || data.address || '',
        summary: data.summary || data.about || '',
        profileImage: data.profilePicture || data.image || data.avatar,
      },
      contact: {
        email: data.email,
        phone: data.phone,
        website: data.website || data.personalWebsite,
        linkedin: data.linkedinUrl || data.profileUrl || '',
      },
      experience: this.parseExperience(data.experience || data.workExperience || []),
      education: this.parseEducation(data.education || []),
      skills: this.parseSkills(data.skills || []),
      certifications: this.parseCertifications(data.certifications || []),
      languages: this.parseLanguages(data.languages || []),
      projects: this.parseProjects(data.projects || []),
      volunteer: this.parseVolunteer(data.volunteer || data.volunteering || []),
    };
  }

  /**
   * Parse unstructured text LinkedIn data using AI
   */
  private async parseTextProfile(text: string): Promise<LinkedInProfile> {
    // This would typically use the LLM to parse unstructured text
    // For now, we'll implement basic text parsing
    
    const sections = this.splitIntoSections(text);
    
    return {
      personal: this.extractPersonalInfo(sections),
      contact: this.extractContactInfo(sections),
      experience: this.extractExperience(sections),
      education: this.extractEducation(sections),
      skills: this.extractSkills(sections),
      certifications: this.extractCertifications(sections),
      languages: this.extractLanguages(sections),
      projects: this.extractProjects(sections),
      volunteer: this.extractVolunteer(sections),
    };
  }

  /**
   * Split profile text into recognizable sections
   */
  private splitIntoSections(text: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const sectionHeaders = [
      'experience', 'education', 'skills', 'certifications', 
      'projects', 'volunteer', 'about', 'summary'
    ];

    let currentSection = 'header';
    let currentContent = '';

    const lines = text.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase().trim();
      
      // Check if this line is a section header
      const foundSection = sectionHeaders.find(header => 
        lowerLine.includes(header) && line.length < 50
      );

      if (foundSection) {
        // Save previous section
        if (currentContent.trim()) {
          sections[currentSection] = currentContent.trim();
        }
        
        currentSection = foundSection;
        currentContent = '';
      } else {
        currentContent += line + '\n';
      }
    }

    // Save last section
    if (currentContent.trim()) {
      sections[currentSection] = currentContent.trim();
    }

    return sections;
  }

  /**
   * Extract personal information from text
   */
  private extractPersonalInfo(sections: Record<string, string>): LinkedInProfile['personal'] {
    const header = sections.header || '';
    const about = sections.about || sections.summary || '';

    // Basic name extraction (first non-empty line)
    const lines = header.split('\n').filter(line => line.trim());
    const name = lines[0]?.trim() || '';
    const headline = lines[1]?.trim() || '';

    return {
      name,
      headline,
      location: this.extractLocation(header),
      summary: about,
    };
  }

  /**
   * Extract contact information
   */
  private extractContactInfo(sections: Record<string, string>): LinkedInProfile['contact'] {
    const text = Object.values(sections).join('\n');
    
    return {
      email: this.extractEmail(text),
      phone: this.extractPhone(text),
      website: this.extractWebsite(text),
      linkedin: this.extractLinkedInUrl(text),
    };
  }

  /**
   * Parse experience from various formats
   */
  private parseExperience(experienceData: any[]): WorkExperience[] {
    return experienceData.map((exp, index) => ({
      id: `exp_${index}`,
      company: exp.company || exp.companyName || '',
      title: exp.title || exp.position || exp.role || '',
      location: exp.location || '',
      startDate: this.normalizeDate(exp.startDate || exp.from),
      endDate: this.normalizeDate(exp.endDate || exp.to),
      current: exp.current || exp.isCurrent || false,
      description: exp.description || exp.summary || '',
      achievements: this.extractAchievements(exp.description || ''),
      skills: exp.skills || [],
    }));
  }

  /**
   * Parse education from various formats
   */
  private parseEducation(educationData: any[]): Education[] {
    return educationData.map((edu, index) => ({
      id: `edu_${index}`,
      institution: edu.institution || edu.school || edu.university || '',
      degree: edu.degree || edu.degreeType || '',
      field: edu.field || edu.fieldOfStudy || edu.major || '',
      startDate: this.normalizeDate(edu.startDate || edu.from),
      endDate: this.normalizeDate(edu.endDate || edu.to),
      gpa: edu.gpa || edu.grade,
      activities: edu.activities || [],
      description: edu.description || '',
    }));
  }

  /**
   * Parse skills from various formats
   */
  private parseSkills(skillsData: any[]): string[] {
    if (Array.isArray(skillsData)) {
      return skillsData.map(skill => 
        typeof skill === 'string' ? skill : skill.name || skill.skill || ''
      ).filter(Boolean);
    }
    return [];
  }

  /**
   * Parse certifications
   */
  private parseCertifications(certData: any[]): Certification[] {
    return certData.map((cert, index) => ({
      id: `cert_${index}`,
      name: cert.name || cert.title || '',
      issuer: cert.issuer || cert.organization || cert.company || '',
      issueDate: this.normalizeDate(cert.issueDate || cert.date),
      expiryDate: this.normalizeDate(cert.expiryDate),
      credentialId: cert.credentialId || cert.id,
      credentialUrl: cert.credentialUrl || cert.url,
    }));
  }

  /**
   * Parse languages
   */
  private parseLanguages(langData: any[]): Language[] {
    return langData.map(lang => ({
      name: typeof lang === 'string' ? lang : lang.name || lang.language || '',
      proficiency: lang.proficiency || 'professional',
    }));
  }

  /**
   * Parse projects
   */
  private parseProjects(projectData: any[]): Project[] {
    return projectData.map((proj, index) => ({
      id: `proj_${index}`,
      name: proj.name || proj.title || '',
      description: proj.description || proj.summary || '',
      url: proj.url || proj.link || proj.website,
      startDate: this.normalizeDate(proj.startDate || proj.from),
      endDate: this.normalizeDate(proj.endDate || proj.to),
      skills: proj.skills || proj.technologies || [],
      teamSize: proj.teamSize,
    }));
  }

  /**
   * Parse volunteer experience
   */
  private parseVolunteer(volunteerData: any[]): VolunteerExperience[] {
    return volunteerData.map((vol, index) => ({
      id: `vol_${index}`,
      organization: vol.organization || vol.company || '',
      role: vol.role || vol.position || vol.title || '',
      cause: vol.cause || vol.area || '',
      startDate: this.normalizeDate(vol.startDate || vol.from),
      endDate: this.normalizeDate(vol.endDate || vol.to),
      description: vol.description || vol.summary || '',
    }));
  }

  /**
   * Helper methods for text extraction
   */
  private extractLocation(text: string): string {
    const locationPattern = /(?:located|based|from)\s+(?:in\s+)?([^,\n]+(?:,\s*[^,\n]+)*)/i;
    const match = text.match(locationPattern);
    return match ? match[1].trim() : '';
  }

  private extractEmail(text: string): string | undefined {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailPattern);
    return match ? match[0] : undefined;
  }

  private extractPhone(text: string): string | undefined {
    const phonePattern = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
    const match = text.match(phonePattern);
    return match ? match[0] : undefined;
  }

  private extractWebsite(text: string): string | undefined {
    const websitePattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    const match = text.match(websitePattern);
    return match ? match[0] : undefined;
  }

  private extractLinkedInUrl(text: string): string {
    const linkedinPattern = /https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/;
    const match = text.match(linkedinPattern);
    return match ? match[0] : '';
  }

  private extractExperience(sections: Record<string, string>): WorkExperience[] {
    const experienceText = sections.experience || '';
    if (!experienceText) return [];

    // Basic experience parsing - in production, use AI for better results
    const experiences: WorkExperience[] = [];
    const jobBlocks = experienceText.split(/\n\s*\n/).filter(block => block.trim());

    jobBlocks.forEach((block, index) => {
      const lines = block.split('\n').map(line => line.trim());
      if (lines.length >= 2) {
        experiences.push({
          id: `exp_${index}`,
          title: lines[0],
          company: lines[1],
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: lines.slice(2).join(' '),
          achievements: [],
          skills: [],
        });
      }
    });

    return experiences;
  }

  private extractEducation(sections: Record<string, string>): Education[] {
    const educationText = sections.education || '';
    if (!educationText) return [];

    const education: Education[] = [];
    const eduBlocks = educationText.split(/\n\s*\n/).filter(block => block.trim());

    eduBlocks.forEach((block, index) => {
      const lines = block.split('\n').map(line => line.trim());
      if (lines.length >= 2) {
        education.push({
          id: `edu_${index}`,
          institution: lines[0],
          degree: lines[1],
          field: '',
          startDate: '',
          endDate: '',
          activities: [],
        });
      }
    });

    return education;
  }

  private extractSkills(sections: Record<string, string>): string[] {
    const skillsText = sections.skills || '';
    if (!skillsText) return [];

    return skillsText
      .split(/[,\n•·]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }

  private extractCertifications(sections: Record<string, string>): Certification[] {
    return []; // Implement as needed
  }

  private extractLanguages(sections: Record<string, string>): Language[] {
    return []; // Implement as needed
  }

  private extractProjects(sections: Record<string, string>): Project[] {
    return []; // Implement as needed
  }

  private extractVolunteer(sections: Record<string, string>): VolunteerExperience[] {
    return []; // Implement as needed
  }

  private extractAchievements(description: string): string[] {
    // Extract bullet points or achievements from description
    const achievementPatterns = [
      /(?:^|\n)[•·*-]\s*(.+)/gm,
      /(?:achieved|accomplished|delivered|increased|decreased|improved|reduced)\s+([^.]+)/gi,
    ];

    const achievements: string[] = [];
    
    for (const pattern of achievementPatterns) {
      const matches = description.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          achievements.push(match[1].trim());
        }
      }
    }

    return achievements;
  }

  private normalizeDate(dateStr: any): string {
    if (!dateStr) return '';
    
    if (typeof dateStr === 'string') {
      // Try to parse various date formats
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      }
    }

    return String(dateStr);
  }

  /**
   * Validate and sanitize imported profile data
   */
  validateProfile(profile: LinkedInProfile): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!profile.personal.name) {
      errors.push('Name is required');
    }

    if (!profile.personal.headline) {
      errors.push('Professional headline is required');
    }

    if (profile.experience.length === 0) {
      errors.push('At least one work experience entry is required');
    }

    // Validate experience entries
    profile.experience.forEach((exp, index) => {
      if (!exp.company || !exp.title) {
        errors.push(`Experience entry ${index + 1} is missing company or title`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clean and optimize profile data for portfolio generation
   */
  optimizeForPortfolio(profile: LinkedInProfile): LinkedInProfile {
    return {
      ...profile,
      personal: {
        ...profile.personal,
        summary: this.optimizeSummary(profile.personal.summary),
      },
      experience: profile.experience
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 10), // Limit to 10 most recent experiences
      skills: profile.skills.slice(0, 20), // Limit to top 20 skills
      projects: profile.projects.slice(0, 6), // Limit to 6 featured projects
    };
  }

  private optimizeSummary(summary: string): string {
    if (!summary) return '';
    
    // Remove excessive whitespace and format for web display
    return summary
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }
}

// Export factory function
export function createLinkedInImportService(): LinkedInImportService {
  return new LinkedInImportService();
}
