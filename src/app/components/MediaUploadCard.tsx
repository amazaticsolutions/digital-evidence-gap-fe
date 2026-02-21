import {
  Video,
  Image as ImageIcon,
  Music,
  FileText,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface MediaFile {
  id: string;
  name: string;
  type: "video" | "image" | "audio" | "document";
  size: string;
  progress: number;
  status: "uploading" | "completed" | "error";
}

interface MediaUploadCardProps {
  file: MediaFile;
  onRemove: (id: string) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case "video":
      return Video;
    case "image":
      return ImageIcon;
    case "audio":
      return Music;
    default:
      return FileText;
  }
};

const getIconColor = (status: string) => {
  switch (status) {
    case "completed":
      return "text-black dark:text-white";
    case "error":
      return "text-red-500";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

export function MediaUploadCard({ file, onRemove }: MediaUploadCardProps) {
  const iconColor = getIconColor(file.status);

  const renderIcon = () => {
    const Icon = getIcon(file.type);
    return <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={1.5} />;
  };

  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-4 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
          {renderIcon()}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-black dark:text-white truncate">
                {file.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {file.size}
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {file.status === "uploading" && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  <span>{file.progress}%</span>
                </div>
              )}
              {file.status === "completed" && (
                <CheckCircle2
                  className="w-5 h-5 text-green-600 dark:text-green-500"
                  strokeWidth={2}
                />
              )}
              <button
                onClick={() => onRemove(file.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer"
              >
                <X
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {file.status === "uploading" && (
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white transition-all duration-300"
                style={{ width: `${file.progress}%` }}
              />
            </div>
          )}

          {file.status === "completed" && (
            <div className="text-xs text-green-600 dark:text-green-500 font-medium">
              Upload complete
            </div>
          )}

          {file.status === "error" && (
            <div className="text-xs text-red-500 dark:text-red-400 font-medium">
              Upload failed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
