"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { toast } from "sonner";
import { api, JobApplication } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { Job } from "@/types/job";
import { formatAdvancedDeadline, formatRelativeTime, formatSubmissionDeadline, formatReviewDeadline, formatFullDateTime } from "@/utils/dateFormat";
import Icon from "@/components/ui/Icon";
import JobDetailHeader from "./JobDetailHeader";
import JobDetailContent from "./JobDetailContent";
import JobDetailSidebar from "./JobDetailSidebar";
import JobApplyDialog from "./JobApplyDialog";
import JobCard from "../cards/JobCard";

const DEFAULT_COVER_LETTER = "Chào anh/chị,\n\nTôi rất quan tâm đến vị trí này và tin rằng kỹ năng cùng kinh nghiệm của tôi sẽ phù hợp với yêu cầu công việc.\n\nRất mong được hợp tác cùng anh/chị.\n\nTrân trọng.";

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isConnected: isWalletConnected, address: walletAddress, connect: connectWallet, isConnecting: isWalletConnecting } = useWallet();
  const jobId = Number(params.id);

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);

  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState(DEFAULT_COVER_LETTER);
  const [isApplying, setIsApplying] = useState(false);
  const [myApplication, setMyApplication] = useState<JobApplication | null>(null);

  const isOwner = user && job && user.id === job.employer.id;
  const hasApplied = !!myApplication && myApplication.status !== "REJECTED";

  useEffect(() => {
    const fetchJob = async () => {
      try {
        console.log('Fetching job with ID:', jobId);
        const response = await api.getJobById(jobId);
        console.log('Job API response:', response);
        if (response.status === "SUCCESS" && response.data) {
          setJob(response.data);
          try {
            const relatedRes = await api.getOpenJobs({ size: 4 });
            if (relatedRes.status === "SUCCESS" && relatedRes.data) {
              setRelatedJobs(relatedRes.data.content.filter(j => j.id !== jobId).slice(0, 3));
            }
          } catch (e) {
            console.error('Failed to fetch related jobs', e);
          }
        } else {
          setError(response.message || "Không tìm thấy công việc");
        }
      } catch (err) {
        console.error('Job fetch error:', err);
        setError("Đã có lỗi xảy ra");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMyApplication = async () => {
      try {
        const response = await api.getMyApplicationForJob(jobId);
        if (response.status === "SUCCESS" && response.data) {
          setMyApplication(response.data);
        }
      } catch {
        // Ignore error for application fetching
      }
    };

    const fetchSavedStatus = async () => {
      try {
        const response = await api.getSavedJobIds();
        if (response.status === "SUCCESS" && Array.isArray(response.data)) {
          setIsSaved(response.data.includes(jobId));
        }
      } catch {
        // Ignore errors
      }
    };

    if (jobId) {
      fetchJob();
      if (user) {
        fetchMyApplication();
        fetchSavedStatus();
      }
    }
  }, [jobId, user]);

  const handleToggleStatus = async () => {
    if (!job) return;
    setIsToggling(true);
    try {
      const response = await api.toggleJobStatus(jobId);
      if (response.status === "SUCCESS" && response.data) {
        setJob(response.data);
        toast.success("Cập nhật trạng thái thành công");
      } else {
        toast.error(response.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error("Không thể cập nhật trạng thái");
    } finally {
      setIsToggling(false);
    }
  };

  const handleConnectWallet = async () => {
    const connected = await connectWallet();
    if (!connected) {
      toast.error("Vui lòng cài đặt và kết nối ví Petra để ứng tuyển");
    }
  };

  const handleApply = async (cvFileId?: number) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để ứng tuyển");
      router.push("/login");
      return;
    }

    if (!isWalletConnected || !walletAddress) {
      toast.error("Vui lòng kết nối ví Aptos để ứng tuyển");
      return;
    }

    setIsApplying(true);
    try {
      const response = await api.applyJob(jobId, { 
        coverLetter: coverLetter.trim() || undefined,
        walletAddress: walletAddress,
        cvFileId: cvFileId,
      });
      if (response.status === "SUCCESS" && response.data) {
        toast.success("Ứng tuyển thành công!");
        setShowApplyDialog(false);
        setCoverLetter("");
        setMyApplication(response.data);
        if (job) {
          setJob({ ...job, applicationCount: job.applicationCount + 1 });
        }
      } else {
        toast.error(response.message || "Không thể ứng tuyển");
      }
    } catch (error) {
      console.error('Apply error:', error);
      toast.error("Không thể ứng tuyển");
    } finally {
      setIsApplying(false);
    }
  };

  const handleSaveJob = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu công việc");
      router.push("/login");
      return;
    }

    // Optimistic update
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);

    try {
      await api.toggleSaveJob(jobId);
      toast.success(newIsSaved ? "Đã lưu công việc" : "Đã bỏ lưu công việc");
    } catch (error) {
      // Revert on error
      setIsSaved(!newIsSaved);
      toast.error("Có lỗi xảy ra khi lưu công việc");
    }
  };

  const handleQuitJob = async () => {
    if (!job) return;
    
    const confirmQuit = confirm(
      "Bạn có chắc chắn muốn rút khỏi công việc này không?\n\n" +
      "Lưu ý: Hành động này sẽ được ghi lại và điểm 'Bất tín nhiệm' của bạn sẽ tăng thêm +1. Công việc sẽ được mở lại cho người khác."
    );
    
    if (!confirmQuit) return;

    try {
      const response = await api.quitJob(jobId);
      if (response.status === "SUCCESS" && response.data) {
        setJob(response.data);
        setMyApplication(prev => prev ? { ...prev, status: "WITHDRAWN" as any } : null);
        toast.success("Đã rút khỏi công việc thành công");
        router.refresh();
      } else {
        toast.error(response.message || "Không thể rút khỏi công việc");
      }
    } catch (error) {
      console.error('Quit job error:', error);
      toast.error("Có lỗi xảy ra khi rút khỏi công việc");
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "APT") {
      return `${amount.toFixed(4)} APT`;
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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

  if (error || !job) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#00b14f] mb-4"
      >
        <Icon name="arrow_back" size={20} />
        Quay lại
      </button>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b14f] mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải thông tin công việc...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <Icon name="error" size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#00b14f] text-white rounded-lg hover:bg-[#00a045] transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Job Content */}
      {!isLoading && !error && job && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <JobDetailHeader
              job={job}
              isOwner={!!isOwner}
              hasApplied={hasApplied}
              applicationStatus={myApplication?.status}
              formatCurrency={formatCurrency}
              formatRelativeTime={formatRelativeTime}
              formatFullDateTime={formatFullDateTime}
              onApply={() => setShowApplyDialog(true)}
              isSaved={isSaved}
              onSave={handleSaveJob}
            />
            <JobDetailContent job={job} relatedJobs={relatedJobs} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <JobDetailSidebar
              job={job}
              isOwner={!!isOwner}
              isToggling={isToggling}
              myApplication={myApplication}
              onApply={() => setShowApplyDialog(true)}
              onToggleStatus={handleToggleStatus}
              onQuit={handleQuitJob}
              formatDate={formatAdvancedDeadline}
              formatSubmissionDeadline={formatSubmissionDeadline}
              formatReviewDeadline={formatReviewDeadline}
              formatRelativeTime={formatRelativeTime}
              formatFullDateTime={formatFullDateTime}
            />
          </div>
        </div>
      )}

      {/* Apply Dialog */}
      {!isLoading && !error && job && (
        <JobApplyDialog
          open={showApplyDialog}
          onOpenChange={setShowApplyDialog}
          jobTitle={job.title}
          coverLetter={coverLetter}
          onCoverLetterChange={setCoverLetter}
          onSubmit={handleApply}
          isLoading={isApplying}
          walletAddress={walletAddress}
          isWalletConnected={isWalletConnected}
          onConnectWallet={handleConnectWallet}
          isWalletConnecting={isWalletConnecting}
        />
      )}
    </div>
  );
}
