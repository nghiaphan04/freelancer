"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import JobLocationSelect from "@/components/ui/JobLocationSelect";
import { Category } from "@/types/category";

interface SearchParams {
  keyword?: string;
  location?: string;
  category?: string;
  skills?: string[];
  workType?: string;
}

interface AdvancedJobsSearchBarProps {
  onSearch?: (params: SearchParams) => void;
  hideCategoryFilter?: boolean;
  showSearchBar?: boolean;
  showFilters?: boolean;
  
  // Controlled props
  value?: {
    keyword: string;
    location: string;
    category: string;
    skills: string;
    selectedTags: string[];
    workType: string;
  };
  onChange?: (key: string, value: string | string[]) => void;
}

export default function AdvancedJobsSearchBar({
  onSearch,
  hideCategoryFilter = false,
  showSearchBar = true,
  showFilters = true,
  value,
  onChange,
}: AdvancedJobsSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Local state fallbacks if not controlled
  const [localKeyword, setLocalKeyword] = useState(searchParams.get("keyword") || "");
  const [localLocation, setLocalLocation] = useState(searchParams.get("location") || "");
  const [localSelectedCategory, setLocalSelectedCategory] = useState(searchParams.get("category") || "");
  const [localSkills, setLocalSkills] = useState(searchParams.get("skills") || "");
  const [localWorkType, setLocalWorkType] = useState(searchParams.get("workType") || "");

  // Use values from props or local state
  const keyword = value ? value.keyword : localKeyword;
  const location = value ? value.location : localLocation;
  const selectedCategory = value ? value.category : localSelectedCategory;
  const skills = value ? value.skills : localSkills;
  const workType = value ? value.workType : localWorkType;

  // Selected tags for highlighting (derived from skills string)
  const selectedTags = skills.split(',').map(s => s.trim()).filter(Boolean);

  // Setters that handle either controlled or local state
  const setKeywordValue = (val: string) => {
    if (onChange) onChange("keyword", val);
    else setLocalKeyword(val);
  };
  const setLocationValue = (val: string) => {
    if (onChange) onChange("location", val);
    else setLocalLocation(val);
  };
  const setSelectedCategoryValue = (val: string) => {
    if (onChange) onChange("category", val);
    else setLocalSelectedCategory(val);
  };
  const setSelectedTagsValue = (val: string[] | ((prev: string[]) => string[])) => {
    // Redundant because we unify into skills string
    const currentTags = selectedTags;
    const newTags = typeof val === 'function' ? val(currentTags) : val;
    setSkillsValue(newTags.join(', '));
  };
  const setSkillsValue = (val: string) => {
    if (onChange) onChange("skills", val);
    else setLocalSkills(val);
  };
  const setWorkTypeValue = (val: string | ((prev: string) => string)) => {
    if (onChange) {
      const newVal = typeof val === 'function' ? val(workType) : val;
      onChange("workType", newVal);
    } else {
      setLocalWorkType(val);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getCategoriesWithDetailsAndJobCounts();
        if (response.status === "SUCCESS" && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (keyword.trim()) params.append("keyword", keyword.trim());

    if (location.trim()) params.append("location", location.trim());
    
    if (selectedCategory) params.append("category", selectedCategory);
    
    // Use skills string directly (already deduplicated by logic or kept as is)
    const trimmedSkills = skills.split(',').map(s => s.trim()).filter(Boolean);
    const deduplicatedSkills = Array.from(new Set(trimmedSkills));
    
    if (deduplicatedSkills.length > 0) {
      params.append("skills", deduplicatedSkills.join(', '));
    }
    
    if (workType) params.append("workType", workType);
    
    const queryString = params.toString();
    const url = queryString ? `/jobs?${queryString}` : "/jobs";
    
    router.push(url, { scroll: false });
    
    if (onSearch) {
      onSearch({
        keyword: keyword.trim() || undefined,
        location: location.trim() || undefined,
        category: selectedCategory || undefined,
        skills: deduplicatedSkills.length > 0 ? deduplicatedSkills : undefined,
        workType: workType || undefined,
      });
    }
  };

  const handleClear = () => {
    setKeywordValue("");
    setLocationValue("");
    setSelectedCategoryValue("");
    setSelectedTagsValue([]);
    setSkillsValue("");
    setWorkTypeValue("");
    router.push("/jobs", { scroll: false });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryValue(categoryId);
    setSelectedTagsValue([]);
    setSkillsValue("");
  };

  const hasActiveFilters = keyword || location || selectedCategory || selectedTags.length > 0 || skills || workType;

  const selectedCategoryData = categories.find((c) => c.id.toString() === selectedCategory);

  // Get popular tags and regular tags separately
  const getPopularTags = (): string[] => {
    if (!selectedCategoryData) return [];
    // Use popularTags from API if available
    if (selectedCategoryData.popularTags && selectedCategoryData.popularTags.length > 0) {
      return selectedCategoryData.popularTags;
    }
    // Otherwise compute from subCategories.tags with isPopular
    const popularTags: string[] = [];
    selectedCategoryData.subCategories?.forEach((sub: { tags?: { isPopular?: boolean; name: string }[] }) => {
      sub.tags?.forEach((tag: { isPopular?: boolean; name: string }) => {
        if (tag.isPopular && !popularTags.includes(tag.name)) {
          popularTags.push(tag.name);
        }
      });
    });
    return popularTags;
  };

  const getRegularTags = (): string[] => {
    if (!selectedCategoryData) return [];
    const regularTags: string[] = [];
    selectedCategoryData.subCategories?.forEach((sub: { tags?: { isPopular?: boolean; name: string }[] }) => {
      sub.tags?.forEach((tag: { isPopular?: boolean; name: string }) => {
        if (!tag.isPopular && !regularTags.includes(tag.name)) {
          regularTags.push(tag.name);
        }
      });
    });
    return regularTags;
  };

  const popularTags = getPopularTags();
  const regularTags = getRegularTags();

  const toggleWorkType = (value: string) => {
    setWorkTypeValue((prev) => (prev === value ? "" : value));
  };

  const toggleTag = (tag: string) => {
    const isSelected = selectedTags.some(t => t.toLowerCase() === tag.toLowerCase());
    let newSkills: string;
    
    if (isSelected) {
      // Remove tag
      newSkills = selectedTags
        .filter(t => t.toLowerCase() !== tag.toLowerCase())
        .join(', ');
    } else {
      // Add tag
      const currentSkills = skills.trim();
      newSkills = currentSkills ? `${currentSkills}, ${tag}` : tag;
    }
    
    setSkillsValue(newSkills);
  };

  return (
    <>
      {showSearchBar && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="search-input"
                type="text"
                value={keyword}
                onChange={(e) => setKeywordValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Tìm kiếm việc làm theo tên, kỹ năng..."
                className="h-12 w-full pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00b14f] focus:ring-2 focus:ring-[#00b14f]/20 transition-all"
              />
            </div>
            <Button onClick={handleSearch} className="bg-[#00b14f] hover:bg-[#00a045] text-white px-6 h-12">
              Tìm kiếm
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={handleClear} className="text-gray-500 hover:text-gray-700 h-12">
                <Icon name="clear" size={18} />
              </Button>
            )}
          </div>
        </div>
      )}

      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col gap-4">
            {/* Category + Tags */}
            {!hideCategoryFilter && (
              <div>
                <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00b14f] transition-all"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Popular Tags */}
                {popularTags.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags phổ biến</label>
                    <div className="flex flex-wrap gap-2">
                      {popularTags.map((tag, idx) => (
                        <button
                          key={`popular-${tag}-${idx}`}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors border ${
                            selectedTags.includes(tag)
                              ? "bg-[#00b14f] text-white border-[#00b14f]"
                              : "bg-white text-gray-700 border-gray-300 hover:border-[#00b14f] hover:bg-gray-50"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Tags */}
                {regularTags.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags khác</label>
                    <div className="flex flex-wrap gap-2">
                      {regularTags.map((tag, idx) => (
                        <button
                          key={`regular-${tag}-${idx}`}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedTags.includes(tag)
                              ? "bg-[#00b14f] text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Skills */}
            <div>
              <label htmlFor="skills-input" className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng</label>
              <input
                id="skills-input"
                type="text"
                value={skills}
                onChange={(e) => setSkillsValue(e.target.value)}
                placeholder="React, Node.js, Python... (cách nhau bởi dấu phẩy)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00b14f] transition-all"
              />
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại hình</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleWorkType("FULL_TIME")}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    workType === "FULL_TIME" ? "bg-[#00b14f] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Toàn thời gian
                </button>
                <button
                  type="button"
                  onClick={() => toggleWorkType("PART_TIME")}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    workType === "PART_TIME" ? "bg-[#00b14f] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Bán thời gian
                </button>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
              <JobLocationSelect
                value={location}
                onChange={setLocationValue}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00b14f] transition-all"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
