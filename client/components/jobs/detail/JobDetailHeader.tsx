"use client";

import Link from "next/link";
import { Job, JOB_STATUS_CONFIG, JOB_COMPLEXITY_CONFIG, WORK_TYPE_CONFIG } from "@/types/job";
import Icon from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";

interface JobDetailHeaderProps {
  job: Job;
  isOwner: boolean;
  formatCurrency: (amount: number, currency: string) => string;
  formatRelativeTime: (dateString: string) => string;
  formatFullDateTime?: (dateString: string) => string;
  onApply?: () => void;
  hasApplied?: boolean;
  applicationStatus?: string;
  isSaved?: boolean;
  onSave?: () => void;
}

export default function JobDetailHeader({ job, isOwner, hasApplied, applicationStatus, formatCurrency, formatRelativeTime, formatFullDateTime, onApply, isSaved, onSave }: JobDetailHeaderProps) {

  const calculateRemainingDays = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Đã hết hạn";
    return `Còn ${days} ngày`;
  };

  const remainingText = calculateRemainingDays(job.applicationDeadline);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{job.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Mức lương (Budget) */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#00b14f] flex justify-center items-center text-white shrink-0 shadow-sm">
            <Icon name="monetization_on" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-0.5">Mức lương</p>
            <p className="font-semibold text-gray-900">
              {job.budget ? formatCurrency(job.budget, job.currency) : "Thỏa thuận"}
            </p>
          </div>
        </div>

        {/* Địa điểm (Location) */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#00b14f] flex justify-center items-center text-white shrink-0 shadow-sm">
            <Icon name="location_on" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-0.5">Địa điểm</p>
            <p className="font-semibold text-gray-900">
              {job.location || "Từ xa (Remote)"}
            </p>
          </div>
        </div>

        {/* Hình thức làm việc */}
        {job.workType && (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#00b14f] flex justify-center items-center text-white shrink-0 shadow-sm">
              <Icon name="work" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-0.5">Hình thức làm việc</p>
              <p className="font-semibold text-gray-900">
                {WORK_TYPE_CONFIG[job.workType]?.label || job.workType}
              </p>
            </div>
          </div>
        )}
      </div>



      {job.applicationDeadline && (
        <div className="mb-6 text-sm text-gray-500 flex items-center gap-1">
          Hạn nộp hồ sơ:
          <span className="font-medium text-gray-900">
            {formatFullDateTime?.(job.applicationDeadline) || job.applicationDeadline}
            {remainingText && ` (${remainingText})`}
          </span>
        </div>
      )}

      {/* Buttons - If owner show edit, else show apply/save */}
      <div className="flex items-center gap-4">
        {!isOwner ? (
          <>
            <Button
              onClick={onApply}
              disabled={hasApplied || job.status !== "OPEN"}
              className={`flex-1 ${hasApplied ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-[#00b14f] hover:bg-[#009643] text-white'} py-4 text-base font-semibold`}
            >
              <Icon
                name={
                  applicationStatus === "ACCEPTED" ? "check_circle" :
                    applicationStatus === "WITHDRAWN" ? "undo" :
                      applicationStatus === "REJECTED" ? "refresh" :
                        hasApplied ? "assignment_turned_in" : "send"
                }
                size={20}
                className="mr-2"
              />
              {
                applicationStatus === "ACCEPTED" ? "Đã được nhận việc" :
                  applicationStatus === "WITHDRAWN" ? "Đã rút khỏi công việc" :
                    applicationStatus === "REJECTED" ? "Ứng tuyển lại" :
                      hasApplied ? "Đã ứng tuyển" : "Ứng tuyển ngay"
              }
            </Button>
            <Button
              variant="outline"
              onClick={onSave}
              className={`border py-4 px-8 font-medium ${isSaved
                  ? "bg-red-50 border-red-500 text-red-500 hover:bg-red-100"
                  : "border-[#00b14f] text-[#00b14f] hover:bg-green-50"
                }`}
            >
              <Icon name={isSaved ? "favorite" : "favorite_border"} size={20} className="mr-2" />
              {isSaved ? "Đã lưu" : "Lưu tin"}
            </Button>
          </>
        ) : (
          job.status === "DRAFT" && (
            <Link href={`/jobs/${job.id}/edit`}>
              <Button variant="outline" className="border-[#00b14f] text-[#00b14f] hover:bg-green-50">
                <Icon name="edit" size={20} className="mr-2" />
                Sửa công việc
              </Button>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
