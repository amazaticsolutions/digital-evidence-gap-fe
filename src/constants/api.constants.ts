/**
 * API Configuration
 *
 * BASE_URL  – swap to the real backend origin before going to production.
 * All endpoint helpers are pure functions so path params stay type-safe.
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const API_ENDPOINTS = {
  // ── Cases ────────────────────────────────────────────────────────────────
  CASES: {
    /** GET  /cases  – list all cases */
    GET_ALL: "/search/cases",
    /** GET  /cases/:id  – single case detail */
    GET_BY_ID: (id: string) => `/search/cases/${id}`,

    /** POST /cases  – create a new case */
    CREATE: "/search/cases",

    /** PUT  /cases/:id  – update an existing case */
    UPDATE: (id: string) => `/search/cases/${id}`,

    /** DELETE /cases/:id  – delete a case */
    DELETE: (id: string) => `/search/cases/${id}`,
  },

  // ── Chat / Messages ───────────────────────────────────────────────────────
  CHAT: {
    /** GET  /chat/case/:caseId/  – fetch conversation history and case metadata */
    GET_MESSAGES: (caseId: string) => `/chat/case/${caseId}/`,

    /** POST /chat/case/:caseId/message/  – send a new message */
    SEND_MESSAGE: (caseId: string) => `/chat/case/${caseId}/message/`,
  },

  // ── Evidence Files ────────────────────────────────────────────────────────
  EVIDENCE: {
    /** GET  /evidence/videos/?media_type=video|image|audio  – list all evidence files by type */
    GET_ALL: (mediaType?: "video" | "image" | "audio") =>
      `/evidence/videos/${mediaType ? `?media_type=${mediaType}` : ""}`,

    /** POST /evidence/cases/upload/  – upload files to case (multipart/form-data) */
    UPLOAD: "/evidence/cases/upload/",

    /** DELETE /evidence/videos/:videoId/  – remove an evidence file */
    DELETE: (videoId: string) => `/evidence/videos/${videoId}/`,

    /** POST /evidence/gdrive/upload  – upload files directly to Google Drive (single or batch) */
    GDRIVE_UPLOAD: "/evidence/gdrive/upload",
  },
} as const;
