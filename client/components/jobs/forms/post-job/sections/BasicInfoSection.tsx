"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormData } from "@/hooks/usePostJobForm";
import JobLocationSelect from "@/components/ui/JobLocationSelect";
import { api } from "@/lib/api";
import { Category } from "@/types/category";

interface BasicInfoSectionProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onLocationChange: (value: string) => void;
  onWorkTypeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSubCategoryChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
  disabled?: boolean;
}

export default function BasicInfoSection({ 
  formData, 
  onChange, 
  onLocationChange, 
  onWorkTypeChange, 
  onCategoryChange, 
  onSubCategoryChange,
  onTagsChange, 
  disabled 
}: BasicInfoSectionProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Fetch categories on mount
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

  // Get selected category data
  const selectedCategoryData = categories.find((c) => c.id.toString() === formData.category);
  
  // Get sub-categories for selected category
  const subCategories = selectedCategoryData?.subCategories || [];
  
  // Get selected sub-category data
  const selectedSubCategoryData = subCategories.find((s) => s.id.toString() === formData.subCategory);

  // Get tags for selected sub-category (or all tags in category if no sub-category selected)
  const getRelevantTags = (): string[] => {
    if (selectedSubCategoryData) {
      return (selectedSubCategoryData.tags || []).map(t => t.name);
    }
    
    if (!selectedCategoryData) return [];
    
    const allTags: string[] = [];
    selectedCategoryData.subCategories?.forEach((sub) => {
      sub.tags?.forEach((tag) => {
        if (!allTags.includes(tag.name)) {
          allTags.push(tag.name);
        }
      });
    });
    return allTags;
  };

  const relevantTags = getRelevantTags();
  
  const toggleTag = (tag: string) => {
    const newTags = formData.tags.includes(tag) 
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    onTagsChange(newTags);
  };
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${disabled ? "opacity-60" : ""}`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề công việc <span className="text-red-500">*</span>
          </label>
          <Input
            name="title"
            value={formData.title}
            onChange={onChange}
            placeholder="VD: Thiết kế website bán hàng"
            maxLength={200}
          />
          <p className="text-xs text-gray-400 mt-1">{formData.title.length}/200 ký tự</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả công việc <span className="text-red-500">*</span>
          </label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Mô tả chi tiết công việc cần làm..."
            rows={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bối cảnh dự án</label>
          <Textarea
            name="context"
            value={formData.context || ""}
            onChange={onChange}
            placeholder="Giới thiệu về dự án, công ty..."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu cụ thể</label>
          <Textarea
            name="requirements"
            value={formData.requirements || ""}
            onChange={onChange}
            placeholder="Các yêu cầu về kỹ năng, kinh nghiệm..."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sản phẩm bàn giao</label>
          <Textarea
            name="deliverables"
            value={formData.deliverables || ""}
            onChange={onChange}
            placeholder="Các sản phẩm cần bàn giao khi hoàn thành..."
            rows={3}
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Địa điểm</label>
          <JobLocationSelect
            value={formData.location}
            onChange={onLocationChange}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00b14f] transition-all"
          />
        </div>

        {/* Work Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại hình</label>
          <div className="flex gap-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="workType"
                value="FULL_TIME"
                checked={formData.workType === "FULL_TIME"}
                onChange={(e) => onWorkTypeChange(e.target.value)}
                className="mr-2"
              />
              Toàn thời gian
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="workType"
                value="PART_TIME"
                checked={formData.workType === "PART_TIME"}
                onChange={(e) => onWorkTypeChange(e.target.value)}
                className="mr-2"
              />
              Bán thời gian
            </label>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
          <select
            value={formData.category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00b14f] transition-all"
          >
            <option value="">Chọn danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-Category */}
        {subCategories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục con</label>
            <select
              value={formData.subCategory}
              onChange={(e) => onSubCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00b14f] transition-all"
            >
              <option value="">Chọn danh mục con</option>
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.id.toString()}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tags */}
        {relevantTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {relevantTags.map((tag: string, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors border ${
                    formData.tags.includes(tag)
                      ? "bg-[#00b14f] text-white border-[#00b14f]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-[#00b14f] hover:bg-gray-50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Chọn tags liên quan đến công việc</p>
          </div>
        )}
      </div>
    </div>
  );
}
