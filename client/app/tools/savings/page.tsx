"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/Icon";

export default function SavingsPlannerPage() {
  const [targetAmount, setTargetAmount] = useState<string>("500000000");
  const [currentSavings, setCurrentSavings] = useState<string>("50000000");
  const [years, setYears] = useState<number>(5);
  const [interestRate, setInterestRate] = useState<string>("7");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const results = useMemo(() => {
    const fv = Number.parseFloat(targetAmount) || 0;
    const pv = Number.parseFloat(currentSavings) || 0;
    const r = (Number.parseFloat(interestRate) || 0) / 100 / 12; // Monthly rate
    const n = years * 12; // Total months

    if (n <= 0) return null;

    // PMT formula for future value of an annuity with initial present value:
    // FV = PV*(1+r)^n + PMT * [((1+r)^n - 1) / r]
    // PMT = (FV - PV*(1+r)^n) / [((1+r)^n - 1) / r]
    
    let monthlyNeeded = 0;
    const compoundFactor = Math.pow(1 + r, n);
    const annuityFactor = r > 0 ? (compoundFactor - 1) / r : n;
    
    monthlyNeeded = (fv - (pv * compoundFactor)) / annuityFactor;

    return {
      monthlyNeeded: Math.max(0, monthlyNeeded),
      targetReached: pv >= fv,
      totalInterest: fv - pv - (Math.max(0, monthlyNeeded) * n)
    };
  }, [targetAmount, currentSavings, years, interestRate]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Lập kế hoạch tiết kiệm</h1>
        <p className="text-gray-500">Xác định số tiền cần tiết kiệm hàng tháng để đạt được mục tiêu tài chính.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target">Số tiền mục tiêu (VND)</Label>
            <Input
              id="target"
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="text-lg font-bold text-[#00b14f]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="current">Số tiền hiện có (VND)</Label>
            <Input
              id="current"
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Thời gian đạt mục tiêu (Năm)</Label>
            <Input
                id="years"
                type="number"
                min={1}
                value={years}
                onChange={(e) => setYears(Number.parseInt(e.target.value) || 1)}
              />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Lãi suất kỳ vọng (%/năm)</Label>
            <Input
              id="rate"
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 bg-white border-[#00b14f] border-2 relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium uppercase">Số tiền cần gửi thêm mỗi tháng</p>
                  <h3 className="text-4xl sm:text-5xl font-extrabold text-[#00b14f] mt-1 italic">
                    {formatCurrency(results?.monthlyNeeded || 0)}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-[#00b14f]/10 rounded-full flex items-center justify-center text-[#00b14f]">
                  <Icon name="rocket_launch" size={24} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-600">Tiến độ hiện tại: {( (Number.parseFloat(currentSavings)||0) / (Number.parseFloat(targetAmount)||1) * 100).toFixed(1)}%</span>
                  <span className="text-gray-900 font-bold">{formatCurrency(Number.parseFloat(currentSavings)||0)} / {formatCurrency(Number.parseFloat(targetAmount)||0)}</span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#00b14f] transition-all duration-500 ease-out"
                    style={{ width: `${Math.min(100, (Number.parseFloat(currentSavings)||0) / (Number.parseFloat(targetAmount)||1) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Icon name="calendar_today" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Thời hạn</p>
                    <p className="font-semibold">{years} năm ({years * 12} tháng)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Icon name="trending_up" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Lãi suất</p>
                    <p className="font-semibold">{interestRate}% / năm</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -right-4 -bottom-4 w-40 h-40 bg-[#00b14f]/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-6 bg-gray-900 text-white flex flex-col justify-between">
              <div>
                <Icon name="lightbulb" size={24} className="text-yellow-400 mb-3" />
                <h4 className="font-semibold text-lg mb-2">Mẹo tiết kiệm</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Hãy thử áp dụng quy tắc 50/30/20: 50% cho nhu cầu thiết yếu, 30% cho sở thích và 20% cho tiết kiệm & trả nợ.
                </p>
              </div>
              <Button variant="link" className="text-[#00b14f] p-0 h-auto justify-start mt-4 font-semibold">
                Xem thêm bí kíp
                <Icon name="chevron_right" size={16} />
              </Button>
            </Card>

            <Card className="p-6 border-dashed border-2 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-3 bg-gray-100 rounded-full">
                <Icon name="query_stats" size={28} className="text-gray-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Chia nhỏ mục tiêu</h4>
                <p className="text-xs text-gray-500 px-4">
                  Tiết kiệm {formatCurrency((results?.monthlyNeeded || 0) / 30)} mỗi ngày sẽ giúp bạn dễ dàng đạt được {formatCurrency(results?.monthlyNeeded || 0)} mỗi tháng.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
