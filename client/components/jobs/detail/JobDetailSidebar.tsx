"use client";

import Link from "next/link";
import { Job, WORK_TYPE_CONFIG } from "@/types/job";
import { JobApplication } from "@/lib/api";
import Icon from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WalletAvatar from "@/components/ui/WalletAvatar";

const APPLICATION_STATUS_CONFIG = {
  PENDING: { label: "Đang chờ duyệt", color: "text-gray-600" },
  ACCEPTED: { label: "Đã được chấp nhận", color: "text-gray-600" },
  REJECTED: { label: "Đã bị từ chối", color: "text-gray-600" },
  WITHDRAWN: { label: "Đã rút đơn", color: "text-gray-600" },
};

interface JobDetailSidebarProps {
  job: Job;
  isOwner: boolean;
  isToggling: boolean;
  myApplication: JobApplication | null;
  onApply: () => void;
  onToggleStatus: () => void;
  onQuit?: () => void;
  formatDate: (dateString: string) => string;
  formatSubmissionDeadline?: (dateString: string) => string;
  formatReviewDeadline?: (dateString: string) => string;
  formatRelativeTime?: (dateString: string) => string;
  formatFullDateTime?: (dateString: string) => string;
}

export default function JobDetailSidebar({
  job,
  isOwner,
  isToggling,
  myApplication,
  onApply,
  onToggleStatus,
  onQuit,
  formatDate,
  formatSubmissionDeadline,
  formatReviewDeadline,
  formatRelativeTime,
  formatFullDateTime,
}: JobDetailSidebarProps) {
  return (
    <div className="space-y-3">
      {/* Employer Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bên thuê</h2>
        <div className="flex flex-col mb-4">
          {/* Hình chữ nhật 1 hàng riêng */}
          <div className="w-full h-42 relative rounded-1 overflow-hidden bg-gray-100 flex items-center justify-center mb-4 border shadow-sm">
            {job.employer.avatarUrl ? (
              <img
                src={job.employer.avatarUrl}
                alt={job.employer.fullName}
                className="object-cover w-full h-full"
              />
            ) : job.employer.walletAddress ? (
              <WalletAvatar address={job.employer.walletAddress} size={64} />
            ) : (
              <div className="bg-[#00b14f] text-white w-full h-full flex items-center justify-center text-4xl font-semibold">
                {job.employer.fullName?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900 flex items-center gap-1 text-base">
              {job.employer.fullName}
              {job.employer.isVerified && (
                <Icon name="verified" size={18} className="text-[#00b14f]" />
              )}
            </p>
            {job.employer.title && (
              <p className="text-sm text-gray-500 mb-2">{job.employer.title}</p>
            )}
            {/* Trust Score */}
            <div className="flex items-center gap-3 mt-2 text-sm bg-gray-50 px-3 py-2 rounded-md">
              <span className="flex items-center gap-1 text-green-700 font-medium">
                <Icon name="verified" size={16} />
                Tín nhiệm: {job.employer.trustScore ?? 0}
              </span>
              <span className="flex items-center gap-1 text-red-600 font-medium">
                <Icon name="dangerous" size={16} />
                Bất tín nhiệm: {job.employer.untrustScore ?? 0}
              </span>
            </div>
          </div>
        </div>
        {job.employer.company && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Icon name="business" size={16} className="text-gray-400" />
            {job.employer.company}
          </div>
        )}
        {job.employer.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Icon name="location_on" size={16} className="text-gray-400" />
            {job.employer.location}
          </div>
        )}
      </div>

      {/* Thông tin chung Card */}
      <div className="bg-white rounded-lg shadow p-6">

        <div className="space-y-6">

          {(job.category || job.subCategory) && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">Danh mục Nghề liên quan</h3>
              <div className="flex flex-wrap gap-2">
                {job.category && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {job.category.name}
                  </span>
                )}
                {job.subCategory && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {job.subCategory.name}
                  </span>
                )}
              </div>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">Kỹ năng cần có</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}



          {job.location && (
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">Tìm việc theo khu vực</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {job.location.split(' - ')[0] || job.location}
                </span>
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                  Việc làm {job.title.substring(0, 30)} tại {job.location.split(' - ')[0] || job.location}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thời gian</h2>
        <div className="space-y-3">
          {job.applicationDeadline && (
            <div className="flex items-start gap-3">
              <Icon name="event" size={20} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Hạn nộp hồ sơ</p>
                <p className="font-medium text-gray-900">{formatDate(job.applicationDeadline)}</p>
              </div>
            </div>
          )}
          {job.submissionDays && (
            <div className="flex items-start gap-3">
              <Icon name="upload_file" size={20} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Thời gian nộp sản phẩm</p>
                <p className="font-medium text-gray-900">{job.submissionDays} ngày</p>
              </div>
            </div>
          )}
          {job.reviewDays && (
            <div className="flex items-start gap-3">
              <Icon name="rate_review" size={20} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Thời gian nghiệm thu</p>
                <p className="font-medium text-gray-900">{job.reviewDays} ngày</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deadline Card - TH2: Work Submission/Review Deadlines */}
      {(job.status === "IN_PROGRESS" || job.status === "DISPUTED") && (job.workSubmissionDeadline || job.workReviewDeadline) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="timer" size={20} />
            Hạn chót quan trọng
          </h2>
          <div className="space-y-3">
            {job.workSubmissionDeadline && (
              <div className="flex items-start gap-3">
                <Icon name="upload_file" size={20} className="text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Hạn nộp sản phẩm</p>
                  <p className="font-medium text-gray-800">{formatSubmissionDeadline?.(job.workSubmissionDeadline) || formatDate(job.workSubmissionDeadline)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Quá hạn sẽ bị hủy và công việc mở lại
                  </p>
                </div>
              </div>
            )}
            {job.workReviewDeadline && (
              <div className="flex items-start gap-3">
                <Icon name="rate_review" size={20} className="text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Hạn duyệt sản phẩm</p>
                  <p className="font-medium text-gray-800">{formatReviewDeadline?.(job.workReviewDeadline) || formatDate(job.workReviewDeadline)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Quá hạn sẽ tự động duyệt và thanh toán
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Apply Button - For non-owners or Assigned Freelancer */}
      {!isOwner && (
        job.status === "OPEN" ? (
          myApplication && myApplication.status !== "REJECTED" ? (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon 
                  name={myApplication.status === "WITHDRAWN" ? "undo" : "check_circle"} 
                  size={20} 
                  className={myApplication.status === "WITHDRAWN" ? "text-gray-400" : "text-[#00b14f]"} 
                />
                <span className="font-medium text-gray-900">
                  {myApplication.status === "WITHDRAWN" ? "Đã rút khỏi công việc" : "Đã ứng tuyển"}
                </span>
              </div>
              <p className={`text-sm ${APPLICATION_STATUS_CONFIG[myApplication.status as keyof typeof APPLICATION_STATUS_CONFIG]?.color}`}>
                {APPLICATION_STATUS_CONFIG[myApplication.status as keyof typeof APPLICATION_STATUS_CONFIG]?.label}
              </p>
              {myApplication.status === "WITHDRAWN" && (
                <p className="text-xs text-red-500 mt-2">
                  Bạn không thể ứng tuyển lại sau khi đã rút khỏi công việc này.
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Ngày gửi: {formatDate(myApplication.createdAt)}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {myApplication && myApplication.status === "REJECTED" && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <p className="font-medium mb-1">Đơn trước đã bị từ chối</p>
                  <p className="text-xs">Bạn có thể gửi lại đơn ứng tuyển mới cho công việc này.</p>
                </div>
              )}
              <Button
                onClick={onApply}
                className="w-full bg-[#00b14f] hover:bg-[#009643] text-white py-3"
              >
                <Icon name="send" size={20} />
                {myApplication && myApplication.status === "REJECTED" ? "Ứng tuyển lại" : "Ứng tuyển ngay"}
              </Button>
            </div>
          )
        ) : (
          // Assigned Freelancer Quit Button
          myApplication && myApplication.status === "ACCEPTED" && (job.status === "IN_PROGRESS" || job.status === "PENDING_SIGNATURE" || job.status === "SIGNING_TIMEOUT" || job.status === "WORK_TIMEOUT") && (
            <div className="bg-white rounded-lg shadow p-4 space-y-3">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Icon name="engineering" size={20} />
                <span className="font-medium">Bạn đang thực hiện việc này</span>
              </div>
              <p className="text-xs text-gray-500">
                Nếu bạn không thể tiếp tục, bạn có thể xin rút lui. Tuy nhiên hành động này sẽ ảnh hưởng đến điểm uy tín của bạn.
              </p>
              <Button
                variant="outline"
                onClick={onQuit}
                className="w-full text-red-600 border-red-200 hover:bg-red-50"
              >
                <Icon name="exit_to_app" size={20} />
                Xin rút khỏi công việc
              </Button>
            </div>
          )
        )
      )}

      {/* Owner Actions */}
      {isOwner && (
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          {/* View Applications Button */}
          <Link href={`/jobs/${job.id}/applications`}>
            <Button variant="outline" className="w-full">
              <Icon name="group" size={20} />
              Xem ứng viên ({job.applicationCount})
            </Button>
          </Link>

          {/* Toggle Status */}
          {(job.status === "DRAFT" || job.status === "OPEN") && (
            <>
              <p className="text-sm text-gray-600">
                {job.status === "DRAFT"
                  ? "Công việc đang ẩn. Chuyển sang công khai để nhận ứng viên."
                  : job.applicationCount > 0
                    ? "Không thể chuyển về nháp khi đã có người ứng tuyển."
                    : "Công việc đang công khai. Chuyển sang nháp để tạm ẩn."}
              </p>
              <Button
                onClick={onToggleStatus}
                disabled={isToggling}
                className={`w-full ${job.status === "DRAFT"
                  ? "bg-[#00b14f] hover:bg-[#009643]"
                  : "bg-gray-600 hover:bg-gray-700"
                  } text-white`}
              >
                {isToggling ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon name={job.status === "DRAFT" ? "visibility" : "visibility_off"} size={20} />
                )}
                {job.status === "DRAFT" ? "Đăng công khai" : "Chuyển về nháp"}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Meta Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khác</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Mã công việc</span>
            <span className="font-medium text-gray-900">#{job.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Ngày đăng</span>
            <span className="font-medium text-gray-900">{formatFullDateTime?.(job.createdAt) || formatDate(job.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Cập nhật</span>
            <span className="font-medium text-gray-900">{formatFullDateTime?.(job.updatedAt) || formatDate(job.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
