"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";

export default function UnemploymentInsurancePage() {
  const [avgSalary, setAvgSalary] = useState<string>("15000000");
  const [monthsContributed, setMonthsContributed] = useState<number>(36);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const results = useMemo(() => {
    const salary = Number.parseFloat(avgSalary) || 0;
    const months = Math.max(0, monthsContributed);
    

    
    let benefitMonths = 0;
    if (months >= 12) {
      benefitMonths = 3 + Math.floor((months - 36) / 12);
      if (months < 36) benefitMonths = 3;
      benefitMonths = Math.min(12, Math.max(0, benefitMonths));
    }

    const monthlyBenefit = salary * 0.6;
    const totalBenefit = monthlyBenefit * benefitMonths;

    return {
      salary,
      months,
      benefitMonths,
      monthlyBenefit,
      totalBenefit
    };
  }, [avgSalary, monthsContributed]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Tính bảo hiểm thất nghiệp</h1>
        <p className="text-gray-500">Dự toán mức trợ cấp thất nghiệp bạn có thể nhận được.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Icon name="history_edu" size={20} className="text-[#00b14f]" />
            Thông tin đóng bảo hiểm
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="avg-salary">Lương BQ đóng BHTN 6 tháng gần nhất (VND)</Label>
              <Input
                id="avg-salary"
                type="number"
                value={avgSalary}
                onChange={(e) => setAvgSalary(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="months">Tổng thời gian đóng BHTN (Tháng)</Label>
              <Input
                id="months"
                type="number"
                min={0}
                value={monthsContributed}
                onChange={(e) => setMonthsContributed(Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-[#00b14f]/5 border-2 border-dashed border-[#00b14f]/30 flex flex-col justify-center">
          <div className="text-center space-y-4">
            <div>
              <p className="text-gray-500 text-sm uppercase font-semibold">Mức hưởng hàng tháng</p>
              <h3 className="text-3xl font-bold text-[#00b14f]">{formatCurrency(results.monthlyBenefit)}</h3>
              <p className="text-xs text-gray-400 mt-1">(Bằng 60% mức lương bình quân)</p>
            </div>
            <div className="pt-4 border-t border-[#00b14f]/10">
              <p className="text-gray-500 text-sm uppercase font-semibold">Thời gian hưởng</p>
              <h3 className="text-3xl font-bold text-gray-900">{results.benefitMonths} tháng</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 relative overflow-hidden bg-gray-900 text-white">
        <div className="relative z-10">
          <p className="text-gray-400 text-sm uppercase tracking-wider">Tổng giá trị trợ cấp dự kiến</p>
          <h3 className="text-4xl sm:text-5xl font-bold mt-2 text-[#00b14f]">
            {formatCurrency(results.totalBenefit)}
          </h3>
          <div className="mt-6 flex items-start gap-3 bg-white/10 p-4 rounded-lg border border-white/10">
            <Icon name="info" size={20} className="text-[#00b14f] flex-shrink-0" />
            <p className="text-sm text-gray-300">
              Bạn cần nộp hồ sơ hưởng trợ cấp thất nghiệp trong vòng <strong>03 tháng</strong> kể từ ngày chấm dứt hợp đồng lao động. Sau 03 tháng nếu chưa nộp hồ sơ, thời gian đóng BHTN sẽ được bảo lưu cho lần sau.
            </p>
          </div>
        </div>
        <Icon name="account_balance" size={160} className="absolute -right-10 -bottom-10 opacity-10" />
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 italic text-sm text-blue-800">
          &quot;Đóng đủ 12 tháng đến đủ 36 tháng thì được hưởng 03 tháng trợ cấp.&quot;
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 italic text-sm text-blue-800">
          &quot;Sau đó, cứ đóng đủ thêm 12 tháng thì được hưởng thêm 01 tháng trợ cấp nhưng tối đa không quá 12 tháng.&quot;
        </div>
      </div>
    </div>
  );
}
