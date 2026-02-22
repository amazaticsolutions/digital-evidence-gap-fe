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
    // Backend returns { success: true, ...doc } where doc is a Mongoose document,
    // which includes both `_id` (ObjectId) and virtual `id` (string). Use _id as fallback.
    const newCase: Case = {
      id: response.data.id || String(response.data._id),
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
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "An unexpected error occurred while creating case",
    };
  }
}

// ─── POST /evidence/gdrive/upload ────────────────────────────────────────────

export interface EvidenceUploadResult {
  success: boolean;
  evidence_id: string | null;
  filename: string;
  file_size: number;
  media_type: string;
  duration: number | null;
  storage_type: string;
  gdrive_file_id: string | null;
  gdrive_url: string | null;
  status: string;
  error?: string;
}

export interface UploadEvidenceResponse {
  batch_id: string;
  total_files: number;
  successful_uploads: number;
  failed_uploads: number;
  evidence_ids: string[];
  results: EvidenceUploadResult[];
}

/**
 * Upload evidence files directly to Google Drive and link them to a case.
 *
 * Sends a multipart/form-data POST to POST /evidence/gdrive/upload.
 * Each File in `files` is appended under the `files` field key.
 *
 * @param caseId  - The ID of the newly created case to associate evidence with.
 * @param files   - Actual File objects selected by the user.
 * @param camId   - Camera identifier (defaults to "default").
 *
 * Real API endpoint: POST ${BASE_URL}${API_ENDPOINTS.EVIDENCE.GDRIVE_UPLOAD}
 */
const generateCamId = (): string =>
  `CAM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

export async function uploadEvidenceToGDrive(
  caseId: string,
  files: File[],
  camId: string = generateCamId(),
): Promise<ApiResponse<UploadEvidenceResponse>> {
  try {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("cam_id", camId);
    formData.append("case_id", caseId);

    console.log("[CasesService] uploadEvidenceToGDrive:", {
      caseId,
      fileCount: files.length,
      fileNames: files.map((f) => f.name),
      url: `${BASE_URL}${API_ENDPOINTS.EVIDENCE.GDRIVE_UPLOAD}`,
    });

    // Do NOT set Content-Type manually — axios sets it automatically with the
    // correct multipart/form-data boundary when the body is a FormData instance.
    const response = await axios.post(
      `${BASE_URL}${API_ENDPOINTS.EVIDENCE.GDRIVE_UPLOAD}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_USER_TOKEN}`,
        },
      },
    );

    console.log("[CasesService] uploadEvidenceToGDrive success:", response.data);

    return { data: response.data as UploadEvidenceResponse, success: true };
  } catch (error) {
    console.error("[CasesService] Error uploading evidence to GDrive:", {
      error,
      caseId,
      message: error instanceof Error ? error.message : "Unknown error",
      response: axios.isAxiosError(error) ? error.response?.data : undefined,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });

    return {
      data: {} as UploadEvidenceResponse,
      success: false,
      message:
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error
          : "An unexpected error occurred while uploading evidence",
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
