"use client";

import { useState, useRef } from "react";
import Icon from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, CVScoreResult } from "@/lib/api";
import { toast } from "sonner";

interface JobApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
  coverLetter: string;
  onCoverLetterChange: (value: string) => void;
  onSubmit: (cvFileId?: number) => void;
  isLoading: boolean;
  walletAddress: string | null;
  isWalletConnected: boolean;
  onConnectWallet: () => void;
  isWalletConnecting: boolean;
}

export default function JobApplyDialog({
  open,
  onOpenChange,
  jobTitle,
  coverLetter,
  onCoverLetterChange,
  onSubmit,
  isLoading,
  walletAddress,
  isWalletConnected,
  onConnectWallet,
  isWalletConnecting,
}: JobApplyDialogProps) {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileId, setCvFileId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cvScore, setCvScore] = useState<CVScoreResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    if (!isLoading && !isUploading) {
      onOpenChange(false);
      setCvFile(null);
      setCvFileId(null);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Chỉ chấp nhận file PDF, DOC, DOCX");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File CV không được vượt quá 5MB");
      return;
    }

    setCvFile(file);
    setIsUploading(true);

    try {
      const response = await api.uploadDocument(file, "APPLICATION_CV");
      if (response.status === "SUCCESS" && response.data) {
        setCvFileId(response.data.id);
        toast.success("Tải CV thành công");
      } else {
        toast.error("Không thể tải CV lên");
        setCvFile(null);
      }
    } catch {
      toast.error("Không thể tải CV lên");
      setCvFile(null);
    } finally {
      setIsUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveCv = () => {
    setCvFile(null);
    setCvFileId(null);
    setCvScore(null);
  };

  const handleEvaluateCV = async () => {
    if (!cvFile) return;
    
    setIsEvaluating(true);
    try {
      const uploadRes = await api.uploadCVToScoring(cvFile);
      const jobText = `${jobTitle}\n${coverLetter || ""}`;
      
      const jobRes = await fetch(`${process.env.NEXT_PUBLIC_CV_SCORING_URL || "http://localhost:8081"}/api/job/create?job_text=${encodeURIComponent(jobText)}`, {
        method: "POST",
      });
      const jobData = await jobRes.json();
      
      const score = await api.analyzeCV(uploadRes.cv_id, jobData.job_id);
      setCvScore(score);
      toast.success(`Đánh giá CV: ${score.final_score.toFixed(1)} điểm`);
    } catch {
      toast.error("Không thể đánh giá CV");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSubmit = () => {
    onSubmit(cvFileId ?? undefined);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} >
      <DialogContent className="min-w-4xl" showCloseButton={!isLoading && !isUploading}>
        <DialogHeader>
          <DialogTitle>Ứng tuyển công việc</DialogTitle>
          <DialogDescription className="truncate">
            Gửi đơn ứng tuyển cho công việc &quot;{jobTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 ">
          {/* Wallet Connect Prompt - Only show when not connected */}
          {!isWalletConnected && (
            <div className="p-3 rounded-lg border bg-amber-50 border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="account_balance_wallet" size={18} className="text-amber-600" />
                  <p className="text-sm font-medium text-amber-800">Cần kết nối ví Aptos</p>
                </div>
                <Button
                  size="sm"
                  onClick={onConnectWallet}
                  disabled={isWalletConnecting || isLoading}
                  className="bg-[#00b14f] hover:bg-[#009643]"
                >
                  {isWalletConnecting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                      Đang kết nối
                    </>
                  ) : (
                    "Kết nối ví"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* CV Upload */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              CV / Hồ sơ năng lực <span className="text-red-500">*</span>
            </p>
            {cvFile ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <Icon name="picture_as_pdf" size={22} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p 
                      className="text-sm font-medium text-gray-800 truncate"
                      title={cvFile.name}
                    >
                      {cvFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(cvFile.size)}
                      {isUploading && " • Đang tải lên..."}
                      {cvFileId && " • ✓ Đã tải lên"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCv}
                    disabled={isLoading || isUploading}
                    className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>

                {/* Hiển thị điểm sau khi đánh giá */}
                {cvScore && (
                  <div className={`p-3 rounded-lg text-center ${cvScore.final_score >= 50 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className="text-xs text-gray-500 mb-1">Điểm đánh giá CV</p>
                    <p className={`text-2xl font-bold ${cvScore.final_score >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {cvScore.final_score.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {cvScore.final_score >= 75 ? 'Phù hợp cao' : cvScore.final_score >= 50 ? 'Phù hợp trung bình' : 'Phù hợp thấp'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploading}
                className="w-full p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-[#00b14f] hover:bg-[#00b14f]/5 transition-all text-center group disabled:opacity-50"
              >
                <Icon name="upload_file" size={28} className="text-gray-400 group-hover:text-[#00b14f] mx-auto mb-1" />
                <p className="text-sm text-gray-500 group-hover:text-[#00b14f]">
                  Nhấn để tải lên CV (PDF, DOC, DOCX - tối đa 5MB)
                </p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Cover Letter - Email Format */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <p className="text-xs text-gray-500">Thư ứng tuyển</p>
            </div>
            <Textarea
              id="coverLetter"
              placeholder={`Kính gửi Nhà tuyển dụng,

Tôi viết thư này để bày tỏ sự quan tâm của mình đối với vị trí "${jobTitle}".

[Giới thiệu về bản thân và kinh nghiệm liên quan]

[Lý do bạn phù hợp với công việc này]

Trân trọng,
[Tên của bạn]`}
              value={coverLetter}
              onChange={(e) => onCoverLetterChange(e.target.value)}
              disabled={isLoading}
              className="border-0 rounded-none min-h-[200px] focus-visible:ring-0 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading || isUploading}>
            Hủy
          </Button>
          

          
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || isUploading || !isWalletConnected || !cvFileId} 
            className="bg-[#00b14f] hover:bg-[#009643]"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Icon name="send" size={16} />
                Gửi ứng tuyển
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
