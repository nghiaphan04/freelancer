/**
 * Advanced deadline formatting utilities
 */

export const formatAdvancedDeadline = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  
  if (diffMs < 0) return "Đã hết hạn";
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  // Format for days
  if (diffDays >= 365) {
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return months > 0 ? `${years} năm ${months} tháng` : `${years} năm`;
  } else if (diffDays >= 30) {
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return days > 0 ? `${months} tháng ${days} ngày` : `${months} tháng`;
  } else if (diffDays >= 1) {
    return `Còn ${diffDays} ngày`;
  }
  
  // Format for hours/minutes (less than 1 day)
  if (diffHours >= 1) {
    const hours = diffHours;
    const minutes = diffMinutes % 60;
    return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
  } else {
    return `${diffMinutes} phút`;
  }
};

export const formatRelativeTime = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime(); // Past time calculation
  
  if (diffMs < 0) return "Vừa xong";
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays >= 365) {
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return months > 0 ? `${years} năm ${months} tháng trước` : `${years} năm trước`;
  } else if (diffDays >= 30) {
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return days > 0 ? `${months} tháng ${days} ngày trước` : `${months} tháng trước`;
  } else if (diffDays >= 1) {
    return `${diffDays} ngày trước`;
  }
  
  if (diffHours >= 1) {
    const hours = diffHours;
    const minutes = diffMinutes % 60;
    return minutes > 0 ? `${hours} giờ ${minutes} phút trước` : `${hours} giờ trước`;
  } else {
    return `${diffMinutes} phút trước`;
  }
};

// Format date for submission deadline (future date)
export const formatSubmissionDeadline = (dateString?: string): string => {
  if (!dateString) return "";
  return formatAdvancedDeadline(dateString);
};

// Format date for review deadline (future date) 
export const formatReviewDeadline = (dateString?: string): string => {
  if (!dateString) return "";
  return formatAdvancedDeadline(dateString);
};

export const formatFullDateTime = (dateString?: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
