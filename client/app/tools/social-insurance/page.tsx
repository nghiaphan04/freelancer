"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/Icon";

export default function SocialInsurancePage() {
  const [avgSalary, setAvgSalary] = useState<string>("10000000");
  const [yearsBefore2014, setYearsBefore2014] = useState<number>(0);
  const [yearsAfter2014, setYearsAfter2014] = useState<number>(5);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const results = useMemo(() => {
    const salary = Number.parseFloat(avgSalary) || 0;
    
  
    const amountBefore2014 = yearsBefore2014 * 1.5 * salary;
    const amountAfter2014 = yearsAfter2014 * 2 * salary;
    const totalAmount = amountBefore2014 + amountAfter2014;

    return {
      salary,
      amountBefore2014,
      amountAfter2014,
      totalAmount
    };
  }, [avgSalary, yearsBefore2014, yearsAfter2014]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Tính bảo hiểm xã hội (BHXH) một lần</h1>
        <p className="text-gray-500">Ước tính số tiền bạn nhận được khi rút BHXH một lần.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Icon name="work_history" size={20} className="text-[#00b14f]" />
            Thời gian đóng BHXH
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="avg-salary">Mức bình quân tiền lương tháng đóng BHXH (VND)</Label>
              <Input
                id="avg-salary"
                type="number"
                value={avgSalary}
                onChange={(e) => setAvgSalary(e.target.value)}
              />
              <p className="text-xs text-gray-400 italic">* Lưu ý: Đây là mức lương trung bình của toàn bộ quá trình đóng BHXH, có nhân hệ số trượt giá.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="before">Năm đóng trước 2014</Label>
                <Input
                  id="before"
                  type="number"
                  min={0}
                  step="0.5"
                  value={yearsBefore2014}
                  onChange={(e) => setYearsBefore2014(Number.parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="after">Năm đóng từ 2014</Label>
                <Input
                  id="after"
                  type="number"
                  min={0}
                  step="0.5"
                  value={yearsAfter2014}
                  onChange={(e) => setYearsAfter2014(Number.parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-[#00b14f] text-white flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-white/80 text-sm uppercase font-semibold">Tổng tiền dự kiến nhận được</p>
            <h3 className="text-4xl sm:text-5xl font-bold mt-2 truncate">
              {formatCurrency(results.totalAmount)}
            </h3>
            <div className="mt-8 pt-4 border-t border-white/20">
              <div className="flex justify-between text-sm">
                <span>Giai đoạn trước 2014:</span>
                <span className="font-semibold">{formatCurrency(results.amountBefore2014)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span>Giai đoạn từ 2014:</span>
                <span className="font-semibold">{formatCurrency(results.amountAfter2014)}</span>
              </div>
            </div>
          </div>
          <Icon name="elderly" size={160} className="absolute -right-12 -bottom-10 opacity-10" />
        </Card>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-md">
        <div className="flex gap-3">
          <Icon name="warning" size={20} className="text-yellow-600 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Cảnh báo:</p>
            <p>Việc rút BHXH một lần sẽ làm mất đi các quyền lợi dài hạn như lương hưu, bảo hiểm y tế khi về già. Hãy cân nhắc kỹ trước khi quyết định.</p>
          </div>
        </div>
      </div>

      <Card className="p-6 border border-gray-100 italic text-sm text-gray-600 leading-relaxed">
        <h4 className="font-bold text-gray-900 not-italic mb-2">Điều kiện hưởng BHXH một lần:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Nghỉ việc và sau 12 tháng không tiếp tục đóng BHXH.</li>
          <li>Đủ tuổi nghỉ hưu nhưng chưa đủ số năm đóng BHXH để hưởng lương hưu.</li>
          <li>Ra nước ngoài để định cư.</li>
          <li>Mắc một trong những bệnh nguy hiểm đến tính mạng theo quy định của Bộ Y tế.</li>
        </ul>
      </Card>
    </div>
  );
}
