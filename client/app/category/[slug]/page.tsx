"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Job } from "@/types/job";
import { Category } from "@/types/category";
import JobsList from "@/components/jobs/lists/JobsList";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";



export default function CategoryJobsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // Fetch category by slug
        const response = await api.getCategoriesWithDetailsAndJobCounts();
        if (response.status !== "SUCCESS" || !response.data) {
          setError("Không thể tải thông tin danh mục");
          return;
        }

        const foundCategory = response.data.find(cat => 
          cat.name.toLowerCase().replace(/\s+/g, '-') === slug
        );
        
        if (!foundCategory) {
          setError("Danh mục không tồn tại");
          return;
        }
        
        setCategory(foundCategory);
      } catch (error) {
        console.error("Failed to fetch category:", error);
        setError("Không thể tải thông tin danh mục");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryData();
    }
  }, [slug]);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mb-6">
              <Icon name="error" size={64} className="text-gray-400 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || "Danh mục không tồn tại"}
            </h1>
            <p className="text-gray-600 mb-6">
              Danh mục bạn tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <Button onClick={handleBack} variant="outline">
              <Icon name="arrow_back" size={18} className="mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              <Icon name="arrow_back" size={18} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category.name}
              </h1>
              <p className="text-gray-600">
                {category.jobCount || 0} việc làm có sẵn
              </p>
            </div>
          </div>
          
          {/* Category Description */}
          {category.subCategories && category.subCategories.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Danh mục con:</h3>
              <div className="flex flex-wrap gap-2">
                {category.subCategories.map((sub) => (
                  <span
                    key={sub.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200"
                  >
                    {sub.name}
                    {sub.tags && sub.tags.length > 0 && (
                      <span className="ml-1 text-gray-400">({sub.tags.length})</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Popular Tags */}
          {category.popularTags && category.popularTags.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags phổ biến:</h3>
              <div className="flex flex-wrap gap-2">
                {category.popularTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#00b14f]/10 text-[#00b14f] border border-[#00b14f]/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Tất cả việc làm trong {category.name}
          </h2>
          <p className="text-gray-600">
            Khám phá các cơ hội việc làm phù hợp với chuyên môn của bạn
          </p>
        </div>
        
        <JobsList initialCategory={category.id.toString()} />
      </div>
    </div>
  );
}
