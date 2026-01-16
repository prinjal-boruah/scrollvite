// Centralized API utilities

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Get auth headers with token
 */
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("access");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem("access");
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
  const userRaw = localStorage.getItem("user");
  return userRaw ? JSON.parse(userRaw) : null;
}

/**
 * Extract hero image from schema - finds first image URL in hero section
 */
export function getHeroImage(schema: any): string | null {
  if (!schema?.hero) return null;
  
  const hero = schema.hero;
  
  // Check common image field names
  const imageFields = ['couple_photo', 'photo', 'image', 'hero_image', 'background', 'picture'];
  
  for (const field of imageFields) {
    if (hero[field] && typeof hero[field] === 'string' && hero[field].startsWith('http')) {
      return hero[field];
    }
  }
  
  // If no common fields found, iterate through all properties to find a URL
  for (const key in hero) {
    if (typeof hero[key] === 'string' && hero[key].startsWith('http') && 
        (hero[key].includes('/media/') || hero[key].includes('http'))) {
      return hero[key];
    }
  }
  
  return null;
}

/**
 * API: Fetch categories
 */
export async function fetchCategories() {
  const res = await fetch(`${API_BASE_URL}/api/categories/`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
}

/**
 * API: Fetch templates by category
 */
export async function fetchTemplatesByCategory(categorySlug: string) {
  const res = await fetch(`${API_BASE_URL}/api/templates/${categorySlug}/`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch templates");
  }

  return res.json();
}

/**
 * API: Fetch template details (for preview)
 */
export async function fetchTemplateDetail(templateId: string) {
  const res = await fetch(`${API_BASE_URL}/api/template-editor/${templateId}/`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch template");
  }

  return res.json();
}

/**
 * API: Fetch user's purchased templates
 */
export async function fetchMyTemplates() {
  const res = await fetch(`${API_BASE_URL}/api/my-templates/`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch my templates");
  }

  return res.json();
}

/**
 * API: Fetch invite instance for editing (user-owned)
 */
export async function fetchInviteInstance(inviteId: string) {
  const res = await fetch(`${API_BASE_URL}/api/invites/${inviteId}/`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch invite");
  }

  return res.json();
}

/**
 * API: Save invite instance schema (user-owned)
 */
export async function saveInviteInstance(inviteId: string, schema: any) {
  const res = await fetch(`${API_BASE_URL}/api/invites/${inviteId}/`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ schema }),
  });

  if (!res.ok) {
    throw new Error("Failed to save invite");
  }

  return res.json();
}

/**
 * API: Fetch template for admin editing
 */
export async function fetchTemplate(templateId: string) {
  const res = await fetch(`${API_BASE_URL}/api/template-editor/${templateId}/`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch template");
  }

  return res.json();
}

/**
 * API: Save template (admin only)
 */
export async function saveTemplate(templateId: string, schema: any, isPublished?: boolean) {
  const body: any = { schema };
  if (isPublished !== undefined) {
    body.is_published = isPublished;
  }

  const res = await fetch(`${API_BASE_URL}/api/template-save/${templateId}/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Failed to save template");
  }

  return res.json();
}

/**
 * API: Fetch public invite (no auth required)
 */
export async function fetchPublicInvite(slug: string) {
  const res = await fetch(`${API_BASE_URL}/api/invite/${slug}/`);

  if (!res.ok) {
    throw new Error("Failed to fetch invite");
  }

  return res.json();
}

/**
 * API: Google Login
 */
export async function googleLogin(idToken: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/google/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }

  return res.json();
}

/**
 * API: Upload image for invite instance
 */
export async function uploadInviteImage(inviteId: string, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  
  const token = localStorage.getItem("access");
  
  const res = await fetch(
    `${API_BASE_URL}/api/invites/${inviteId}/upload-image/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData, // Don't set Content-Type - browser sets it with boundary
    }
  );
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload image");
  }
  
  return res.json(); // Returns { url: "...", filename: "..." }
}

/**
 * API: Upload default image for template (admin only)
 */
export async function uploadTemplateImage(templateId: string, file: File) {
  const formData = new FormData();
  formData.append('image', file);
  
  const token = localStorage.getItem("access");
  
  const res = await fetch(
    `${API_BASE_URL}/api/template-upload-image/${templateId}/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to upload image");
  }
  
  return res.json();
}

/**
 * Fetch preview templates for homepage (PUBLIC - no auth required)
 * Returns max 5 templates where is_published=True AND is_preview=True
 */
export async function fetchPreviewTemplates() {
  const response = await fetch(`${API_URL}/api/preview-templates/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch preview templates");
  }

  return response.json();
}

/**
 * Fetch single template for demo preview (PUBLIC - no auth required)
 * Only works for templates with is_preview=True
 */
export async function fetchTemplatePreview(templateId: string | number) {
  const response = await fetch(`${API_URL}/api/template-preview/${templateId}/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Template not found or not available for preview");
    }
    throw new Error("Failed to fetch template preview");
  }

  return response.json();
}