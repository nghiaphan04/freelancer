"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Job, Page } from "@/types/job";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import JobCardWithPreview from "../cards/JobCardWithPreview";
import AdvancedJobsSearchBar from "../shared/AdvancedJobsSearchBar";
import JobsEmptyState from "../shared/JobsEmptyState";
import JobsError from "../shared/JobsError";
import Icon from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const JOBS_PER_PAGE = 9;

interface JobsListProps {
  initialCategory?: string;
}

export default function JobsList({ initialCategory }: JobsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState<Page<Job> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Unified search and filter state
  const [searchState, setSearchState] = useState({
    keyword: searchParams.get("keyword") || "",
    location: searchParams.get("location") || "",
    category: searchParams.get("category") || initialCategory || "",
    skills: searchParams.get("skills") || "", // Initialize skills from URL string
    selectedTags: [], // Don't use hidden selectedTags state, unify into skills string
    workType: searchParams.get("workType") || "",
  });

  const handleSearchChange = (key: string, value: string | string[]) => {
    setSearchState(prev => ({ ...prev, [key]: value }));
  };

  // Sync state with URL when it changes (for back/forward navigation)
  useEffect(() => {
    setSearchState({
      keyword: searchParams.get("keyword") || "",
      location: searchParams.get("location") || "",
      category: searchParams.get("category") || initialCategory || "",
      skills: searchParams.get("skills") || "",
      selectedTags: [],
      workType: searchParams.get("workType") || "",
    });
  }, [searchParams, initialCategory]);

  const currentPage = Math.max(0, parseInt(searchParams.get("page") || "0", 10));

  const fetchSavedJobIds = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.getSavedJobIds();
      if (response.status === "SUCCESS" && Array.isArray(response.data)) {
        setFavorites(new Set(response.data));
      }
    } catch {
    }
  }, [isAuthenticated]);

  const fetchJobs = useCallback(async (pageNum: number = 0) => {
    setIsLoading(true);
    setError(null);
    try {
      // Use URL search params for the actual fetch to ensure consistency with browser history
      const keyword = searchParams.get("keyword");
      const location = searchParams.get("location");
      const category = searchParams.get("category") || initialCategory;
      const skillsParam = searchParams.get("skills");
      const workType = searchParams.get("workType");
      
      const allSkills = skillsParam ? skillsParam.split(',').map(s => s.trim()).filter(Boolean) : [];
      
      let response;
      if (keyword || location || category || allSkills.length > 0 || workType) {
        // Call search API if we have search params
        const searchRequest = {
          page: pageNum,
          size: JOBS_PER_PAGE,
          sortBy: "createdAt",
          sortDir: "desc" as const,
          keyword: keyword || undefined,
          location: location || undefined,
          category: category || undefined,
          skills: allSkills.length > 0 ? allSkills : undefined,
          workType: workType || undefined
        };
        
        response = await api.searchJobs(searchRequest);
      } else {
        // Call regular getOpenJobs if no search params
        response = await api.getOpenJobs({ page: pageNum, size: JOBS_PER_PAGE, sortBy: "createdAt", sortDir: "desc" as const });
      }
      
      if (response.status === "SUCCESS" && response.data) {
        setJobs(response.data.content);
        setPage(response.data);
      } else {
        setError(response.message || "Không thể tải danh sách việc làm");
      }
    } catch (error) {
      console.error("Fetch jobs error:", error);
      setError("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, initialCategory]);

  useEffect(() => {
    fetchJobs(currentPage);
    fetchSavedJobIds();
  }, [currentPage, fetchJobs, fetchSavedJobIds]);

  const handlePageChange = (newPage: number) => {
    // Ensure newPage is a valid number
    const pageNum = Math.max(0, parseInt(String(newPage), 10));
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNum.toString());
    
    // Use pathname to maintain the correct route
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    
    // Only scroll when actually changing pages, not when searching
    if (pageNum !== currentPage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Don't scroll when just updating search params
      return;
    }
  };

  const handleFavorite = async (jobId: number) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu công việc");
      router.push("/login");
      return;
    }

    const isSaved = favorites.has(jobId);
    
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (isSaved) {
        newFavorites.delete(jobId);
      } else {
        newFavorites.add(jobId);
      }
      return newFavorites;
    });

    try {
      await api.toggleSaveJob(jobId);
      toast.success(isSaved ? "Đã bỏ lưu công việc" : "Đã lưu công việc");
    } catch {
      // Revert the optimistic update
      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (isSaved) {
          newFavorites.add(jobId);
        } else {
          newFavorites.delete(jobId);
        }
        return newFavorites;
      });
      toast.error("Có lỗi xảy ra khi lưu công việc");
    }
  };

  const renderPagination = () => {
    if (!page || page.totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const totalPages = page.totalPages;
    const current = page.number;

    pages.push(0);

    if (current > 2) {
      pages.push("...");
    }

    for (let i = Math.max(1, current - 1); i <= Math.min(totalPages - 2, current + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (current < totalPages - 3) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages - 1);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(current - 1)}
          disabled={page.first}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="chevron_left" size={20} className="text-gray-600" />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) =>
            typeof p === "string" ? (
              <span key={idx} className="px-2 text-gray-400">...</span>
            ) : (
              <button
                key={idx}
                onClick={() => handlePageChange(p)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                  p === current
                    ? "bg-[#00b14f] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p + 1}
              </button>
            )
          )}
        </div>

        <span className="text-gray-500 mx-2">/ {page.totalPages} trang</span>

        <button
          onClick={() => handlePageChange(current + 1)}
          disabled={page.last}
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="chevron_right" size={20} className="text-gray-600" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Search Bar (Top) */}
      <div className="mb-6">
        <AdvancedJobsSearchBar
          key="top-search"
          hideCategoryFilter
          showFilters={false}
          value={searchState}
          onChange={handleSearchChange}
          onSearch={() => fetchJobs(0)}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters (Left) */}
        <div className="w-full lg:w-[340px] shrink-0 h-fit">
          <div className="lg:sticky lg:top-20">
            <AdvancedJobsSearchBar
              key="sidebar-filters"
              showSearchBar={false}
              value={searchState}
              onChange={handleSearchChange}
              onSearch={() => fetchJobs(0)}
            />
          </div>
        </div>

        {/* Jobs Content (Right) */}
        <div className="flex-1 min-w-0">
          {/* Results Info */}
          {!isLoading && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {searchParams.toString() ? (
                  <>
                    Tìm thấy <span className="font-semibold text-[#00b14f]">{page?.totalElements || 0}</span> việc làm
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-[#00b14f]">{page?.totalElements || 0}</span> việc làm đang tuyển
                  </>
                )}
              </p>
            </div>
          )}

          {/* Jobs Grid */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 9 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
                  <div className="flex gap-2 sm:gap-3">
                    <Skeleton className="w-24 h-16 sm:w-32 sm:h-20 md:w-40 md:h-24 lg:w-52 lg:h-32 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-3 sm:h-4 w-3/4 mb-2" />
                      <Skeleton className="h-2.5 sm:h-3 w-1/2 mb-1" />
                      <Skeleton className="h-2.5 sm:h-3 w-full mb-1" />
                      <Skeleton className="h-2.5 sm:h-3 w-2/3 mb-2 sm:mb-3" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-md" />
                        <Skeleton className="h-5 sm:h-6 w-12 sm:w-16 rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <JobsError message={error} onRetry={() => fetchJobs(currentPage)} />
          ) : jobs.length === 0 ? (
            <JobsEmptyState
              title="Không tìm thấy việc làm"
              message={searchParams.toString() ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm" : "Hiện chưa có việc làm nào đang tuyển"}
            />
          ) : (
            <>
              <div className="space-y-3">
                {jobs.map((job) => (
                  <JobCardWithPreview
                    key={job.id}
                    job={job}
                    onFavorite={handleFavorite}
                    isFavorite={favorites.has(job.id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
