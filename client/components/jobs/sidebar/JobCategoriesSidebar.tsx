"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  description?: string;
  jobCount?: number;
}

export default function JobCategoriesSidebar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const currentCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getCategoriesWithJobCounts();
        if (response.status === "SUCCESS" && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Không thể tải danh mục");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleMouseEnterCategory = (categoryId: number) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setHoveredCategory(categoryId);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 300);
  };

  const handleMouseEnterDropdown = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  return (
    <div
      className="relative z-50"
      onMouseLeave={handleMouseLeave}
    >
      {/* Sidebar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-visible relative">
        {/* Categories List */}
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="px-4 py-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : currentCategories.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <Icon name="work_off" size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Chưa có danh mục nào</p>
            </div>
          ) : (
            currentCategories.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => handleMouseEnterCategory(category.id)}
              >
                <Link
                  href={`/jobs?category=${category.id}`}
                  className={`flex items-center justify-between px-4 py-3 transition-colors group ${
                    hoveredCategory === category.id ? "bg-[#00b14f]/5 text-[#00b14f]" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm truncate block ${
                      hoveredCategory === category.id ? "text-[#00b14f] font-medium" : "text-gray-700 group-hover:text-[#00b14f]"
                    }`}>
                      {category.name}
                    </span>
                    {category.jobCount !== undefined && (
                      <span className="text-xs text-gray-500">
                        {category.jobCount} việc làm
                      </span>
                    )}
                  </div>
                  <Icon name="chevron_right" size={18} className={`shrink-0 ${
                    hoveredCategory === category.id ? "text-[#00b14f]" : "text-gray-400"
                  }`} />
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Pagination - only show when not loading and has categories */}
        {!isLoading && categories.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">{currentPage}/{totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name="chevron_left" size={18} className="text-gray-500" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name="chevron_right" size={18} className="text-gray-500" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Simplified Hover Dropdown */}
      {hoveredCategory && !isLoading && (
        <div
          className="absolute left-full top-0 pl-3 z-[9999] hidden lg:block"
          onMouseEnter={handleMouseEnterDropdown}
        >
          <div className="w-[280px] bg-white rounded-xl shadow-xl border border-gray-200 animate-in fade-in-0 slide-in-from-left-2 duration-200">
            {(() => {
              const category = categories.find((c) => c.id === hoveredCategory);
              if (!category) return null;
              return (
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Icon name="work" size={18} className="text-[#00b14f]" />
                    {category.name}
                  </h4>
                  {category.description && (
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  )}
                  {category.jobCount !== undefined && (
                    <p className="text-sm text-[#00b14f] font-medium mb-3">
                      {category.jobCount} việc làm đang tuyển
                    </p>
                  )}
                  <div className="flex justify-end pt-3 border-t border-gray-100">
                    <Link
                      href={`/jobs?category=${category.id}`}
                      className="inline-flex items-center gap-1 text-sm text-[#00b14f] hover:underline font-medium"
                    >
                      Xem tất cả
                      <Icon name="arrow_forward" size={16} />
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
