"use client";

import { Job } from "@/types/job";
import JobCardWithPreview from "../cards/JobCardWithPreview";

interface JobDetailContentProps {
  job: Job;
  relatedJobs?: Job[];
}

export default function JobDetailContent({ job, relatedJobs = [] }: JobDetailContentProps) {
  let sectionNumber = 0;
  
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Document Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 uppercase">Thông tin chi tiết công việc</h2>
      </div>
      
      {/* Document Body */}
      <div className="px-6 py-5 space-y-6">
        {/* Section 1: Description */}
        <section>
          <h3 className="text-sm font-bold text-gray-800 mb-2">
            {++sectionNumber}. Mô tả công việc
          </h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pl-4">
            {job.description}
          </p>
        </section>

        {/* Section 2: Context */}
        {job.context && (
          <section>
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              {++sectionNumber}. Bối cảnh dự án
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pl-4">
              {job.context}
            </p>
          </section>
        )}

        {/* Section 3: Requirements */}
        {job.requirements && (
          <section>
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              {++sectionNumber}. Yêu cầu
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pl-4">
              {job.requirements}
            </p>
          </section>
        )}

        {/* Section 4: Deliverables */}
        {job.deliverables && (
          <section>
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              {++sectionNumber}. Sản phẩm bàn giao
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pl-4">
              {job.deliverables}
            </p>
          </section>
        )}

      </div>

      {/* Related Jobs Section inside the Content block */}
      {relatedJobs && relatedJobs.length > 0 && (
        <>
          <div className="px-6 py-4 border-t border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 uppercase">Việc làm tương tự</h2>
          </div>
          <div className="px-6 pb-6 pt-2 space-y-4">
            {relatedJobs.map(relatedJob => (
              <JobCardWithPreview key={relatedJob.id} job={relatedJob} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
