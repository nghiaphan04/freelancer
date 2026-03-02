"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { provinces } from "@/constant/landing";
import { LocationPicker } from "@/components/ui/location-picker";

interface Category {
  id: number;
  name: string;
  subcategories?: string[];
  popularTags?: string[];
}

interface SearchParams {
  keyword?: string;
  location?: string;
  category?: string;
  skills?: string[];
  workType?: string;
}

interface AdvancedJobsSearchBarProps {
  onSearch?: (params: SearchParams) => void;
}

export default function AdvancedJobsSearchBar({ onSearch }: AdvancedJobsSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form states
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [selectedProvinces, setSelectedProvinces] = useState<number[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  // Initialize selectedTags from URL parameters
  const initialTags = searchParams.get("skills") 
    ? searchParams.get("skills")!.split(',').map(s => s.trim()).filter(Boolean)
    : [];
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);
  const [skills, setSkills] = useState(searchParams.get("skills") || "");
  const [workType, setWorkType] = useState(searchParams.get("workType") || "");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.getCategoriesWithDetailsAndJobCounts();
        if (response && response.status === "SUCCESS" && response.data) {
          setCategories(response.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (keyword.trim()) params.append("keyword", keyword.trim());
    
    // Get location from selected provinces/districts
    let locationText = "";
    if (selectedProvinces.length > 0) {
      const provinceNames = selectedProvinces.map(id => {
        const province = provinces.find(p => p.id === id);
        return province ? province.name : '';
      }).filter(Boolean);
      locationText = provinceNames.join(', ');
    }
    if (locationText.trim()) params.append("location", locationText.trim());
    
    if (selectedCategory) params.append("category", selectedCategory);
    
    // Combine skills input with selected tags
    const allTags = [];
    if (skills.trim()) {
      allTags.push(...skills.trim().split(',').map(s => s.trim()));
    }
    if (selectedTags.length > 0) {
      allTags.push(...selectedTags);
    }
    if (allTags.length > 0) {
      params.append("skills", allTags.join(', '));
    }
    
    if (workType) params.append("workType", workType);
    
    const queryString = params.toString();
    const url = queryString ? `/jobs?${queryString}` : "/jobs";
    
    router.push(url, { scroll: false });
    
    if (onSearch) {
      onSearch({
        keyword: keyword.trim() || undefined,
        location: locationText.trim() || undefined,
        category: selectedCategory || undefined,
        skills: allTags.length > 0 ? allTags : undefined,
        workType: workType || undefined,
      });
    }
  };

  const handleClear = () => {
    setKeyword("");
    setSelectedProvinces([]);
    setSelectedDistricts([]);
    setSelectedCategory("");
    setSelectedSubcategories([]);
    setSelectedTags([]);
    setSkills("");
    setWorkType("");
    router.push("/jobs", { scroll: false });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Reset subcategories and tags when category changes
    setSelectedSubcategories([]);
    setSelectedTags([]);
  };

  const toggleSubcategory = (subcategory: string) => {
    setSelectedSubcategories(prev => 
      prev.includes(subcategory) 
        ? prev.filter(s => s !== subcategory)
        : [...prev, subcategory]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const hasActiveFilters = keyword || selectedProvinces.length > 0 || selectedDistricts.length > 0 || selectedCategory || selectedSubcategories.length > 0 || selectedTags.length > 0 || skills || workType;

  return (
    <>
      {/* Main Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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

      {/* All Filters - Always Visible */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, Node.js, Python... (cách nhau bởi dấu phẩy)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00b14f] transition-all"
              />
            </div>

            {/* Work Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại hình</label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00b14f] transition-all"
              >
                <option value="">Tất cả loại hình</option>
                <option value="PART_TIME">Bán thời gian</option>
                <option value="FULL_TIME">Toàn thời gian</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
              <LocationPicker
                provinces={provinces}
                selectedProvinces={selectedProvinces}
                selectedDistricts={selectedDistricts}
                onProvincesChange={setSelectedProvinces}
                onDistrictsChange={setSelectedDistricts}
                className="w-full"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
              <select
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
            </div>
          </div>

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags đã chọn</label>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag, index) => (
                  <button
                    key={`selected-${tag}-${index}`}
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
    </>
  );
}
