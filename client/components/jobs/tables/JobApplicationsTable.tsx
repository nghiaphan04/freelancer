/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api, JobApplication, ApplicationStatus } from "@/lib/api";
import { useWallet } from "@/context/WalletContext";
import { Job } from "@/types/job";
import Icon from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WalletAvatar from "@/components/ui/WalletAvatar";
import { handleDownload } from "@/lib/download";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  PENDING: { label: "Chờ duyệt", color: "bg-gray-100 text-gray-600" },
  ACCEPTED: { label: "Đã chấp nhận", color: "bg-green-100 text-green-600" },
  REJECTED: { label: "Đã từ chối", color: "bg-gray-100 text-gray-600" },
  WITHDRAWN: { label: "Đã rút", color: "bg-gray-100 text-gray-600" },
};

const STATUS_OPTIONS: { value: ApplicationStatus | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "ACCEPTED", label: "Đã chấp nhận" },
  { value: "REJECTED", label: "Đã từ chối" },
  { value: "WITHDRAWN", label: "Đã rút" },
];

export default function JobApplicationsTable() {
  const params = useParams();
  const jobId = Number(params.id);
  const { isConnected, connect, ganNguoiLam } = useWallet();

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"accept" | "reject" | null>(null);

  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [viewingApp, setViewingApp] = useState<JobApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [showBatchRejectDialog, setShowBatchRejectDialog] = useState(false);

  const pendingApplications = filteredApplications.filter(app => app.status === "PENDING");
  const selectedPendingIds = [...selectedIds].filter(id => 
    pendingApplications.some(app => app.id === id)
  );

  const toggleSelectAll = () => {
    if (selectedPendingIds.length === pendingApplications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pendingApplications.map(app => app.id)));
    }
  };

  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBatchReject = async () => {
    if (selectedPendingIds.length === 0) return;

    setIsBatchProcessing(true);
    try {
      const res = await api.batchRejectApplications(jobId, selectedPendingIds);
      
      if (res.status === "SUCCESS" && res.data) {
        const { successCount, failCount } = res.data;
        
        // Update local state
        if (successCount > 0) {
          setApplications(apps =>
            apps.map(a =>
              selectedPendingIds.includes(a.id)
                ? { ...a, status: "REJECTED" as ApplicationStatus }
                : a
            )
          );
          toast.success(`Đã từ chối ${successCount} người làm`);
        }
        
        if (failCount > 0) {
          toast.error(`${failCount} người làm không thể từ chối`);
        }
      } else {
        toast.error(res.message || "Không thể thực hiện thao tác");
      }
    } catch {
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setSelectedIds(new Set());
      setShowBatchRejectDialog(false);
      setIsBatchProcessing(false);
    }
  };



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          api.getJobById(jobId),
          api.getJobApplications(jobId),
        ]);

        if (jobRes.status === "SUCCESS" && jobRes.data) {
          setJob(jobRes.data);
        } else {
          notFound();
          return;
        }

        if (appsRes.status === "SUCCESS" && appsRes.data) {
          setApplications(appsRes.data);
          setFilteredApplications(appsRes.data);
        }
      } catch {
        toast.error("Không thể tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  useEffect(() => {
    if (statusFilter) {
      setFilteredApplications(applications.filter((app) => app.status === statusFilter));
    } else {
      setFilteredApplications(applications);
    }
  }, [statusFilter, applications]);

  const getUntrustColor = (score: number) => {
    if (score <= 10) return "text-green-600";
    if (score <= 30) return "text-amber-500";
    return "text-red-600";
  };

  const getUntrustLabel = (score: number) => {
    if (score <= 10) return "Tốt";
    if (score <= 30) return "Cảnh báo";
    return "Báo xấu";
  };

  const REJECTION_TEMPLATE = `Trước hết, Công ty chúng tôi xin chân thành cảm ơn Anh/Chị đã quan tâm và nộp hồ sơ ứng tuyển vào vị trí tại công ty. Chúng tôi đồng thời xin lỗi vì đã để Anh/Chị chờ đợi trong quá trình xem xét và đánh giá hồ sơ. Sau khi cân nhắc kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng hồ sơ của Anh/Chị hiện chưa phù hợp với yêu cầu của vị trí tuyển dụng ở thời điểm này, do số lượng hồ sơ ứng tuyển lớn và mức độ cạnh tranh cao. Tuy nhiên, chúng tôi đánh giá cao sự quan tâm và thời gian Anh/Chị đã dành cho cơ hội này. Rất mong Anh/Chị sẽ tiếp tục theo dõi và ứng tuyển vào các vị trí phù hợp hơn tại công ty trong tương lai. Chúng tôi hy vọng sẽ có cơ hội được đồng hành cùng Anh/Chị trong những đợt tuyển dụng tiếp theo. Một lần nữa, xin chân thành cảm ơn Anh/Chị và chúc Anh/Chị nhiều thành công trong học tập cũng như sự nghiệp sắp tới. Trân trọng.`;

  const handleAction = async (app: JobApplication, action: "accept" | "reject") => {
    if (action === "accept" && !isConnected) {
      const connected = await connect();
      if (!connected) {
        toast.error("Vui lòng kết nối ví để chấp nhận người làm");
        return;
      }
    }
    
    if (action === "reject") {
      setRejectionReason(REJECTION_TEMPLATE);
    } else {
      setRejectionReason("");
    }
    
    setSelectedApp(app);
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const executeAction = async () => {
    if (!selectedApp || !confirmAction) return;

    setProcessingId(selectedApp.id);

    try {
      if (confirmAction === "accept") {
        if (!isConnected) {
          toast.error("Vui lòng kết nối ví");
          return;
        }

        if (!selectedApp.walletAddress) {
          toast.error("Người làm chưa cung cấp địa chỉ ví");
          return;
        }

        if (!job?.escrowId) {
          toast.error("Không thể thực hiện thao tác");
          return;
        }

        const txHash = await ganNguoiLam(job.escrowId, selectedApp.walletAddress);
        
        if (!txHash) {
          throw new Error("Không thể thực hiện thao tác");
        }

        const res = await api.acceptApplication(jobId, selectedApp.id, txHash);
        if (res.status === "SUCCESS") {
          toast.success("Đã chấp nhận người làm!");
          setApplications((apps) =>
            apps.map((a) =>
              a.id === selectedApp.id
                ? { ...a, status: "ACCEPTED" as ApplicationStatus }
                : a.status === "PENDING"
                  ? { ...a, status: "REJECTED" as ApplicationStatus }
                  : a
            )
          );
          setShowConfirmDialog(false);
        } else {
          toast.error(res.message || "Thao tác thất bại");
        }
      } else if (confirmAction === "reject") {
        const res = await api.rejectApplication(jobId, selectedApp.id, rejectionReason);
        if (res.status === "SUCCESS") {
          toast.success("Đã từ chối người làm");
          setApplications((apps) =>
            apps.map((a) =>
              a.id === selectedApp.id
                ? { ...a, status: "REJECTED" as ApplicationStatus }
                : a
            )
          );
          setRejectionReason(""); // Reset reason on success
          setShowConfirmDialog(false);
        } else {
          toast.error(res.message || "Thao tác thất bại");
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      if (error.message?.includes("User rejected")) {
        toast.error("Bạn đã hủy thao tác");
      } else {
        toast.error(error.message || "Đã có lỗi xảy ra");
      }
    } finally {
      setProcessingId(null);
      setSelectedApp(null);
      setConfirmAction(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#00b14f] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/jobs/${jobId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#00b14f] mb-4"
        >
          <Icon name="arrow_back" size={20} />
          Quay lại chi tiết
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Danh sách người làm</h1>
        <p className="text-gray-500 mt-1">Công việc: {job?.title}</p>
      </div>


      {/* Filter & Batch Actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | "")}
              className="h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00b14f]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {selectedPendingIds.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setShowBatchRejectDialog(true)}
              >
                <Icon name="close" size={16} />
                Từ chối {selectedPendingIds.length} người
              </Button>
            )}

          </div>
          <span className="text-sm text-gray-500">
            Tổng: {filteredApplications.length} người làm
            {pendingApplications.length > 0 && ` (${pendingApplications.length} chờ duyệt)`}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <Icon name="inbox" size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có người làm nào ứng tuyển</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 w-10">
                    {pendingApplications.length > 0 && (
                      <input
                        type="checkbox"
                        checked={selectedPendingIds.length === pendingApplications.length && pendingApplications.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-[#00b14f] focus:ring-[#00b14f]"
                        title="Chọn tất cả đang chờ duyệt"
                      />
                    )}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người làm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ ví</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kỹ năng</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày ứng tuyển</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>

                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className={`hover:bg-gray-50 ${selectedIds.has(app.id) ? "bg-blue-50" : ""}`}>
                    <td className="px-4 py-3">
                      {app.status === "PENDING" && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(app.id)}
                          onChange={() => toggleSelect(app.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#00b14f] focus:ring-[#00b14f]"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {app.freelancer.avatarUrl ? (
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={app.freelancer.avatarUrl} alt={app.freelancer.fullName} />
                            <AvatarFallback className="bg-[#00b14f] text-white text-sm">
                              {app.freelancer.fullName?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        ) : app.freelancer.walletAddress ? (
                          <WalletAvatar address={app.freelancer.walletAddress} size={40} />
                        ) : (
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-[#00b14f] text-white text-sm">
                              {app.freelancer.fullName?.charAt(0)?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{app.freelancer.fullName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5">
                              <Icon name="verified_user" size={12} />
                              {app.freelancer.trustScore || 0}
                            </span>
                            <span className={`text-[10px] font-bold flex items-center gap-0.5 ${getUntrustColor(app.freelancer.untrustScore || 0)}`}>
                              <Icon name="report_problem" size={12} />
                              {app.freelancer.untrustScore || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {app.walletAddress ? (
                        <span className="font-mono text-xs text-gray-600">
                          {app.walletAddress.slice(0, 8)}...{app.walletAddress.slice(-6)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Chưa có</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {app.freelancer.skills && app.freelancer.skills.length > 0 ? (
                        <span className="text-sm text-gray-600">
                          {app.freelancer.skills.length} kỹ năng
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[app.status]?.color}`}>
                        {STATUS_CONFIG[app.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => { setViewingApp(app); setShowDetailDialog(true); }}
                        className="text-[#00b14f] hover:underline text-sm font-medium"
                      >
                        Xem chi tiết
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={(open) => !processingId && setShowConfirmDialog(open)}>
        <DialogContent 
          className="sm:max-w-2xl"
          onPointerDownOutside={(e) => processingId && e.preventDefault()} 
          onEscapeKeyDown={(e) => processingId && e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "accept" ? "Chấp nhận người làm" : "Từ chối người làm"}
            </DialogTitle>
            <DialogDescription>
            {confirmAction === "accept"
              ? `Bạn có chắc chắn muốn chấp nhận ${selectedApp?.freelancer.fullName} cho công việc này? Các hồ sơ khác đang chờ sẽ tự động bị từ chối.`
              : `Bạn có chắc chắn muốn từ chối hồ sơ của ${selectedApp?.freelancer.fullName}?`}
          </DialogDescription>

          {confirmAction === "reject" && (
            <div className="space-y-2 py-4">
              <Label htmlFor="rejection-reason" className="text-sm font-bold text-gray-700">Lý do từ chối (không bắt buộc)</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Ví dụ: Kỹ năng của bạn chưa phù hợp với yêu cầu hiện tại..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px] text-sm"
              />
              <p className="text-[11px] text-gray-500 italic">Lý do này sẽ được gửi đến ứng viên để họ biết lý do không được chọn.</p>
            </div>
          )}
        </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={!!processingId}>
              Hủy
            </Button>
            <Button
              onClick={executeAction}
              disabled={!!processingId}
              className={confirmAction === "accept" ? "bg-[#00b14f] hover:bg-[#009643]" : "bg-gray-600 hover:bg-gray-700"}
            >
        {processingId ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                confirmAction === "accept" ? "Chấp nhận" : "Từ chối"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODERN JOB APPLICATION DETAIL DIALOG */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-6xl h-[90vh] sm:h-[80vh] grid grid-rows-[auto_1fr_auto] p-0 overflow-hidden shadow-xl border-none">
          <DialogHeader className="p-4 border-b bg-white">
             <DialogTitle className="text-sm font-bold text-black uppercase tracking-widest text-center shadow-none">Chi tiết hồ sơ ứng tuyển</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto min-h-0 bg-white">
            <div className="p-6 space-y-6 pb-8">
               {/* Candidate Brief Profile */}
               <div className="flex items-center gap-4 p-1">
                  {viewingApp?.freelancer.avatarUrl ? (
                    <Avatar className="w-14 h-14 border shadow-sm">
                      <AvatarImage src={viewingApp.freelancer.avatarUrl} />
                      <AvatarFallback>{viewingApp.freelancer.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <WalletAvatar address={viewingApp?.freelancer.walletAddress || ""} size={56} />
                  )}
                  <div className="space-y-1">
                     <h3 className="text-lg font-black text-black leading-tight">{viewingApp?.freelancer.fullName}</h3>
                     <div className="flex items-center gap-2">
                        <Badge className={`${STATUS_CONFIG[viewingApp?.status || "PENDING"]?.color} font-bold px-2 py-0.5 text-[10px] flex items-center gap-1.5 border-none shadow-none`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                          {STATUS_CONFIG[viewingApp?.status || "PENDING"]?.label}
                        </Badge>
                        <div className="h-3 w-px bg-gray-200" />
                        <span className="text-[11px] text-black font-bold flex items-center gap-1.5">
                           <Icon name="verified_user" size={14} className="text-blue-500" />
                           Tín nhiệm: {viewingApp?.freelancer.trustScore || 0}
                        </span>
                        <div className="h-3 w-px bg-gray-200" />
                        <span className={`text-[11px] font-bold flex items-center gap-1.5 ${getUntrustColor(viewingApp?.freelancer.untrustScore || 0)}`}>
                           <Icon name="report_problem" size={14} />
                           Bất tín nhiệm: {viewingApp?.freelancer.untrustScore || 0} ({getUntrustLabel(viewingApp?.freelancer.untrustScore || 0)})
                        </span>
                     </div>
                  </div>
               </div>

               {/* Skills & CV */}
               <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-1">
                  <div className="md:col-span-8 space-y-2">
                    <h4 className="text-[10px] font-bold text-black uppercase tracking-widest">Kỹ năng chuyên môn</h4>
                    <div className="flex flex-wrap gap-2.5">
                       {viewingApp?.freelancer.skills && viewingApp.freelancer.skills.length > 0 ? (
                         viewingApp.freelancer.skills.map(s => (
                           <Badge key={s} variant="secondary" className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-800 font-bold rounded-lg text-xs shadow-sm">
                             {s}
                           </Badge>
                         ))
                       ) : (
                         <span className="text-xs text-gray-400 italic">Chưa cập nhật</span>
                       )}
                    </div>
                  </div>
                  <div className="md:col-span-4 space-y-2">
                    <h4 className="text-[10px] font-bold text-black uppercase tracking-widest">Hồ sơ chuyên môn (CV)</h4>
                    {viewingApp?.cvFileUrl ? (
                       <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-between h-8 py-1 px-3 text-[#00b14f]  rounded-lg group"
                        onClick={() => handleDownload(viewingApp.cvFileUrl!, viewingApp.cvFileName || "CV.pdf")}
                       >
                          <div className="flex items-center">
                            <Icon name="description" size={16} className="mr-2 text-red-500" />
                            <span className="font-bold text-gray-700 text-[10px] line-clamp-1">{viewingApp.cvFileName || "Xem Profile CV"}</span>
                          </div>
                          <Icon name="download" size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                       </Button>
                    ) : (
                       <p className="text-[10px] text-gray-400 italic bg-gray-50 p-2 rounded-lg text-center border border-dashed border-gray-100">Không có CV.</p>
                    )}
                  </div>
               </div>

               <Separator className="opacity-50" />

               {/* Cover Letter */}
               <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-black uppercase tracking-widest">Thư ứng tuyển</h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-4 rounded-xl border border-gray-100/50">
                     {viewingApp?.coverLetter || "Không có nội dung thư ứng tuyển."}
                  </p>
               </div>

               <Separator className="opacity-50" />

               {/* AI Evaluation */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-black uppercase tracking-widest">Phân tích AI</h4>
                    <div className="flex items-center gap-1.5">
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Điểm tương thích:</span>
                       <span className="text-[11px] font-black">{(viewingApp as any)?.aiScore || 0}/100</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {(() => {
                        const explanation = (viewingApp as any)?.aiExplanation || "";
                        const isFormatMatch = explanation.toLowerCase().includes("điểm yếu:");
                        
                        if (!isFormatMatch) {
                          return <div className="col-span-2 text-xs text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed italic">{explanation || "Chưa có đữ liệu phân tích"}</div>;
                        }

                        const parts = explanation.split(/điểm yếu:/i);
                        const strengthsStr = parts[0].replace(/điểm mạnh:/i, "").trim();
                        const weaknessesStr = parts[1]?.trim() || "";

                        const renderPoints = (text: string) => text.split("\n").filter(l => l.trim()).map((line, i) => (
                          <div key={i} className="flex gap-2 mb-1.5 last:mb-0 text-[13px] text-gray-700 font-normal leading-relaxed">
                            <span className="font-bold opacity-30 mt-0.5">•</span>
                            <span>{line.replace(/^- /g, "").replace(/\*/g, "")}</span>
                          </div>
                        ));

                        return (
                          <>
                            <div className="p-4 rounded-xl border border-green-100 bg-green-50/10">
                              <p className="text-[11px] font-bold text-green-900 uppercase tracking-widest mb-3 border-b border-green-200 pb-2">Ưu điểm</p>
                              <div className="space-y-1">{renderPoints(strengthsStr)}</div>
                            </div>
                            <div className="p-4 rounded-xl border border-red-100 bg-red-50/10">
                              <p className="text-[11px] font-bold text-red-900 uppercase tracking-widest mb-3 border-b border-red-200 pb-2">Cần lưu ý</p>
                              <div className="space-y-1">{renderPoints(weaknessesStr)}</div>
                            </div>
                          </>
                        );
                     })()}
                  </div>
               </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t bg-white">
             <Button variant="ghost" size="sm" className="text-gray-500 font-bold text-[11px] hover:bg-gray-50" onClick={() => setShowDetailDialog(false)}>Đóng hồ sơ</Button>
             <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => { setShowDetailDialog(false); handleAction(viewingApp!, "reject"); }}
                  disabled={viewingApp?.status !== "PENDING" || !!processingId}
                  className={`border-red-200 text-red-600 bg-white hover:bg-red-50 ${viewingApp?.status !== "PENDING" ? "hidden" : ""}`}
                >
                  Từ chối
                </Button>
                <Button
                  onClick={() => { setShowDetailDialog(false); handleAction(viewingApp!, "accept"); }}
                  disabled={viewingApp?.status !== "PENDING" || !!processingId || !viewingApp?.walletAddress}
                  className={`bg-[#00b14f] hover:bg-[#009643] text-white ${viewingApp?.status !== "PENDING" ? "hidden" : ""}`}
                >
                  Chấp nhận
                </Button>
             </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Batch Reject Dialog */}
      <Dialog open={showBatchRejectDialog} onOpenChange={(o) => !isBatchProcessing && setShowBatchRejectDialog(o)}>
        <DialogContent
          showCloseButton={!isBatchProcessing}
          onPointerDownOutside={(e) => isBatchProcessing && e.preventDefault()}
          onEscapeKeyDown={(e) => isBatchProcessing && e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Từ chối hàng loạt</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn từ chối {selectedPendingIds.length} người làm đã chọn?
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <p className="text-sm text-gray-600 mb-2">Danh sách sẽ bị từ chối:</p>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {applications
                .filter(app => selectedPendingIds.includes(app.id))
                .map(app => (
                  <div key={app.id} className="flex items-center gap-2 text-sm py-1 px-2 bg-gray-50 rounded">
                    {app.freelancer.avatarUrl ? (
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={app.freelancer.avatarUrl} />
                        <AvatarFallback className="bg-gray-200 text-xs">
                          {app.freelancer.fullName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : app.freelancer.walletAddress ? (
                      <WalletAvatar address={app.freelancer.walletAddress} size={24} />
                    ) : (
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-gray-200 text-xs">
                          {app.freelancer.fullName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <span>{app.freelancer.fullName}</span>
                  </div>
                ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchRejectDialog(false)} disabled={isBatchProcessing}>
              Hủy
            </Button>
            <Button
              onClick={handleBatchReject}
              disabled={isBatchProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBatchProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Icon name="close" size={16} />
                  Từ chối tất cả
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
