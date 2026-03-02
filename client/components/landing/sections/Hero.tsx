"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import { LocationPicker } from "@/components/ui/location-picker";
import { api } from "@/lib/api";
import { Category } from "@/types/category";
import { provinces, bannerSlides } from "@/constant/landing";

export default function Hero() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedProvinces, setSelectedProvinces] = useState<number[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.getCategoriesWithDetailsAndJobCounts();
        if (response.status === "SUCCESS" && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Handle search submit
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get location from selected provinces/districts
    let locationText = "";
    if (selectedProvinces.length > 0) {
      const provinceNames = selectedProvinces.map(id => {
        const province = provinces.find(p => p.id === id);
        return province ? province.name : '';
      }).filter(Boolean);
      locationText = provinceNames.join(', ');
    }
    
    if (!searchKeyword.trim() && !locationText.trim() && !selectedCategory && selectedTags.length === 0) return;
    
    setIsSearching(true);
    try {
      // Build search params
      const params = new URLSearchParams();
      if (searchKeyword.trim()) params.append("keyword", searchKeyword.trim());
      if (locationText.trim()) params.append("location", locationText.trim());
      if (selectedCategory) params.append("category", selectedCategory.toString());
      if (selectedTags.length > 0) params.append("skills", selectedTags.join(', '));
      
      // Navigate to jobs page with search params
      router.push(`/jobs?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle tag click
  const handleTagClick = (tag: string, categoryId?: number) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });

    // Auto-select the category that contains this tag
    if (categoryId) {
      setSelectedCategory(categoryId);
    } else {
      // Find category that contains this tag
      const categoryWithTag = categories.find(cat => 
        cat.popularTags?.includes(tag) || 
        cat.subCategories?.some(sub => sub.tags.some(t => t.name === tag))
      );
      if (categoryWithTag) {
        setSelectedCategory(categoryWithTag.id);
      }
    }
  };

  // Handle category click
  const handleCategoryClick = (categoryId: number) => {
    // Select category for search (no immediate navigation)
    setSelectedCategory(categoryId);
  };

  const itemsPerPage = 6;
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  
  const currentCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <section className="relative bg-[#0a4a37] py-6 z-10">
      {/* Background Circuit Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-20" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
        <line x1="0" y1="100" x2="300" y2="100" stroke="#00b14f" strokeWidth="1" />
        <line x1="0" y1="200" x2="200" y2="200" stroke="#00b14f" strokeWidth="1" />
        <line x1="0" y1="400" x2="250" y2="400" stroke="#00b14f" strokeWidth="1" />
        <line x1="900" y1="150" x2="1200" y2="150" stroke="#00b14f" strokeWidth="1" />
        <line x1="950" y1="350" x2="1200" y2="350" stroke="#00b14f" strokeWidth="1" />
        <line x1="1000" y1="500" x2="1200" y2="500" stroke="#00b14f" strokeWidth="1" />
        <circle cx="300" cy="100" r="4" fill="#00b14f" />
        <circle cx="200" cy="200" r="4" fill="#00b14f" />
        <circle cx="250" cy="400" r="4" fill="#00b14f" />
        <circle cx="900" cy="150" r="4" fill="#00b14f" />
        <circle cx="950" cy="350" r="4" fill="#00b14f" />
        <circle cx="1000" cy="500" r="4" fill="#00b14f" />
        <path d="M50 50 L100 50 L100 100" fill="none" stroke="#00b14f" strokeWidth="2" />
        <path d="M1150 50 L1100 50 L1100 100" fill="none" stroke="#00b14f" strokeWidth="2" />
        <path d="M50 550 L100 550 L100 500" fill="none" stroke="#00b14f" strokeWidth="2" />
        <path d="M1150 550 L1100 550 L1100 500" fill="none" stroke="#00b14f" strokeWidth="2" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-[100]">
        
        {/* Selected Filters Display */}
        {(selectedTags.length > 0 || selectedCategory) && (
          <div className="bg-white rounded-xl p-3 mb-4 shadow-lg">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">Đã chọn:</span>
              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#00b14f] text-white rounded-full text-sm hover:bg-[#009643] transition-colors"
                >
                  {categories.find(c => c.id === selectedCategory)?.name}
                  <Icon name="close" size={14} />
                </button>
              )}
              {selectedTags.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#00b14f] text-white rounded-full text-sm hover:bg-[#009643] transition-colors"
                >
                  {tag}
                  <Icon name="close" size={14} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl md:rounded-full p-2 md:p-1.5 flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-6 shadow-lg relative z-[9999]">
          {/* Search input + Location picker row */}
          <div className="flex-1 flex items-center">
            <div className="flex-1 flex items-center px-3 md:px-4">
              <Icon name="search" size={20} className="text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Vị trí tuyển dụng, tên công ty"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full py-2 outline-none text-gray-700 placeholder-gray-400 text-sm md:text-base"
              />
            </div>
            
            <LocationPicker
              provinces={provinces}
              selectedProvinces={selectedProvinces}
              selectedDistricts={selectedDistricts}
              onProvincesChange={setSelectedProvinces}
              onDistrictsChange={setSelectedDistricts}
            />
          </div>

          <button 
            type="submit"
            disabled={isSearching}
            className="bg-[#00b14f] hover:bg-[#009643] text-white px-4 md:px-6 py-2.5 rounded-full font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <Icon name="search" size={18} />
            <span>{isSearching ? "Đang tìm..." : "Tìm kiếm"}</span>
          </button>
        </form>

        {/* Mobile Job Categories Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center justify-between w-full bg-white rounded-xl px-4 py-3 mb-4 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Danh mục việc làm</span>
          </div>
          <Icon name={mobileMenuOpen ? "expand_less" : "expand_more"} size={20} className="text-gray-400" />
        </button>

        {/* Mobile Job Categories Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white rounded-xl shadow-lg mb-4 overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              {loading ? (
                // Loading skeleton for mobile
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="border-b border-gray-100 last:border-b-0">
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                      className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      <Icon 
                        name={expandedCategory === category.id ? "expand_less" : "expand_more"} 
                        size={18} 
                        className="text-gray-400" 
                      />
                    </button>
                    
                    {expandedCategory === category.id && (
                      <div className="bg-gray-50 px-4 py-2">
                        <div className="flex flex-wrap gap-2">
                          {(category.popularTags || []).map((tag, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleTagClick(tag, category.id)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 border rounded-full text-xs transition-colors ${
                                selectedTags.includes(tag)
                                  ? "bg-[#00b14f] text-white border-[#00b14f]"
                                  : "bg-white border-gray-200 text-gray-600 hover:border-[#00b14f] hover:text-[#00b14f]"
                              }`}
                            >
                              <Icon name="check_circle" size={14} className={selectedTags.includes(tag) ? "text-white" : "text-[#00b14f]"} />
                              {tag}
                            </button>
                          ))}
                        </div>
                        {category.subCategories && category.subCategories.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            {category.subCategories.map((subCat, idx) => (
                              <div key={idx} className="mb-2 last:mb-0">
                                <p className="text-xs font-semibold text-gray-500 mb-1">{subCat.name}</p>
                                <div className="flex flex-wrap gap-1">
                                  {(subCat.tags || []).map((tag, tIdx) => (
                                    <button
                                      key={tIdx}
                                      onClick={() => handleTagClick(tag.name)}
                                      className={`px-2 py-1 rounded text-xs transition-colors ${
                                        selectedTags.includes(tag.name)
                                          ? "bg-[#00b14f] text-white"
                                          : "bg-white text-gray-600 hover:text-[#00b14f]"
                                      }`}
                                    >
                                      {tag.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-12 gap-4 relative z-10"
          onMouseLeave={() => setHoveredCategory(null)}
        >
          
          {/* Left Sidebar - Job Categories (Hidden on mobile) */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3 bg-white rounded-xl shadow-lg overflow-visible relative z-20">
            {loading ? (
              // Loading skeleton
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100 rounded-t-xl overflow-hidden">
                  {currentCategories.map((category) => (
                    <div
                      key={category.id}
                      className="relative"
                      onMouseEnter={() => setHoveredCategory(category.id)}
                    >
                      <a
                        onClick={() => handleCategoryClick(category.id)}
                        className={`flex items-center justify-between px-4 py-3.5 transition-colors group cursor-pointer ${
                          selectedCategory === category.id 
                            ? "bg-[#00b14f]/10 text-[#00b14f] border-l-4 border-[#00b14f]" 
                            : hoveredCategory === category.id 
                              ? "bg-gray-50 text-[#00b14f]" 
                              : "hover:bg-gray-50"
                        }`}
                      >
                        <span className={`text-sm truncate pr-2 ${
                          hoveredCategory === category.id ? "text-[#00b14f] font-medium" : "text-gray-700 group-hover:text-[#00b14f]"
                        }`}>
                          {category.name}
                        </span>
                        <Icon name="chevron_right" size={18} className={`shrink-0 ${
                          hoveredCategory === category.id ? "text-[#00b14f]" : "text-gray-400"
                        }`} />
                      </a>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                  <span className="text-sm text-gray-500">{currentPage}/{totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Icon name="chevron_left" size={18} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Icon name="chevron_right" size={18} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Category Hover Dropdown - Covers Banner Area (Tablet & Desktop) */}
          {hoveredCategory && !loading && (
            <div 
              className="absolute left-[33%] md:left-[33%] lg:left-[25%] top-0 right-0 bottom-0 bg-white rounded-r-xl shadow-xl border border-gray-200 z-[9999] hidden md:flex flex-col overflow-hidden group"
              onMouseEnter={() => {}}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {(() => {
                const category = categories.find(c => c.id === hoveredCategory);
                if (!category) return null;
                return (
                  <div className="p-5 overflow-y-auto flex-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {/* Popular Tags */}
                    <div className="mb-5">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Được tìm kiếm nhiều</h4>
                      <div className="flex flex-wrap gap-2">
                        {(category.popularTags || []).map((tag, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleTagClick(tag, category.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-sm transition-colors ${
                              selectedTags.includes(tag)
                                ? "bg-[#00b14f] text-white border-[#00b14f]"
                                : "border-gray-200 text-gray-600 hover:border-[#00b14f] hover:text-[#00b14f]"
                            }`}
                          >
                            <Icon name="check_circle" size={16} className={selectedTags.includes(tag) ? "text-white" : "text-[#00b14f]"} />
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sub Categories */}
                    {category.subCategories && category.subCategories.length > 0 && (
                      <div className="space-y-4">
                        {category.subCategories.map((subCat, idx) => (
                          <div key={idx}>
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">{subCat.name}</h5>
                            <div className="flex flex-wrap gap-2">
                              {(subCat.tags || []).map((tag, tIdx) => (
                                <button
                                  key={tIdx}
                                  onClick={() => handleTagClick(tag.name)}
                                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                    selectedTags.includes(tag.name)
                                      ? "bg-[#00b14f] text-white"
                                      : "bg-gray-50 text-gray-600 hover:bg-[#e8f5e9] hover:text-[#00b14f]"
                                  }`}
                                >
                                  {tag.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Right Content - Banner Slider (Full width on mobile) */}
          <div className="col-span-1 md:col-span-8 lg:col-span-9">
            <div className="relative rounded-xl overflow-hidden h-[200px] md:h-full md:min-h-[280px]">
              {/* Slides */}
              {bannerSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}

              {/* Navigation Arrows */}
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <Icon name="chevron_left" size={24} />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <Icon name="chevron_right" size={24} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {bannerSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-[#00b14f] w-6"
                        : "bg-white/60 hover:bg-white"
                    }`}
                  />
                ))}
              </div>

              {/* Badge */}
              <div className="absolute bottom-4 right-4 bg-[#00b14f] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg z-10">
                Welcome onboard!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
