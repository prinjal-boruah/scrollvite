// Centralized API utilities

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

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
 * API: Buy template and create invite instance
 */
export async function buyTemplate(templateId: string) {
  const res = await fetch(`${API_BASE_URL}/api/buy/${templateId}/`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to purchase template");
  }

  return res.json();
}