"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Icon from "@/components/ui/Icon";

// Constants for 2024-2025 Vietnamese Salary Calculation
const CONFIG = {
  MIN_BASE_SALARY: 1800000, // Mức lương cơ sở từ 01/07/2023
  MAX_BHXH_BHYT_SALARY_LIMIT: 1800000 * 20, // 36,000,000
  MAX_BHTN_SALARY_LIMIT: 4680000 * 20, // Region I limit (approx)
  GTGC_PERSONAL: 11000000,
  GTGC_DEPENDENT: 4400000,
  RATES: {
    EMPLOYEE: {
      BHXH: 0.08,
      BHYT: 0.015,
      BHTN: 0.01,
    },
    EMPLOYER: {
      BHXH: 0.175,
      BHYT: 0.03,
      BHTN: 0.01,
      BHTNLĐ_BNN: 0.005,
    }
  },
  PIT_STEPS: [
    { limit: 5000000, rate: 0.05, subtract: 0 },
    { limit: 10000000, rate: 0.10, subtract: 250000 },
    { limit: 18000000, rate: 0.15, subtract: 750000 },
    { limit: 32000000, rate: 0.20, subtract: 1650000 },
    { limit: 52000000, rate: 0.25, subtract: 3250000 },
    { limit: 80000000, rate: 0.30, subtract: 5850000 },
    { limit: Infinity, rate: 0.35, subtract: 9850000 },
  ]
};

