/**
 * Cases Service
 *
 * Wraps all case-related API calls.  Currently returns static demo data so the
 * UI works end-to-end without a real backend.
 *
 * When the real API is ready:
 *   1. Remove the demo-data imports at the top.
 *   2. Replace each function body with a real `fetch` / axios call using the
 *      endpoint constants from `api.constants.ts`.
 *   3. Keep the same return-type signatures so the components need zero changes.
 */

export interface CasesInterface {
  id: string;
  case_id: string;
  title: string;
  description: string;
  user_id: number;
  assigned_to_user_id: number | null;
  assigned_at: string | null;
  evidence_count: number;
  evidence_ids: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

import axios from "axios";
import { BASE_URL, API_ENDPOINTS } from "../constants/api.constants";
import { type DemoCase as Case } from "../constants/pastCases.constants";

// ── Shared response wrapper ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// ─── GET /cases ──────────────────────────────────────────────────────────────

/**
 * Fetch all cases.
 *
 * Demo behaviour: merges user-created cases from localStorage with the seeded
 * demo cases, mirroring what the real endpoint would return.
 *
 * Real API endpoint: GET ${BASE_URL}${API_ENDPOINTS.CASES.GET_ALL}
 */
export async function getCases(): Promise<ApiResponse<CasesInterface[]>> {
  try {
    const response = await axios.get(
      `${BASE_URL}${API_ENDPOINTS.CASES.GET_ALL}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_USER_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log(response.data);

    return { data: response.data.cases as CasesInterface[], success: true };
  } catch (error) {
    console.error("[CasesService] Unexpected error:", error);
    return {
      data: [],
      success: false,
      message: "An unexpected error occurred while fetching cases",
    };
  }
}

// ─── GET /cases/:id ──────────────────────────────────────────────────────────

/**
 * Fetch a single case by ID.
 *
 * Real API endpoint: GET ${BASE_URL}${API_ENDPOINTS.CASES.GET_BY_ID(id)}
 */
export async function getCaseById(
  id: string,
): Promise<ApiResponse<Case | null>> {
  console.log("[CasesService] Starting getCaseById request...", {
    url: `${BASE_URL}${API_ENDPOINTS.CASES.GET_BY_ID(id)}`,
    caseId: id,
    baseUrl: BASE_URL,
    token: import.meta.env.VITE_USER_TOKEN ? "Token present" : "No token",
  });

  try {
    const response = await axios.get(
      `${BASE_URL}${API_ENDPOINTS.CASES.GET_BY_ID(id)}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_USER_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("[CasesService] getCaseById success:", response.data);

    // Map API response to Case format
    const caseData: Case = {
      id: response.data.id,
      title: response.data.title,
      description: response.data.description,
      mediaCount: response.data.evidence_count || 0,
      uploadProgress: 100,
      status:
        response.data.status === "active" ? "completed" : response.data.status,
      createdAt: response.data.created_at,
    };

    return { data: caseData, success: true };
  } catch (error) {
    console.error("[CasesService] Error fetching case by ID:", {
      error,
      caseId: id,
      message: error instanceof Error ? error.message : "Unknown error",
      response: axios.isAxiosError(error) ? error.response?.data : undefined,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });

    // Return null for 404 errors (case not found)
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { data: null, success: false, message: "Case not found" };
    }

    return {
      data: null,
      success: false,
      message:
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "An unexpected error occurred while fetching case",
    };
  }
}

// ─── POST /cases ─────────────────────────────────────────────────────────────

export interface CreateCasePayload {
  title: string;
  description: string;
  mediaCount: number;
  uploadProgress: number;
}

/**
 * Create a new case and persist it locally (demo: localStorage).
 *
 * Real API endpoint: POST ${BASE_URL}${API_ENDPOINTS.CASES.CREATE}
 */
export async function createCase(
  payload: CreateCasePayload,
): Promise<ApiResponse<Case>> {
  try {
    const response = await axios.post(
      `${BASE_URL}${API_ENDPOINTS.CASES.CREATE}`,
      {
        title: payload.title,
        description: payload.description,
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_USER_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("[CasesService] createCase success:", response.data);

    // Map API response to Case format
    const newCase: Case = {
      id: response.data.id,
      title: response.data.title,
      description: response.data.description,
      mediaCount: response.data.evidence_count || 0,
      uploadProgress: 100,
      status:
        response.data.status === "active" ? "completed" : response.data.status,
      createdAt: response.data.created_at,
    };

    return { data: newCase, success: true };
  } catch (error) {
    console.error("[CasesService] Error creating case:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      response: axios.isAxiosError(error) ? error.response?.data : undefined,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });

    return {
      data: {} as Case,
      success: false,
      message:
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "An unexpected error occurred while creating case",
    };
  }
}

// ─── DELETE /cases/:id ───────────────────────────────────────────────────────

/**
 * Delete a case by ID.
 *
 * Real API endpoint: DELETE ${BASE_URL}${API_ENDPOINTS.CASES.DELETE(id)}
 */
export async function deleteCase(id: string): Promise<ApiResponse<null>> {
  // TODO: replace with →
  //   const res = await fetch(`${BASE_URL}${API_ENDPOINTS.CASES.DELETE(id)}`, { method: 'DELETE' });
  console.debug(
    "[CasesService] DELETE",
    `${BASE_URL}${API_ENDPOINTS.CASES.DELETE(id)}`,
  );

  const existing: Case[] = JSON.parse(localStorage.getItem("cases") || "[]");
  localStorage.setItem(
    "cases",
    JSON.stringify(existing.filter((c) => c.id !== id)),
  );

  return { data: null, success: true };
}
