"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/Icon";

export default function CompoundInterestPage() {
  const [initialAmount, setInitialAmount] = useState<string>("10000000");
  const [monthlyContribution, setMonthlyContribution] = useState<string>("2000000");
  const [years, setYears] = useState<number>(10);
  const [interestRate, setInterestRate] = useState<string>("8");
  const [frequency, setFrequency] = useState<string>("12"); // Monthly compounding

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const results = useMemo(() => {
    const p = Number.parseFloat(initialAmount) || 0;
    const pmt = Number.parseFloat(monthlyContribution) || 0;
    const r = (Number.parseFloat(interestRate) || 0) / 100;
    const n = Number.parseInt(frequency);
    const t = years;

    const history = [];
    let currentBalance = p;
    let totalContribution = p;

    for (let year = 1; year <= t; year++) {
      // For simplicity, we calculate year by year
      // Balance = P(1+r/n)^(nt) + PMT * [((1+r/n)^(nt) - 1) / (r/n)]
      // But we'll do it iteratively to generate the history
      for (let month = 1; month <= 12; month++) {
        currentBalance = currentBalance * (1 + r / 12) + pmt;
        totalContribution += pmt;
      }
      
      history.push({
        year,
        balance: currentBalance,
        contribution: totalContribution,
        interest: currentBalance - totalContribution
      });
    }

    return {
      finalBalance: currentBalance,
      totalContribution,
      totalInterest: currentBalance - totalContribution,
      history
    };
  }, [initialAmount, monthlyContribution, years, interestRate, frequency]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Tính lãi suất kép</h1>
        <p className="text-gray-500">Sức mạnh của lãi kép giúp bạn tự do tài chính sớm hơn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Inputs */}
        <Card className="lg:col-span-1 p-6 space-y-4 h-fit">
          <div className="space-y-2">
            <Label htmlFor="initial">Số tiền ban đầu (VND)</Label>
            <Input
              id="initial"
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly">Số tiền đầu tư hàng tháng (VND)</Label>
            <Input
              id="monthly"
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="years">Số năm đầu tư</Label>
              <Input
                id="years"
                type="number"
                min={1}
                max={50}
                value={years}
                onChange={(e) => setYears(Number.parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Lãi suất năm (%)</Label>
              <Input
                id="rate"
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tần suất gộp lãi</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">Hàng tháng (Thành phố bài)</SelectItem>
                <SelectItem value="4">Hàng quý</SelectItem>
                <SelectItem value="1">Hàng năm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Main Results Container */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 border-l-4 border-blue-500 bg-blue-50/30">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Tổng số tiền nhận được</p>
              <h3 className="text-2xl font-bold mt-1 text-blue-900">{formatCurrency(results.finalBalance)}</h3>
            </Card>
            <Card className="p-6 border-l-4 border-[#00b14f] bg-[#00b14f]/5">
              <p className="text-xs font-semibold text-[#00b14f] uppercase tracking-wider">Lợi nhuận từ lãi</p>
              <h3 className="text-2xl font-bold mt-1 text-[#00b14f]">{formatCurrency(results.totalInterest)}</h3>
            </Card>
          </div>

          <Card className="p-6 bg-gray-900 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
              <div>
                <p className="text-gray-400 text-sm">Gấp khoảng</p>
                <h4 className="text-5xl font-bold mt-1">
                  {(results.finalBalance / results.totalContribution).toFixed(1)}x
                </h4>
                <p className="text-gray-400 text-sm mt-1">vốn gốc ban đầu sau {years} năm</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[#00b14f]">
                <Icon name="trending_up" size={24} />
                <span className="text-sm font-medium italic">&quot;Lãi kép là kỳ quan thứ 8 của thế giới.&quot;</span>
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00b14f]/10 rounded-full blur-3xl -mr-16 -mt-16" />
          </Card>

          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">Tiến trình tích lũy theo năm</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                  <TableRow>
                    <TableHead>Năm</TableHead>
                    <TableHead className="text-right">Vốn tích lũy</TableHead>
                    <TableHead className="text-right">Lãi cộng dồn</TableHead>
                    <TableHead className="text-right">Tổng tài sản</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.history.map((row) => (
                    <TableRow key={row.year}>
                      <TableCell className="font-medium">Năm {row.year}</TableCell>
                      <TableCell className="text-right text-gray-500">{formatCurrency(row.contribution)}</TableCell>
                      <TableCell className="text-right text-[#00b14f]">{formatCurrency(row.interest)}</TableCell>
                      <TableCell className="text-right font-bold text-gray-900">{formatCurrency(row.balance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
