import {
  Video,
  Image as ImageIcon,
  Mic,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  getEvidenceFiles,
  deleteEvidenceFile,
} from "../../services/chatWorkspace.service";

export interface EvidenceFile {
  id: string;
  name: string;
  type: "video" | "image" | "audio";
  uploadDate: string;
  uploadTime: string;
  thumbnail?: string;
}

interface EvidenceListProps {
  onBack: () => void;
  onFileClick?: (file: EvidenceFile) => void;
}

export function EvidenceList({ onBack, onFileClick }: EvidenceListProps) {
  const [activeTab, setActiveTab] = useState<"videos" | "images" | "audios">(
    "videos",
  );
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);

  // Fetch evidence files when tab changes
  useEffect(() => {
    const mediaType =
      activeTab === "videos"
        ? "video"
        : activeTab === "images"
          ? "image"
          : "audio";

    let isMounted = true;

    getEvidenceFiles(mediaType).then((res) => {
      if (res.success && isMounted) {
        setEvidenceFiles(res.data);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  // Handle evidence file deletion
  const handleDeleteEvidence = async (evidenceId: string) => {
    const res = await deleteEvidenceFile(evidenceId);
    if (res.success) {
      // Remove from local state
      setEvidenceFiles((prev) => prev.filter((f) => f.id !== evidenceId));
    } else {
      alert(res.message || "Failed to delete evidence file");
    }
  };

  // Group evidence by date
  const groupEvidenceByDate = (files: EvidenceFile[]) => {
    const grouped: { [key: string]: EvidenceFile[] } = {};
    files.forEach((file) => {
      if (!grouped[file.uploadDate]) {
        grouped[file.uploadDate] = [];
      }
      grouped[file.uploadDate].push(file);
    });
    return grouped;
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50 dark:bg-[#0e0e0e]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button and Tabs - Single Row */}
        <div className="flex items-center justify-between">
          {/* Back Button - Left Side */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            <span className="font-medium">Back to Chat</span>
          </button>

          {/* Tabs - Right Side */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-1.5 inline-flex gap-1 shadow-md border border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "videos"
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-md"
                  : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" strokeWidth={2} />
                <span>Videos</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("images")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "images"
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-md"
                  : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" strokeWidth={2} />
                <span>Images</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("audios")}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "audios"
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-md"
                  : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4" strokeWidth={2} />
                <span>Audios</span>
              </div>
            </button>
          </div>
        </div>

        {/* Evidence Files */}
        <div className="space-y-4">
          {Object.entries(groupEvidenceByDate(evidenceFiles)).map(
            ([date, files]) => (
              <div key={date} className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  {date}
                </h3>
                {files.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => onFileClick?.(file)}
                    className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200 dark:border-gray-800">
                        {file.type === "video" && (
                          <Video
                            className="w-6 h-6 text-gray-600 dark:text-gray-400"
                            strokeWidth={2}
                          />
                        )}
                        {file.type === "image" && (
                          <ImageIcon
                            className="w-6 h-6 text-gray-600 dark:text-gray-400"
                            strokeWidth={2}
                          />
                        )}
                        {file.type === "audio" && (
                          <Mic
                            className="w-6 h-6 text-gray-600 dark:text-gray-400"
                            strokeWidth={2}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black dark:text-white mb-2">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span>{file.uploadTime}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvidence(file.id);
                        }}
                        className="p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors group cursor-pointer"
                      >
                        <Trash2
                          className="w-4.5 h-4.5 text-gray-400 group-hover:text-red-600 transition-colors"
                          strokeWidth={2}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
