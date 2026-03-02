"use client";

import Link from "next/link";
import { Job, JOB_STATUS_CONFIG } from "@/types/job";
import Icon from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";

interface JobDetailHeaderProps {
  job: Job;
  isOwner: boolean;
  formatCurrency: (amount: number, currency: string) => string;
  formatRelativeTime: (dateString: string) => string;
  formatFullDateTime?: (dateString: string) => string;
}

export default function JobDetailHeader({ job, isOwner, formatCurrency, formatRelativeTime, formatFullDateTime }: JobDetailHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${JOB_STATUS_CONFIG[job.status]?.color}`}>
                {JOB_STATUS_CONFIG[job.status]?.label}
              </span>
              {job.category && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-600">
                  {job.category.name}
                </span>
              )}
              {job.subCategory && (
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-600">
                  {job.subCategory.name}
                </span>
              )}
              {job.location && job.location !== "Remote" && (
                <span className="flex items-center gap-1 text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded">
                  <Icon name="location_on" size={14} />
                  {job.location}
                </span>
              )}
              <span className="text-gray-400 text-xs">#{job.id}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h1>
            
            {/* Small stats inline */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Icon name="visibility" size={14} />
                {job.viewCount} lượt xem
              </span>
              <span className="flex items-center gap-1">
                <Icon name="group" size={14} />
                {job.applicationCount} ứng viên
              </span>
              <span className="flex items-center gap-1" title={formatFullDateTime?.(job.createdAt)}>
                <Icon name="schedule" size={14} />
                {formatFullDateTime?.(job.createdAt) || formatRelativeTime(job.createdAt)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {job.budget && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Ngân sách</p>
                <p className="text-xl font-bold text-[#00b14f]">
                  {formatCurrency(job.budget, job.currency)}
                </p>
              </div>
            )}
            {isOwner && job.status === "DRAFT" && (
              <Link href={`/jobs/${job.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Icon name="edit" size={16} />
                  Sửa
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
