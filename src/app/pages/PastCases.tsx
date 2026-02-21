import {
  Search,
  Clock,
  CheckCircle2,
  Loader2,
  ExternalLink,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getCases } from "../../services/cases.service";
import type { DemoCase as Case } from "../../constants/pastCases.constants";

export function PastCases() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCases = async () => {
      try {
        setIsLoading(true);
        const response = await getCases();
        if (response.success) {
          console.log(response.data);
          setCases(response.data);
        } else {
          setError("Failed to load cases.");
        }
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    loadCases();
  }, []);

  const filteredCases = cases.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCaseClick = (case_: Case) => {
    if (case_.status === "completed") {
      navigate(`/case/${case_.id}`);
    }
  };

  const getStatusBadge = (case_: Case) => {
    if (case_.status === "processing") {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
          <Loader2
            className="w-3.5 h-3.5 text-amber-600 animate-spin"
            strokeWidth={2}
          />
          <span className="text-xs font-medium text-amber-900">
            Processing {case_.uploadProgress}%
          </span>
        </div>
      );
    }
    if (case_.status === "completed") {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2
            className="w-3.5 h-3.5 text-green-600"
            strokeWidth={2}
          />
          <span className="text-xs font-medium text-green-900">Completed</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg">
        <span className="text-xs font-medium text-red-900">Failed</span>
      </div>
    );
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2
            className="w-8 h-8 animate-spin text-gray-400 dark:text-gray-500"
            strokeWidth={1.5}
          />
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="max-w-7xl mx-auto p-8">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Main content */}
      {!isLoading && !error && (
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-semibold text-black dark:text-white mb-2">
                  Past Cases
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  View and manage all investigation cases
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-black dark:text-white">
                  {cases.length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Cases
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
                strokeWidth={2}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cases..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Cases Table */}
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                <div className="col-span-4">Case Title</div>
                <div className="col-span-2">Evidence</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Action</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100 dark:divide-gray-900">
              {filteredCases.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-gray-800">
                    <FileText
                      className="w-8 h-8 text-gray-400 dark:text-gray-500"
                      strokeWidth={1.5}
                    />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                    No cases found
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery
                      ? "Try adjusting your search"
                      : "Create your first case to get started"}
                  </p>
                </div>
              ) : (
                filteredCases.map((case_) => (
                  <div
                    key={case_.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                      case_.status === "completed"
                        ? "cursor-pointer"
                        : "cursor-default"
                    }`}
                    onClick={() => handleCaseClick(case_)}
                  >
                    {/* Case Title */}
                    <div className="col-span-4">
                      <p className="font-medium text-black dark:text-white mb-1">
                        {case_.title}
                      </p>
                      {case_.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {case_.description}
                        </p>
                      )}
                    </div>

                    {/* Evidence Count */}
                    <div className="col-span-2 flex items-center">
                      <div className="flex items-center gap-2">
                        <FileText
                          className="w-4 h-4 text-gray-400 dark:text-gray-500"
                          strokeWidth={2}
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {case_.mediaCount} files
                        </span>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="col-span-2 flex items-center">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(case_.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(case_.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center">
                      {getStatusBadge(case_)}
                    </div>

                    {/* Action */}
                    <div className="col-span-2 flex items-center">
                      {case_.status === "completed" ? (
                        <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-900 dark:hover:bg-gray-100 transition-colors text-sm font-medium">
                          <span>Open</span>
                          <ExternalLink
                            className="w-3.5 h-3.5"
                            strokeWidth={2}
                          />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          Processing...
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Processing Info */}
          {cases.some((c) => c.status === "processing") && (
            <div className="mt-6 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex gap-3">
                <Clock
                  className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                <div>
                  <p className="text-sm text-amber-900 dark:text-amber-300 font-medium mb-1">
                    Cases Processing
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    Some cases are still processing. They will automatically
                    become available once upload completes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
