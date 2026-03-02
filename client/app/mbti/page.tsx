"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Icon from "@/components/ui/Icon";
import { mbtiQuestions, mbtiTypes } from "@/constant/mbti";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Step = "intro" | "questions" | "calculating" | "result";

export default function MBTIPage() {
  const [step, setStep] = useState<Step>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [resultType, setResultType] = useState<string | null>(null);

  // Scoring Logic
  const calculateResult = () => {
    setStep("calculating");
    
    setTimeout(() => {
      const scores = {
        EI: 0,
        SN: 0,
        TF: 0,
        JP: 0
      };

      mbtiQuestions.forEach((q) => {
        const answer = answers[q.id] || 0; // -2 to 2
        scores[q.dimension] += answer * q.multiplier;
      });

      const type = [
        scores.EI >= 0 ? "E" : "I",
        scores.SN >= 0 ? "S" : "N",
        scores.TF >= 0 ? "T" : "F",
        scores.JP >= 0 ? "J" : "P"
      ].join("");

      setResultType(type);
      setStep("result");
      globalThis.scrollTo({ top: 0, behavior: "smooth" });
    }, 2000);
  };

  const handleAnswer = (value: number) => {
    const qId = mbtiQuestions[currentQuestionIndex].id;
    setAnswers({ ...answers, [qId]: value });

    if (currentQuestionIndex < mbtiQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResult();
    }
  };

  const currentQuestion = mbtiQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mbtiQuestions.length) * 100;
  const result = resultType ? mbtiTypes[resultType] : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* INTRO STEP */}
          {step === "intro" && (
            <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00b14f]/10 text-[#00b14f] rounded-full text-sm font-bold uppercase tracking-wider">
                <Icon name="psychology" size={20} />
                Công cụ định hướng nghề nghiệp
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                Khám phá <span className="text-[#00b14f]">Bản sắc</span> <br /> nghề nghiệp của bạn
              </h1>
              
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Bài trắc nghiệm MBTI giúp bạn hiểu rõ tính cách, thế mạnh và tìm kiếm công việc freelancer phù hợp nhất với bản thân chỉ trong 3 phút.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                {[
                  { icon: "bolt", title: "Nhanh chóng", desc: "Chỉ 20 câu hỏi lựa chọn đơn giản" },
                  { icon: "verified", title: "Chính xác", desc: "Dựa trên mô hình tâm lý học Jung" },
                  { icon: "auto_awesome", title: "Tư vấn", desc: "Đề xuất việc làm phù hợp thực tế" }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-xl bg-[#00b14f]/5 flex items-center justify-center text-[#00b14f] mb-4 group-hover:bg-[#00b14f] group-hover:text-white transition-colors">
                      <Icon name={item.icon} size={24} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => setStep("questions")}
                className="h-16 px-12 rounded-full bg-[#00b14f] hover:bg-[#008e3f] text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Bắt đầu kiểm tra ngay
                <Icon name="arrow_forward" size={20} className="ml-2" />
              </Button>
              
              <p className="text-gray-400 text-sm">Miễn phí hoàn toàn • Không cần đăng ký</p>
            </div>
          )}

          {/* QUESTIONS STEP */}
          {step === "questions" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-sm font-bold text-gray-500">
                  <span>Câu hỏi {currentQuestionIndex + 1} / {mbtiQuestions.length}</span>
                  <span className="text-[#00b14f]">{Math.round(progress)}% Hoàn thành</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[#00b14f] to-[#00d15f] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,177,79,0.3)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <Card className="p-8 md:p-12 shadow-xl border-none rounded-3xl bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00b14f]/5 rounded-full -mr-16 -mt-16" />
                
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12 relative z-10">
                  {currentQuestion.text}
                </h2>

                <div className="flex flex-col gap-4 max-w-xl mx-auto relative z-10">
                  {[
                    { label: "Rất đồng ý", value: 2, bg: "bg-emerald-500", hover: "hover:bg-emerald-600" },
                    { label: "Đồng ý", value: 1, bg: "bg-emerald-400", hover: "hover:bg-emerald-500" },
                    { label: "Trung bình / Không rõ", value: 0, bg: "bg-gray-400", hover: "hover:bg-gray-500" },
                    { label: "Không đồng ý", value: -1, bg: "bg-rose-400", hover: "hover:bg-rose-500" },
                    { label: "Rất không đồng ý", value: -2, bg: "bg-rose-500", hover: "hover:bg-rose-600" },
                  ].map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => handleAnswer(btn.value)}
                      className={cn(
                        "w-full h-14 md:h-16 rounded-2xl text-white font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center",
                        btn.bg,
                        btn.hover
                      )}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="mt-12 flex justify-center">
                  <button 
                    onClick={() => currentQuestionIndex > 0 && setCurrentQuestionIndex(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-0 transition-all flex items-center gap-1 font-medium"
                  >
                    <Icon name="arrow_back" size={18} />
                    Câu hỏi trước
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* CALCULATING STEP */}
          {step === "calculating" && (
            <div className="text-center py-20 space-y-8 animate-in fade-in duration-500">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 border-8 border-gray-100 rounded-full" />
                <div className="absolute inset-0 border-8 border-[#00b14f] border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="psychology" size={48} className="text-[#00b14f] animate-pulse" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Đang phân tích dữ liệu...</h2>
                <p className="text-gray-500 max-w-sm mx-auto">Chúng tôi đang đối chiếu câu trả lời của bạn với 16 nhóm tính cách Jungian.</p>
              </div>
            </div>
          )}

          {/* RESULT STEP */}
          {step === "result" && result && (
            <div className="space-y-10 animate-in fade-in zoom-in duration-700">
              {/* Profile Card */}
              <div className={cn(
                "rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden bg-gradient-to-br",
                result.backgroundColor
              )}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="w-40 h-40 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-6xl font-black shadow-inner border border-white/30">
                    {result.type}
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h4 className="text-white/80 font-bold uppercase tracking-widest text-sm mb-2">Tính cách của bạn là</h4>
                    <h2 className="text-4xl md:text-5xl font-black mb-3">{result.name}</h2>
                    <p className="text-xl text-white/90 font-medium italic">{result.title}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Description */}
                <div className="md:col-span-2 space-y-8">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Icon name="description" className="text-[#00b14f]" />
                      Phân tích chi tiết
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-lg mb-8">
                      {result.description}
                    </p>
                    
                    <h4 className="font-bold text-gray-900 mb-4">Điểm mạnh nổi bật:</h4>
                    <div className="flex flex-wrap gap-3">
                      {result.strengths.map((s, i) => (
                        <span key={i} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-sm font-bold border border-gray-100 flex items-center gap-2">
                          <Icon name="check_circle" size={16} className="text-[#00b14f]" />
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#00b14f]/5 p-8 rounded-3xl border border-[#00b14f]/20">
                    <h3 className="text-2xl font-bold text-[#00b14f] mb-4 flex items-center gap-2">
                      <Icon name="tips_and_updates" />
                      Lời khuyên sự nghiệp
                    </h3>
                    <p className="text-[#008e3f] leading-relaxed text-lg font-medium">
                      {result.careerAdvice}
                    </p>
                  </div>
                </div>

                {/* Sidebar Roles */}
                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
                    <Icon name="work" size={40} className="text-[#00b14f] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Việc làm phù hợp</h3>
                    <div className="space-y-3">
                      {result.suitableRoles.map((role, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 border border-gray-100 hover:border-[#00b14f] hover:text-[#00b14f] transition-all cursor-default">
                          {role}
                        </div>
                      ))}
                    </div>
                    
                    <Link href="/jobs" className="mt-8 inline-block w-full py-4 bg-[#00b14f] text-white rounded-2xl font-bold hover:bg-[#008e3f] transition-all shadow-lg">
                      Tìm việc ngay
                    </Link>
                  </div>

                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-center">Chia sẻ kết quả</h4>
                    <div className="flex justify-center gap-4">
                      {["facebook", "share", "content_copy"].map((icon) => (
                        <button key={icon} className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#00b14f] hover:border-[#00b14f] transition-colors">
                          <Icon name={icon} size={20} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setStep("intro")}
                    className="w-full py-4 text-gray-400 hover:text-gray-600 font-bold transition-colors"
                  >
                    Làm lại bài trắc nghiệm
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
