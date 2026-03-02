"use client";

import { useState } from "react";
import { provinces } from "@/constant/landing";

interface JobLocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function JobLocationSelect({ value, onChange, className }: JobLocationSelectProps) {
  // Parse current value to extract province and district
  const parseLocationValue = (locationStr: string) => {
    if (!locationStr) return { province: "", district: "" };
    
    const parts = locationStr.split(" - ");
    if (parts.length === 2) {
      return { province: parts[0], district: parts[1] };
    }
    return { province: locationStr, district: "" };
  };
  
  const { province: currentProvince, district: currentDistrict } = parseLocationValue(value);
  
  // Initialize selectedProvince from parsed value (no useEffect needed)
  const [selectedProvince, setSelectedProvince] = useState(currentProvince);
  
  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    if (province) {
      // When province changes, clear district selection
      onChange(province);
    } else {
      onChange("");
    }
  };
  
  const handleDistrictClick = (district: string) => {
    if (selectedProvince && district) {
      const newValue = `${selectedProvince} - ${district}`;
      // Toggle: if clicking same district, clear it
      if (currentDistrict === district) {
        onChange(selectedProvince);
      } else {
        onChange(newValue);
      }
    }
  };
  
  // Initialize selectedProvince when component mounts or value changes
  if (currentProvince && !selectedProvince) {
    setSelectedProvince(currentProvince);
  }
  
  const selectedProvinceData = provinces.find(p => p.name === selectedProvince);
  
  return (
    <div className="space-y-3">
      <select
        value={selectedProvince}
        onChange={(e) => handleProvinceChange(e.target.value)}
        className={`w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00b14f] transition-all ${className}`}
      >
        <option value="">Tất cả địa điểm</option>
        {provinces.map((p) => (
          <option key={p.id} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>
      
      {selectedProvinceData && selectedProvinceData.districts && selectedProvinceData.districts.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện</label>
          <div className="flex flex-wrap gap-2">
            {selectedProvinceData.districts.map((district) => (
              <button
                key={district}
                type="button"
                onClick={() => handleDistrictClick(district)}
                className={`px-3 py-1 rounded-full text-sm transition-colors border ${
                  currentDistrict === district
                    ? "bg-[#00b14f] text-white border-[#00b14f]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#00b14f] hover:bg-gray-50"
                }`}
              >
                {district}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
