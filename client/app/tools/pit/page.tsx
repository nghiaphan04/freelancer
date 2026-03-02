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
import Icon from "@/components/ui/Icon";

const PIT_CONFIG = {
  GTGC_PERSONAL: 11000000,
  GTGC_DEPENDENT: 4400000,
  STEPS: [
    { level: 1, limit: 5000000, rate: 0.05, subtract: 0, description: "Đến 5tr VNĐ" },
    { level: 2, limit: 10000000, rate: 0.10, subtract: 250000, description: "Trên 5tr đến 10tr VNĐ" },
    { level: 3, limit: 18000000, rate: 0.15, subtract: 750000, description: "Trên 10tr đến 18tr VNĐ" },
    { level: 4, limit: 32000000, rate: 0.20, subtract: 1650000, description: "Trên 18tr đến 32tr VNĐ" },
    { level: 5, limit: 52000000, rate: 0.25, subtract: 3250000, description: "Trên 32tr đến 52tr VNĐ" },
    { level: 6, limit: 80000000, rate: 0.30, subtract: 5850000, description: "Trên 52tr đến 80tr VNĐ" },
    { level: 7, limit: Infinity, rate: 0.35, subtract: 9850000, description: "Trên 80tr VNĐ" },
  ]
};

export default function PITPage() {
  const [taxableSalary, setTaxableSalary] = useState<string>("30000000");
  const [dependents, setDependents] = useState<number>(0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const results = useMemo(() => {
    const salary = Number.parseFloat(taxableSalary) || 0;
    const gtgc = PIT_CONFIG.GTGC_PERSONAL + (dependents * PIT_CONFIG.GTGC_DEPENDENT);
    const taxableIncome = Math.max(0, salary - gtgc);

    let totalPit = 0;
    const breakdown = PIT_CONFIG.STEPS.map((step, idx) => {
      const prevLimit = idx === 0 ? 0 : PIT_CONFIG.STEPS[idx - 1].limit;
      const currentLevelIncome = Math.max(0, Math.min(taxableIncome, step.limit) - prevLimit);
      const taxAtThisLevel = currentLevelIncome * step.rate;
      
      return {
        ...step,
        incomeAtLevel: currentLevelIncome,
        taxAtLevel: taxAtThisLevel
      };
    });

    totalPit = breakdown.reduce((acc, curr) => acc + curr.taxAtLevel, 0);

    return {
      salary,
      gtgc,
      taxableIncome,
      totalPit,
      breakdown,
      remaining: salary - totalPit
    };
  }, [taxableSalary, dependents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Tính thuế nhập cá nhân (PIT)</h1>
        <p className="text-gray-500">Tính toán chính xác số thuế TNCN phải nộp dựa trên thu nhập và người phụ thuộc.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Icon name="edit_note" size={20} className="text-[#00b14f]" />
            Dữ liệu nhập
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="salary">Thu nhập tháng (Chưa trừ bảo hiểm)</Label>
              <Input
                id="salary"
                type="number"
                value={taxableSalary}
                onChange={(e) => setTaxableSalary(e.target.value)}
                className="text-lg font-medium"
              />
              <p className="text-xs text-gray-400 italic">* Lưu ý: Thuế TNCN tính trên thu nhập sau khi đã trừ các loại bảo hiểm bắt buộc.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deps">Số người phụ thuộc</Label>
              <Input
                id="deps"
                type="number"
                min={0}
                value={dependents}
                onChange={(e) => setDependents(Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="pt-6 border-t space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Giảm trừ bản thân:</span>
              <span className="font-medium">{formatCurrency(PIT_CONFIG.GTGC_PERSONAL)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Giảm trừ người phụ thuộc:</span>
              <span className="font-medium">{formatCurrency(dependents * PIT_CONFIG.GTGC_DEPENDENT)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-semibold text-[#00b14f]">
              <span>Tổng giảm trừ:</span>
              <span>{formatCurrency(results.gtgc)}</span>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 bg-gradient-to-br from-[#00b14f] to-[#009643] text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-white/80 text-sm font-medium uppercase tracking-wider">Thuế TNCN phải nộp</p>
                <h3 className="text-4xl font-bold mt-1">{formatCurrency(results.totalPit)}</h3>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 border border-white/20">
                <p className="text-white/80 text-xs font-medium uppercase">Thu nhập chịu thuế</p>
                <p className="text-xl font-bold">{formatCurrency(results.taxableIncome)}</p>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-700">Bảng chi tiết diễn giải (Bậc thang)</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Bậc</TableHead>
                  <TableHead>Mức thu nhập tính thuế</TableHead>
                  <TableHead className="text-right">Thuế suất</TableHead>
                  <TableHead className="text-right">Tiền thuế</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.breakdown.map((step) => (
                  <TableRow key={step.level} className={step.incomeAtLevel > 0 ? "bg-[#00b14f]/5" : ""}>
                    <TableCell className="font-medium">{step.level}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{step.description}</span>
                        {step.incomeAtLevel > 0 && (
                          <span className="text-xs text-gray-500">Phần thu nhập chịu thuế: {formatCurrency(step.incomeAtLevel)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{step.rate * 100}%</TableCell>
                    <TableCell className="text-right font-medium">
                      {step.taxAtLevel > 0 ? formatCurrency(step.taxAtLevel) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-100 font-bold border-t-2">
                  <TableCell colSpan={3} className="text-right">Tổng cộng thuế TNCN</TableCell>
                  <TableCell className="text-right text-[#00b14f]">{formatCurrency(results.totalPit)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="flex items-center gap-2 font-semibold text-gray-900 mb-2">
          <Icon name="help_outline" size={18} className="text-gray-500" />
          Cách tính thuế TNCN bậc thang là gì?
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          Thuế thu nhập cá nhân tại Việt Nam được tính theo phương pháp lũy tiến từng phần. Nghĩa là thu nhập của bạn được chia thành các phần tương ứng với các bậc thuế, mỗi phần sẽ chịu một mức thuế suất khác nhau. Thu nhập càng cao thì phần thu nhập vượt mức sẽ chịu thuế suất càng cao.
        </p>
      </div>
    </div>
  );
}
