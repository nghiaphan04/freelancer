import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useWallet } from "@/context/WalletContext";

export type TimeUnit = "minutes" | "days";

export interface FormData {
  title: string;
  description: string;
  context: string;
  requirements: string;
  deliverables: string;
  skills: string[];
  budget: number;
  currency: string;
  applicationDeadlineValue: number;
  applicationDeadlineUnit: TimeUnit;
  submissionValue: number;
  submissionUnit: TimeUnit;
  reviewValue: number;
  reviewUnit: TimeUnit;
  // New fields
  location: string;
  workType: "FULL_TIME" | "PART_TIME" | "";
  category: string;
  subCategory: string;
  tags: string[];
}

function toMinutes(value: number, unit: TimeUnit): number {
  return unit === "days" ? value * 24 * 60 : value;
}

export interface ContractTerm {
  title: string;
  content: string;
}

const PLATFORM_FEE_PERCENT = 5;

import { generateContractHash } from "@/lib/contractHash";

function formatLocalDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

export function usePostJobForm(onSuccess?: () => void) {
  const { isConnected, address,  connect, taoKyQuy } = useWallet();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "confirm" | "processing">("form");

  const [formData, setFormData] = useState<FormData>(() => ({
    title: "Freelancer Kỹ sư bóc tách khối lượng & shopdrawing (Remote)",
    description:
      "Tuyển Freelancer Kỹ sư bóc tách khối lượng và triển khai shopdrawing làm việc hoàn toàn từ xa theo từng dự án, thanh toán qua ký quỹ trên nền tảng. Công việc bao gồm đọc bản vẽ thiết kế, bóc tách khối lượng, lập BOQ/dự toán sơ bộ và triển khai bản vẽ shopdrawing chi tiết cho các hạng mục được giao.",
    context:
      "Dự án thi công hệ thống cơ điện/ELV và hạng mục xây dựng dân dụng (nhà cao tầng, nhà xưởng hoặc khối văn phòng). Bên thuê cần kỹ sư hỗ trợ ngắn hạn theo từng gói công việc, toàn bộ trao đổi và bàn giao hồ sơ được thực hiện online, không yêu cầu có mặt tại công trình.",
    requirements:
      "- Tối thiểu 01 năm kinh nghiệm bóc tách khối lượng, lập BOQ hoặc triển khai shopdrawing cho công trình thực tế.\n- Thành thạo AutoCAD; biết sử dụng phần mềm dự toán (G8/Eta/khác) là lợi thế.\n- Đọc hiểu tốt bản vẽ kiến trúc, kết cấu, M&E/ELV; nắm cơ bản các tiêu chuẩn và định mức áp dụng.\n- Có máy tính, Internet ổn định; quen làm việc qua email, chat, video call và chia sẻ file.\n- Ưu tiên có portfolio các dự án tương tự (PDF/bản vẽ/bảng khối lượng).",
    deliverables:
      "- File Excel bóc tách khối lượng chi tiết theo từng hạng mục/cấu kiện.\n- File Excel BOQ/dự toán sơ bộ (hoặc theo mẫu Bên thuê cung cấp).\n- Bộ bản vẽ shopdrawing/bố trí mặt bằng và chi tiết liên quan (DWG + PDF xuất kèm).\n- Ghi chú rõ giả định, tiêu chuẩn, định mức và bộ đơn giá sử dụng.",
    skills: ["QS", "BoQ", "AutoCAD", "Shopdrawing", "Dự toán"],
    budget: 1,
    currency: "APT",
    applicationDeadlineValue: 3,
    applicationDeadlineUnit: "days",
    submissionValue: 7,
    submissionUnit: "days",
    reviewValue: 3,
    reviewUnit: "days",
    // New fields
    location: "Hà Nội, Quận Cầu Giấy",
    workType: "FULL_TIME",
    category: "",
    subCategory: "",
    tags: [],
  }));

  const escrowAmount = formData.budget * (1 + PLATFORM_FEE_PERCENT / 100);
  const platformFee = formData.budget * (PLATFORM_FEE_PERCENT / 100);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numericFields = ["budget", "applicationDeadlineValue", "submissionValue", "reviewValue"];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value ? Number(value) : undefined) : value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề công việc");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Vui lòng nhập mô tả công việc");
      return false;
    }
    if (!formData.budget || formData.budget < 0.01) {
      toast.error("Ngân sách tối thiểu 0.01 APT");
      return false;
    }
    if (!formData.applicationDeadlineValue || formData.applicationDeadlineValue < 1) {
      toast.error("Hạn nộp hồ sơ tối thiểu 1");
      return false;
    }
    if (!formData.submissionValue || formData.submissionValue < 1) {
      toast.error("Thời gian nộp sản phẩm tối thiểu 1");
      return false;
    }
    if (!formData.reviewValue || formData.reviewValue < 1) {
      toast.error("Thời gian nghiệm thu tối thiểu 1");
      return false;
    }
    // New field validations
    if (!formData.location.trim()) {
      toast.error("Vui lòng nhập địa điểm công việc");
      return false;
    }
    if (!formData.workType) {
      toast.error("Vui lòng chọn loại hình công việc");
      return false;
    }
    if (!formData.category) {
      toast.error("Vui lòng chọn danh mục công việc");
      return false;
    }
    if (!formData.subCategory) {
      toast.error("Vui lòng chọn tiểu mục công việc");
      return false;
    }
    return true;
  };

  const handleProceedToConfirm = async () => {
    if (!validateForm()) return;

    if (!isConnected) {
      const connected = await connect();
      if (!connected) {
        toast.error("Vui lòng cài đặt và kết nối ví Petra để tiếp tục");
        return;
      }
    }



    setStep("confirm");
  };

  const handleSaveDraft = async (contractTerms: ContractTerm[]) => {
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề công việc");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Vui lòng nhập mô tả công việc");
      return;
    }

    setIsSubmitting(true);
    try {
      const deadlineMinutes = toMinutes(formData.applicationDeadlineValue, formData.applicationDeadlineUnit);
      const deadlineDate = formData.applicationDeadlineValue
        ? new Date(Date.now() + deadlineMinutes * 60 * 1000)
        : undefined;
      const applicationDeadline = deadlineDate ? formatLocalDateTime(deadlineDate) : undefined;
      const submissionDays = formData.submissionUnit === "days" ? formData.submissionValue : Math.ceil(formData.submissionValue / (24 * 60));
      const reviewDays = formData.reviewUnit === "days" ? formData.reviewValue : Math.ceil(formData.reviewValue / (24 * 60));
      
      const response = await api.createJob({
        title: formData.title,
        description: formData.description,
        context: formData.context,
        requirements: formData.requirements,
        deliverables: formData.deliverables,
        skills: formData.skills,
        budget: formData.budget,
        currency: formData.currency,
        applicationDeadline,
        submissionDays,
        reviewDays,
        location: formData.location,
        categoryId: formData.category ? Number(formData.category) : undefined,
        subCategoryId: formData.subCategory ? Number(formData.subCategory) : undefined,
        tags: formData.tags,
        saveAsDraft: true,
      });

      if (response.status === "SUCCESS" && response.data?.id) {
        const validTerms = contractTerms.filter(t => t.title.trim() || t.content.trim());
        const contractData = {
          budget: formData.budget || 0,
          currency: formData.currency || "APT",
          deadlineDays: submissionDays,
          reviewDays,
          requirements: formData.requirements || "",
          deliverables: formData.deliverables || "",
          terms: validTerms,
        };
        await api.createJobContract(response.data.id, contractData);
        toast.success("Đã lưu bản nháp!");
        onSuccess?.();
      } else {
        toast.error(response.message || "Không thể lưu bản nháp");
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (contractTerms: ContractTerm[]) => {
    if (!isConnected || !address) {
      toast.error("Vui lòng kết nối ví");
      return;
    }

    if (!formData.applicationDeadlineValue || formData.applicationDeadlineValue < 1) {
      toast.error("Hạn nộp hồ sơ tối thiểu 1");
      return;
    }

    setStep("processing");
    setIsSubmitting(true);

    const deadlineMinutes = toMinutes(formData.applicationDeadlineValue, formData.applicationDeadlineUnit);
    const submissionMinutes = toMinutes(formData.submissionValue, formData.submissionUnit);
    const reviewMinutes = toMinutes(formData.reviewValue, formData.reviewUnit);

    try {
      const contractData = {
        budget: formData.budget,
        currency: formData.currency || "APT",
        deadlineDays: submissionMinutes,
        reviewDays: reviewMinutes,
        requirements: formData.requirements || "",
        deliverables: formData.deliverables || "",
        terms: contractTerms.filter(t => t.title.trim() || t.content.trim()),
      };

      toast.info("Đang tạo hợp đồng...");
      const contractHash = await generateContractHash(contractData);

      const amountInOcta = Math.floor(formData.budget * 100_000_000);
      const hanUngTuyen = deadlineMinutes * 60;
      const thoiGianLam = submissionMinutes * 60;
      const thoiGianDuyet = reviewMinutes * 60;
      const cid = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const result = await taoKyQuy(cid, contractHash, amountInOcta, hanUngTuyen, thoiGianLam, thoiGianDuyet);
      
      if (!result) {
        throw new Error("Không thể tạo công việc");
      }

      const { txHash, escrowId } = result;
      const deadlineDate = new Date(Date.now() + deadlineMinutes * 60 * 1000);
      const applicationDeadline = formatLocalDateTime(deadlineDate);
      
      try {
        const response = await api.createJob({
          title: formData.title,
          description: formData.description,
          context: formData.context,
          requirements: formData.requirements,
          deliverables: formData.deliverables,
          skills: formData.skills,
          budget: formData.budget,
          currency: formData.currency,
          applicationDeadline,
          submissionDays: formData.submissionUnit === "days" ? formData.submissionValue : Math.ceil(formData.submissionValue / (24 * 60)),
          reviewDays: formData.reviewUnit === "days" ? formData.reviewValue : Math.ceil(formData.reviewValue / (24 * 60)),
          location: formData.location,
          categoryId: formData.category ? Number(formData.category) : undefined,
          subCategoryId: formData.subCategory ? Number(formData.subCategory) : undefined,
          tags: formData.tags,
          escrowId,
          walletAddress: address,
          txHash,
        });

        if (response.status === "SUCCESS" && response.data?.id) {
          await api.createJobContract(response.data.id, { ...contractData, contractHash });
          toast.success("Tạo công việc thành công!");
          onSuccess?.();
        } else {
          throw new Error(response.message || "Không thể lưu công việc");
        }
        } catch (dbError) {
          const err = dbError as Error;
          toast.error("Lưu DB thất bại, đang hoàn tiền...");
          try {
            await api.cancelEscrow(escrowId);
            toast.info("Đã hoàn tiền escrow");
          } catch {
            toast.error("Không thể hoàn tiền tự động. Escrow ID: " + escrowId);
          }
          throw err;
        }
      } catch (error) {
        const err = error as Error;
        console.error("Error creating job:", err);
        if (err.message?.includes("User rejected")) {
          toast.error("Bạn đã hủy thao tác");
        } else {
          toast.error(err.message || "Đã có lỗi xảy ra");
        }
        setStep("form");
      } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    step,
    setStep,
    isSubmitting,
    escrowAmount,
    platformFee,
    handleChange,
    handleProceedToConfirm,
    handleSaveDraft,
    handleSubmit,
    PLATFORM_FEE_PERCENT,
  };
}
