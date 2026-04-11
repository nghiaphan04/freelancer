"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Notification, NOTIFICATION_TYPE_CONFIG } from "@/lib/api";
import { formatRelativeTime, formatDateTime } from "@/lib/format";
import Icon from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useCallback } from "react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      setIsInitialLoading(true);
      const response = await api.getNotifications();
      if (response.status === "SUCCESS") {
        setNotifications(response.data);
        if (response.data.length > 0) {
          const firstNotif = response.data[0];
          setSelectedNotification(firstNotif);
          if (!firstNotif.isRead) {
            handleMarkAsRead(firstNotif.id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Không thể tải thông báo");
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await api.markAllNotificationsAsRead();
      if (response.status === "SUCCESS") {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("Đã đánh dấu tất cả là đã đọc");
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Thao tác thất bại");
    }
  };

  const handleNotificationClick = (n: Notification) => {
    if (selectedNotification?.id === n.id) return;
    
    setIsDetailLoading(true);
    setSelectedNotification(n);
    if (!n.isRead) {
      handleMarkAsRead(n.id);
    }
    setTimeout(() => setIsDetailLoading(false), 300);
  };

  const handleNavigate = (n: Notification) => {
    if (n.referenceType === "JOB" && n.referenceId) {
      router.push(`/jobs/${n.referenceId}`);
    } else if (n.referenceType === "CONVERSATION" && n.referenceId) {
      router.push(`/messages?id=${n.referenceId}`);
    }
  };

  return (
    <div className="bg-gray-50/50 min-h-screen overflow-hidden">
      <div className="container max-w-7xl mx-auto py-6 px-4 h-[calc(100vh-64px)] lg:h-[calc(100vh-70px)]">
        <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
          
          {/* Master View (Left Column) */}
          <div className="w-full lg:w-[380px] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 shrink-0">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.back()}
                  className="h-8 w-8 rounded-full hover:bg-gray-100"
                >
                  <Icon name="arrow_back" size={20} className="text-gray-600" />
                </Button>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  Thông báo
                  {notifications.some(n => !n.isRead) && (
                    <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                      {notifications.filter(n => !n.isRead).length}
                    </Badge>
                  )}
                </h1>
              </div>
              {notifications.some(n => !n.isRead) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleMarkAllAsRead}
                  className="text-primary text-[11px] h-8 px-2 hover:bg-primary/5 font-semibold"
                >
                  Đọc hết
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1">
              {isInitialLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <Icon name="notifications_off" size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Không có thông báo</h3>
                  <p className="text-xs text-gray-500 mt-1">Bạn sẽ nhận được thông báo khi có hoạt động mới.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((n) => {
                    const config = NOTIFICATION_TYPE_CONFIG[n.type] || { icon: "notifications", color: "text-blue-600" };
                    const isSelected = selectedNotification?.id === n.id;
                    return (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`group p-4 cursor-pointer transition-all duration-200 relative ${
                          isSelected 
                            ? "bg-primary/5 ring-1 ring-inset ring-primary/10" 
                            : !n.isRead 
                              ? "bg-blue-50/30 hover:bg-blue-50/50" 
                              : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}
                        <div className="flex gap-3">
                          <div className={`mt-0.5 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.color.replace("text-", "bg-").replace("600", "100")} ${config.color}`}>
                            <Icon name={config.icon} size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h4 className={`text-[13px] leading-tight line-clamp-1 ${!n.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                                {n.title}
                              </h4>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap pt-0.5">
                                {formatRelativeTime(n.createdAt)}
                              </span>
                            </div>
                            <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Detail View (Right Column) */}
          <div className="hidden lg:flex flex-1 flex-col bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full">
            {isInitialLoading || isDetailLoading ? (
              <div className="h-full flex flex-col">
                <div className="p-6 space-y-4 border-b border-gray-50">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
                <div className="p-8 space-y-6">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-32 w-full rounded-2xl" />
                </div>
              </div>
            ) : selectedNotification ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="bg-white px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-gray-500 border-gray-200">
                      {selectedNotification.typeLabel}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                      <Icon name="schedule" size={14} />
                      {formatDateTime(selectedNotification.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">
                    {selectedNotification.title}
                  </h2>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-8 max-w-3xl mx-auto">
                    {/* Message content parsing */}
                    {selectedNotification.message?.includes("Lý do:") ? (
                      <div className="space-y-6">
                        <div className="text-[14px] text-gray-700 leading-relaxed font-semibold text-justify">
                          {selectedNotification.message.split("Lý do:")[0].trim()}
                        </div>
                        
                        <div className="bg-gray-100/50 rounded-2xl p-7 border border-gray-100 relative group overflow-hidden shadow-sm">
                          <div className="text-[14px] text-gray-700 leading-relaxed italic whitespace-pre-wrap text-justify">
                            {selectedNotification.message.split("Lý do:")[1].trim()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap text-[14px] text-justify">
                        {selectedNotification.message}
                      </div>
                    )}

                    {(selectedNotification.referenceId && (selectedNotification.referenceType === "JOB" || selectedNotification.referenceType === "CONVERSATION")) && (
                      <div className="mt-12 pt-6 border-t border-gray-100 flex justify-end">
                        <Button 
                          size="sm"
                          onClick={() => handleNavigate(selectedNotification)}
                          className="rounded-full px-5 h-9 text-[11px] font-bold shadow-md shadow-primary/10 hover:shadow-lg transition-all"
                        >
                          {selectedNotification.referenceType === "JOB" ? "Xem chi tiết công việc" : "Mở cuộc trò chuyện"}
                          <Icon name="arrow_forward" size={14} className="ml-1.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Icon name="drafts" size={32} className="text-gray-300" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Chi tiết thông báo</h2>
                <p className="text-gray-500 mt-2 max-w-xs text-sm">Chọn một thông báo từ danh sách bên trái để xem nội dung chi tiết nhất.</p>
              </div>
            )}
          </div>

          {/* Simple Detail for Mobile */}
          <div className="lg:hidden">
            {/* On mobile we already have the list, but we could use a Drawer or separate Route for Detail. 
                For now we keep it as a vertical stack where Detail appears below List if needed, 
                or we can just keep the list as is since mobile users usually prefer list view. */}
          </div>

        </div>
      </div>
    </div>
  );
}
