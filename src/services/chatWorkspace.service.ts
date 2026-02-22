/**
 * ChatWorkspace Service
 *
 * Wraps all chat-message and evidence-file API calls.
 */

import axios from "axios";
import { BASE_URL, API_ENDPOINTS } from "../constants/api.constants";
import { getCaseById } from "./cases.service";
import {
  MOCK_EVIDENCE_FILES,
  CASE_META,
  DEFAULT_CASE_META,
  type EvidenceFile,
} from "../constants/chatWorkspace.constants";

// ── Shared response wrapper ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// ── Message types (updated to match API response) ───────────────────────────

export interface MediaItem {
  type: "image" | "video" | "audio";
  url: string;
  description?: string;
  // Optional fields from upload for sending to API
  filename?: string;
  file_size?: number;
  evidence_id?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  media?: MediaItem[];
  // Legacy fields for backward compatibility
  type?: "user" | "ai";
  sources?: Array<{
    filename: string;
    cameraId: string;
    timestamp: string;
    date: string;
  }>;
  table?: {
    headers: string[];
    rows: Array<{ date: string; time: string; description: string }>;
  };
}

// ── Types re-exported for convenience ────────────────────────────────────────

export type { EvidenceFile };

export interface CaseMeta {
  title: string;
  evidenceCount: string;
  description?: string;
}

export interface ChatResponse {
  case_id: string;
  case_name: string;
  case_description: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    media?: MediaItem[];
  }>;
}

// ─── GET /chat/case/:caseId/ ─────────────────────────────────────────────────

/**
 * Fetch the conversation history for a given case.
 *
 * Real API endpoint: GET ${BASE_URL}/api/chat/case/${caseId}/
 */
export async function getMessages(
  caseId: string,
): Promise<ApiResponse<Message[]>> {
  try {
    const response = await axios.get<ChatResponse>(
      `${BASE_URL}${API_ENDPOINTS.CHAT.GET_MESSAGES(caseId)}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_USER_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("[ChatService] getMessages success:", response.data);

    // Transform API messages to include legacy 'type' field for compatibility
    const messages: Message[] = response.data.messages.map((msg) => ({
      ...msg,
      type: msg.role === "user" ? "user" : "ai",
    }));

    return { data: messages, success: true };
  } catch (error) {
    console.error("[ChatService] Error fetching messages:", {
      error,
      caseId,
      message: error instanceof Error ? error.message : "Unknown error",
      response: axios.isAxiosError(error) ? error.response?.data : undefined,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });

    return {
      data: [],
      success: false,
      message:
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "An unexpected error occurred while fetching messages",
    };
  }
}

// ─── POST /cases/:caseId/messages ────────────────────────────────────────────

export interface SendMessagePayload {
  content: string;
  media?: MediaItem[];
}

// API request format for sending messages
interface SendMessageApiRequest {
  content: string;
  role: "user";
  media?: Array<{
    type: "video" | "image" | "audio";
    url: string;
    filename: string;
    description?: string;
    file_size: number;
    evidence_id: string;
  }>;
}

// API response format for sent messages
interface SendMessageApiResponse {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  media?: MediaItem[];
}

/**
 * Send a user message and receive the AI reply.
 *
 * Real API endpoint: POST ${BASE_URL}/api/chat/case/${caseId}/message/
 */
export async function sendMessage(
  caseId: string,
  payload: SendMessagePayload,
): Promise<ApiResponse<Message>> {
  try {
    // Transform MediaItem[] to API format with required fields
    const apiMedia = payload.media?.map((item) => ({
      type: item.type,
      url: item.url,
      filename: item.filename || item.url.split("/").pop() || "unknown",
      description: item.description,
      file_size: item.file_size || 0,
      evidence_id: item.evidence_id || "",
    }));

    const requestBody: SendMessageApiRequest = {
      content: payload.content,
      role: "user",
      media: apiMedia,
    };

    const response = await axios.post<SendMessageApiResponse>(
      `${BASE_URL}${API_ENDPOINTS.CHAT.SEND_MESSAGE(caseId)}`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_USER_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("[ChatService] sendMessage success:", response.data);

    // Transform API response to Message format
    const message: Message = {
      id: response.data.id,
      role: response.data.role,
      type: response.data.role === "user" ? "user" : "ai",
      content: response.data.content,
      timestamp: response.data.timestamp,
      media: response.data.media,
    };

    return { data: message, success: true };
  } catch (error) {
    console.error("[ChatService] sendMessage failed:", error);

    // Fallback to local message creation on error
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      type: "user",
      content: payload.content,
      timestamp: new Date().toISOString(),
      media: payload.media,
    };

    return {
      data: userMessage,
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

// ─── POST /api/evidence/cases/upload/ ────────────────────────────────────────

export interface UploadedFile {
  evidence_id: string;
  filename: string;
  file_size: number;
  media_type: "video" | "image" | "audio";
  gdrive_file_id: string;
  gdrive_url: string;
  cam_id?: string;
  gps_lat?: number;
  gps_lng?: number;
  uploaded_at: string;
}

export interface UploadResponse {
  success: boolean;
  case_id: string;
  case_title: string;
  total_files: number;
  successful_uploads: number;
  failed_uploads: number;
  uploaded_files: UploadedFile[];
  failed_files: Array<{ filename: string; error: string }>;
}

/**
 * Upload files to a case and get Google Drive URLs
 *
 * Real API endpoint: POST ${BASE_URL}/api/evidence/cases/upload/
 */
export async function uploadFiles(
  caseId: string,
  files: File[],
  metadata?: {
    cam_id?: string;
    gps_lat?: number;
    gps_lng?: number;
  },
): Promise<ApiResponse<UploadResponse>> {
  try {
    const formData = new FormData();
    formData.append("case_id", caseId);

    // Append all files
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Append optional metadata
    if (metadata?.cam_id) {
      formData.append("cam_id", metadata.cam_id);
    }
    if (metadata?.gps_lat !== undefined) {
      formData.append("gps_lat", metadata.gps_lat.toString());
    }
    if (metadata?.gps_lng !== undefined) {
      formData.append("gps_lng", metadata.gps_lng.toString());
    }

    const response = await axios.post<UploadResponse>(
      `${BASE_URL}${API_ENDPOINTS.EVIDENCE.UPLOAD}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_USER_TOKEN}`,
          // Don't set Content-Type, let axios set it with boundary for multipart
        },
      },
    );

    console.log("[ChatService] uploadFiles success:", response.data);

    return { data: response.data, success: true };
  } catch (error) {
    console.error("[ChatService] Error uploading files:", {
      error,
      caseId,
      message: error instanceof Error ? error.message : "Unknown error",
      response: axios.isAxiosError(error) ? error.response?.data : undefined,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });

    return {
      data: {} as UploadResponse,
      success: false,
      message:
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "An unexpected error occurred while uploading files",
    };
  }
}

// ─── GET /api/evidence/videos/ ───────────────────────────────────────────────

// API response format for evidence list
interface EvidenceApiFile {
  id: string;
  filename: string;
  media_type: "video" | "image" | "audio";
  uploaded_at: string;
  file_size: number;
  gdrive_url?: string;
  thumbnail_url?: string;
}

interface GetEvidenceResponse {
  success: boolean;
  total_count: number;
  videos: EvidenceApiFile[];
}

/**
 * Fetch the list of evidence files filtered by media type.
 *
 * Real API endpoint: GET ${BASE_URL}/api/evidence/videos/?media_type={type}
 */
export async function getEvidenceFiles(
  mediaType?: "video" | "image" | "audio",
): Promise<ApiResponse<EvidenceFile[]>> {
  try {
    const response = await axios.get<GetEvidenceResponse>(
      `${BASE_URL}${API_ENDPOINTS.EVIDENCE.GET_ALL(mediaType)}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_USER_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("[ChatService] getEvidenceFiles success:", response.data);

    // Transform API response to EvidenceFile format
    const evidenceFiles: EvidenceFile[] = response.data.videos.map((file) => {
      const uploadDate = new Date(file.uploaded_at);
      return {
        id: file.id,
        name: file.filename,
        type: file.media_type,
        uploadDate: uploadDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        uploadTime: uploadDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        thumbnail: file.thumbnail_url,
      };
    });

    return { data: evidenceFiles, success: true };
  } catch (error) {
    console.error("[ChatService] Error fetching evidence files:", {
      error,
      mediaType,
      message: error instanceof Error ? error.message : "Unknown error",
      response: axios.isAxiosError(error) ? error.response?.data : undefined,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });

    // Fallback to mock data on error
    return {
      data: MOCK_EVIDENCE_FILES.filter(
        (file) => !mediaType || file.type === mediaType,
      ),
      success: false,
      message:
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "An unexpected error occurred while fetching evidence files",
    };
  }
}