export default function GrossNetPage() {
  const [grossSalary, setGrossSalary] = useState<string>("20000000");
  const [dependents, setDependents] = useState<number>(0);
  const [insuranceSalary, setInsuranceSalary] = useState<string>("20000000");
  const [isCustomInsurance, setIsCustomInsurance] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const results = useMemo(() => {
    const gross = Number.parseFloat(grossSalary) || 0;
    const insSalary = isCustomInsurance ? (Number.parseFloat(insuranceSalary) || 0) : gross;

    // Insurance limits
    const salaryBHXH = Math.min(insSalary, CONFIG.MAX_BHXH_BHYT_SALARY_LIMIT);
    const salaryBHTN = Math.min(insSalary, CONFIG.MAX_BHTN_SALARY_LIMIT);

    // Employee Deductions
    const employeeBHXH = salaryBHXH * CONFIG.RATES.EMPLOYEE.BHXH;
    const employeeBHYT = salaryBHXH * CONFIG.RATES.EMPLOYEE.BHYT;
    const employeeBHTN = salaryBHTN * CONFIG.RATES.EMPLOYEE.BHTN;
    const totalEmployeeInsurance = employeeBHXH + employeeBHYT + employeeBHTN;

    // Taxable Income
    const incomeBeforeTax = gross - totalEmployeeInsurance;
    const gtgc = CONFIG.GTGC_PERSONAL + (dependents * CONFIG.GTGC_DEPENDENT);
    const taxableIncome = Math.max(0, incomeBeforeTax - gtgc);

    // PIT Calculation
    let pit = 0;
    for (const step of CONFIG.PIT_STEPS) {
      if (taxableIncome <= step.limit) {
        pit = taxableIncome * step.rate - step.subtract;
        break;
      }
    }

    const netSalary = incomeBeforeTax - pit;

    // Employer Costs
    const employerBHXH = salaryBHXH * CONFIG.RATES.EMPLOYER.BHXH;
    const employerBHYT = salaryBHXH * CONFIG.RATES.EMPLOYER.BHYT;
    const employerBHTN = salaryBHTN * CONFIG.RATES.EMPLOYER.BHTN;
    const employerBHTNLD = salaryBHXH * CONFIG.RATES.EMPLOYER.BHTNLĐ_BNN;
    const totalEmployerInsurance = employerBHXH + employerBHYT + employerBHTN + employerBHTNLD;
    const totalCost = gross + totalEmployerInsurance;

    return {
      gross,
      netSalary,
      employeeBHXH,
      employeeBHYT,
      employeeBHTN,
      totalEmployeeInsurance,
      taxableIncome,
      gtgc,
      pit,
      employerBHXH,
      employerBHYT,
      employerBHTN,
      employerBHTNLD,
      totalEmployerInsurance,
      totalCost
    };
  }, [grossSalary, dependents, insuranceSalary, isCustomInsurance]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tính lương Gross sang Net</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1 rounded-full border">
          <Icon name="event" size={16} />
          Áp dụng từ 01/07/2024
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Icon name="settings" size={20} className="text-[#00b14f]" />
            Thông số tính toán
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gross">Lương Gross (VND)</Label>
              <Input
                id="gross"
                type="number"
                value={grossSalary}
                onChange={(e) => setGrossSalary(e.target.value)}
                className="text-lg font-medium border-[#00b14f]/30 focus:border-[#00b14f]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dependents">Số người phụ thuộc</Label>
              <Input
                id="dependents"
                type="number"
                min={0}
                value={dependents}
                onChange={(e) => setDependents(Number.parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="checkbox" 
                  id="custom-ins" 
                  checked={isCustomInsurance}
                  onChange={(e) => setIsCustomInsurance(e.target.checked)}
                  className="w-4 h-4 accent-[#00b14f]"
                />
                <Label htmlFor="custom-ins" className="cursor-pointer">Lương đóng bảo hiểm khác lương Gross</Label>
              </div>
              
              {isCustomInsurance && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Label htmlFor="ins-sal">Mức lương đóng bảo hiểm (VND)</Label>
                  <Input
                    id="ins-sal"
                    type="number"
                    value={insuranceSalary}
                    onChange={(e) => setInsuranceSalary(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Result Card */}
        <Card className="p-6 bg-[#00b14f] text-white flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <p className="opacity-80 text-lg">Lương Net (Thực nhận)</p>
            <h3 className="text-4xl sm:text-5xl font-bold mt-2 truncate">
              {formatCurrency(results.netSalary)}
            </h3>
            <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs opacity-70 uppercase">Bảo hiểm cá nhân</p>
                <p className="text-xl font-semibold">-{formatCurrency(results.totalEmployeeInsurance)}</p>
              </div>
              <div>
                <p className="text-xs opacity-70 uppercase">Thuế TNCN</p>
                <p className="text-xl font-semibold">-{formatCurrency(results.pit)}</p>
              </div>
            </div>
          </div>
          {/* Decorative Background Icon */}
          <Icon 
            name="payments" 
            size={180} 
            className="absolute -right-8 -bottom-8 opacity-10 rotate-12" 
          />
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card className="overflow-hidden">
        <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Chi tiết diễn giải (VND)</h2>
          <Button variant="ghost" size="sm" className="text-[#00b14f]" onClick={() => globalThis.print()}>
            <Icon name="print" size={16} className="mr-2" />
            In kết quả
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khoản chi trả</TableHead>
              <TableHead className="text-right">Tỷ lệ</TableHead>
              <TableHead className="text-right">Người lao động</TableHead>
              <TableHead className="text-right">Người sử dụng LĐ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-blue-50/50 font-medium">
              <TableCell>Lương Gross</TableCell>
              <TableCell className="text-right">-</TableCell>
              <TableCell className="text-right text-blue-700">{formatCurrency(results.gross)}</TableCell>
              <TableCell className="text-right">{formatCurrency(results.gross)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bảo hiểm xã hội</TableCell>
              <TableCell className="text-right">8% | 17.5%</TableCell>
              <TableCell className="text-right">-{formatCurrency(results.employeeBHXH)}</TableCell>
              <TableCell className="text-right">{formatCurrency(results.employerBHXH)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bảo hiểm y tế</TableCell>
              <TableCell className="text-right">1.5% | 3%</TableCell>
              <TableCell className="text-right">-{formatCurrency(results.employeeBHYT)}</TableCell>
              <TableCell className="text-right">{formatCurrency(results.employerBHYT)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>BH Thất nghiệp</TableCell>
              <TableCell className="text-right">1% | 1%</TableCell>
              <TableCell className="text-right">-{formatCurrency(results.employeeBHTN)}</TableCell>
              <TableCell className="text-right">{formatCurrency(results.employerBHTN)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>BH TNLĐ - BNN</TableCell>
              <TableCell className="text-right">0% | 0.5%</TableCell>
              <TableCell className="text-right">-</TableCell>
              <TableCell className="text-right">{formatCurrency(results.employerBHTNLD)}</TableCell>
            </TableRow>
            <TableRow className="bg-gray-50/50 font-semibold text-gray-900 border-t-2">
              <TableCell>Tổng cộng bảo hiểm</TableCell>
              <TableCell className="text-right">10.5% | 22%</TableCell>
              <TableCell className="text-right">-{formatCurrency(results.totalEmployeeInsurance)}</TableCell>
              <TableCell className="text-right">{formatCurrency(results.totalEmployerInsurance)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8 text-gray-500 text-sm">Thu nhập trước thuế</TableCell>
              <TableCell className="text-right">-</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(results.gross - results.totalEmployeeInsurance)}</TableCell>
              <TableCell className="text-right">-</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8 text-gray-500 text-sm">Giảm trừ gia cảnh</TableCell>
              <TableCell className="text-right">-</TableCell>
              <TableCell className="text-right">-{formatCurrency(results.gtgc)}</TableCell>
              <TableCell className="text-right">-</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="pl-8 text-gray-500 text-sm">Thu nhập chịu thuế</TableCell>
              <TableCell className="text-right">-</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(results.taxableIncome)}</TableCell>
              <TableCell className="text-right">-</TableCell>
            </TableRow>
            <TableRow className="text-red-600 font-medium">
              <TableCell>Thuế TNCN</TableCell>
              <TableCell className="text-right">Bậc thang</TableCell>
              <TableCell className="text-right">-{formatCurrency(results.pit)}</TableCell>
              <TableCell className="text-right">-</TableCell>
            </TableRow>
            <TableRow className="bg-[#00b14f]/10 font-bold text-[#00b14f] border-t-2 text-lg">
              <TableCell>Lương NET | Tổng chi phí</TableCell>
              <TableCell className="text-right">-</TableCell>
              <TableCell className="text-right">{formatCurrency(results.netSalary)}</TableCell>
              <TableCell className="text-right">{formatCurrency(results.totalCost)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
        <div className="flex gap-3">
          <Icon name="info" size={20} className="text-blue-500" />
          <div className="text-sm text-blue-700">
            <p className="font-semibold mb-1">Ghi chú:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Mức lương cơ sở hiện tại: <strong>1.800.000đ</strong></li>
              <li>Giảm trừ bản thân: <strong>11.000.000đ</strong></li>
              <li>Giảm trừ người phụ thuộc: <strong>4.400.000đ/người</strong></li>
              <li>Mức trần đóng BHXH, BHYT: <strong>36.000.000đ</strong></li>
              <li>Số liệu chỉ mang tính chất tham khảo, thực tế có thể chênh lệch nhỏ tùy theo công ty và vùng miền.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
