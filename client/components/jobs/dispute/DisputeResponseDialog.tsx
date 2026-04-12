"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api, Dispute, DISPUTE_STATUS_CONFIG } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Icon from "@/components/ui/Icon";
import { FileUpload } from "@/components/ui/file-upload";
import EvidenceCard, { EvidenceMeta, formatFileSize } from "./EvidenceCard";
import renderEvidenceCard from "./renderEvidenceCard";

interface DisputeResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispute: Dispute;
  onSuccess?: () => void;
}

export default function DisputeResponseDialog({
  open,
  onOpenChange,
  dispute,
  onSuccess,
}: DisputeResponseDialogProps) {
  const [description, setDescription] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceMeta | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    if (!selectedEvidence?.url?.trim()) {
      toast.error("Vui lòng upload file bằng chứng (PDF)");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.submitDisputeResponse(
        dispute.id,
        description,
        selectedEvidence?.url ?? "",
        selectedEvidence?.fileId
      );
      if (response.status === "SUCCESS") {
        toast.success("Da gui phan hoi thanh cong. Qua trinh voting se bat dau.");
        setDescription("");
        setSelectedEvidence(null);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi phản hồi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canRespond = dispute.status === "PENDING_FREELANCER_RESPONSE" &&
    (!dispute.evidenceDeadline || new Date(dispute.evidenceDeadline) > new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[90vw] lg:max-w-[90vw] xl:max-w-[1000px] max-h-[95vh] overflow-y-auto scrollbar-thin rounded-lg">
        <DialogHeader className="border-b pb-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Icon name="gavel" size={24} className="text-[#00b14f]" />
                Phản hồi khiếu nại
              </DialogTitle>
              <DialogDescription className="mt-1">
                Công việc: <strong className="text-gray-900">{dispute.jobTitle}</strong>
              </DialogDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${DISPUTE_STATUS_CONFIG[dispute.status]?.color || "text-gray-600"
                }`}>
                {dispute.statusLabel}
              </span>
              {dispute.evidenceDeadline && canRespond && (
                <span className="text-xs text-orange-600 font-medium whitespace-nowrap">
                  Hạn phản hồi: {formatDateTime(dispute.evidenceDeadline)}
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Client Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b">
              <Icon name="person" size={20} className="text-blue-500" />
              <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">
                Thông tin từ bên thuê
              </h4>
            </div>
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
              <div>
                <p className="text-xs text-blue-600 font-bold mb-1 uppercase">Người khiếu nại</p>
                <p className="font-medium text-gray-900">{dispute.employer.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-bold mb-1 uppercase">Nội dung khiếu nại</p>
                <div className="bg-white p-3 rounded-lg border border-blue-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {dispute.employerDescription}
                </div>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-bold mb-2 uppercase">Bằng chứng</p>
                {renderEvidenceCard(dispute.employerEvidenceFile, dispute.employerEvidenceUrl, "Bằng chứng bên thuê")}
              </div>
            </div>
          </div>

          {/* Right Column: Freelancer Response */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b shrink-0">
              <Icon name="history_edu" size={20} className="text-[#00b14f]" />
              <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">
                Phản hồi từ bạn
              </h4>
            </div>

            <div className="flex-1 flex flex-col pt-2">
              {dispute.freelancerDescription ? (
                <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 flex-1 flex flex-col space-y-4">
                  <div className="shrink-0">
                    <p className="text-xs text-[#00b14f] font-bold mb-2 uppercase">Bằng chứng đã gửi</p>
                    {renderEvidenceCard(dispute.freelancerEvidenceFile, dispute.freelancerEvidenceUrl, "Bằng chứng phản hồi")}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <p className="text-xs text-[#00b14f] font-bold mb-1 uppercase">Nội dung phản hồi</p>
                    <div className="bg-white p-3 rounded-lg border border-green-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed flex-1 overflow-y-auto">
                      {dispute.freelancerDescription}
                    </div>
                  </div>
                </div>
              ) : canRespond ? (
                <div className="flex-1 flex flex-col space-y-6">
                  <div className="space-y-2 shrink-0">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Bằng chứng đính kèm (PDF) <span className="text-red-500">*</span>
                    </label>
                    <FileUpload
                      value={selectedEvidence?.url || ""}
                      onChange={(url, file, fileId) => {
                        if (!url) {
                          setSelectedEvidence(null);
                          return;
                        }
                        setSelectedEvidence({
                          url,
                          fileId,
                          name: file?.name,
                          size: file?.size,
                        });
                      }}
                      usage="DISPUTE_EVIDENCE"
                      label="Tải lên PDF bằng chứng"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {selectedEvidence && (
                    <div className="shrink-0">
                      <EvidenceCard
                        url={selectedEvidence.url}
                        name={selectedEvidence.name}
                        size={formatFileSize(selectedEvidence.size)}
                        label="Bằng chứng đã chọn"
                        onRemove={() => setSelectedEvidence(null)}
                      />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col space-y-2 pb-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Lý do / Nội dung phản hồi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Giải thích và bảo vệ công việc của bạn..."
                      className="flex-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b14f] text-sm resize-none shadow-sm min-h-[200px]"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                  <Icon name="info" size={20} className="text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-700">
                    Đã hết thời hạn phản hồi hoặc khiếu nại đang được xử lý. Bạn không thể gửi thêm phản hồi lúc này.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Admin Note Section - Full Width if present */}
        {dispute.adminNote && (
          <div className="mt-8 pt-6 border-t">
            <div className="bg-gray-100 p-5 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="admin_panel_settings" size={20} className="text-gray-600" />
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs">
                  Quyết định của trọng tài viên
                </h4>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {dispute.adminNote}
              </p>
              {dispute.resolvedBy && (
                <p className="text-[10px] text-gray-500 mt-4 italic">
                  Người xử lý: {dispute.resolvedBy.fullName} • {formatDateTime(dispute.resolvedAt!)}
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="mt-8 pt-4 border-t gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6 rounded-lg">
            Đóng
          </Button>
          {canRespond && !dispute.freelancerDescription && (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !description.trim() || !selectedEvidence}
              className="bg-[#00b14f] hover:bg-[#009643] text-white px-8 rounded-lg font-bold shadow-md shadow-green-200"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </div>
              ) : "Gửi phản hồi ngay"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