// ─── DELETE /api/evidence/videos/:videoId/ ────────────────────────────────────

interface DeleteEvidenceResponse {
  success: boolean;
  message: string;
}

/**
 * Delete a single evidence file.
 *
 * Real API endpoint: DELETE ${BASE_URL}/api/evidence/videos/${videoId}/
 */
export async function deleteEvidenceFile(
  videoId: string,
): Promise<ApiResponse<null>> {
  try {
    const response = await axios.delete<DeleteEvidenceResponse>(
      `${BASE_URL}${API_ENDPOINTS.EVIDENCE.DELETE(videoId)}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_USER_TOKEN}`,
        },
      },
    );

    console.log("[ChatService] deleteEvidenceFile success:", response.data);

    return { data: null, success: true, message: response.data.message };
  } catch (error) {
    console.error("[ChatService] Error deleting evidence file:", {
      error,
      videoId,
      message: error instanceof Error ? error.message : "Unknown error",
      response: axios.isAxiosError(error) ? error.response?.data : undefined,
      status: axios.isAxiosError(error) ? error.response?.status : undefined,
    });

    return {
      data: null,
      success: false,
      message:
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "An unexpected error occurred while deleting evidence file",
    };
  }
}

// ─── GET case metadata (title + evidence count) ───────────────────────────────

/**
 * Resolve display metadata for a case (title, evidence count label).
 * Uses the chat API response for case metadata.
 */
export async function getCaseMeta(
  caseId: string,
): Promise<ApiResponse<CaseMeta>> {
  try {
    const response = await axios.get<ChatResponse>(
      `${BASE_URL}${API_ENDPOINTS.CHAT.GET_MESSAGES(caseId)}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_USER_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("[ChatService] getCaseMeta success:", response.data);

    return {
      data: {
        title: response.data.case_name,
        evidenceCount: `${response.data.messages.length} messages`,
        description: response.data.case_description,
      },
      success: true,
    };
  } catch (error) {
    console.error("[ChatService] Error fetching case meta:", {
      error,
      caseId,
    });

    // Fallback: Try to get from cases API
    const realCaseRes = await getCaseById(caseId);
    if (realCaseRes.success && realCaseRes.data) {
      return {
        data: {
          title: realCaseRes.data.title,
          evidenceCount: `${realCaseRes.data.mediaCount} analyzed`,
        },
        success: true,
      };
    }

    // Final fallback to constants
    const meta = CASE_META[caseId] ?? DEFAULT_CASE_META;
    return { data: meta, success: true };
  }
}
