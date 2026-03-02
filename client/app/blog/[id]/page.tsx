"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Icon from "@/components/ui/Icon";
import { blogArticles } from "@/constant/blog";
import { notFound } from "next/navigation";
import TextCard from "@/components/blog/cards/TextCard";

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const articleId = Number.parseInt(resolvedParams.id);
  const article = blogArticles.find((a) => a.id === articleId);

  if (!article) {
    notFound();
  }

  // Related articles (same category, excluding current)
  const relatedArticles = blogArticles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="bg-gray-50 border-b">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#00b14f]">Trang chủ</Link>
            <Icon name="chevron_right" size={16} />
            <Link href="/blog" className="hover:text-[#00b14f]">Blog</Link>
            <Icon name="chevron_right" size={16} />
            <span className="text-gray-900 font-medium truncate">{article.title}</span>
          </div>
        </div>

        <article className="max-w-4xl mx-auto px-4 mt-8">
          {/* Article Header */}
          <header className="mb-8">
            <span className="inline-block px-3 py-1 bg-[#00b14f]/10 text-[#00b14f] text-xs font-bold uppercase rounded-full mb-4">
              {article.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
              {article.title}
            </h1>
            
            <div className="flex items-center justify-between py-6 border-y border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00b14f] flex items-center justify-center text-white font-bold">
                  F
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Ban biên tập Freelancer</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#00b14f] transition-colors">
                  <Icon name="share" size={20} />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-[#00b14f] transition-colors">
                  <Icon name="bookmark_border" size={20} />
                </button>
              </div>
            </div>
          </header>

          {/* Main Image */}
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-10 shadow-lg">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Article Excerpt */}
          <p className="text-xl text-gray-600 font-medium leading-relaxed mb-10 border-l-4 border-[#00b14f] pl-6 italic">
            {article.excerpt}
          </p>

          {/* Content rendering */}
          <div 
            className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6"
            dangerouslySetInnerHTML={{ __html: article.content || "<p>Nội dung đang được cập nhật...</p>" }}
          />

          {/* Tags / Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-100">
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="text-sm font-semibold text-gray-500 mr-2">Tags:</span>
              {["freelancer", "nghề nghiệp", "việc làm", "bí kíp"].map((tag) => (
                <span key={tag} className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600 hover:bg-[#00b14f]/10 hover:text-[#00b14f] cursor-pointer transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
            
            <div className="bg-[#00b14f]/5 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6 border border-[#00b14f]/10">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-[#00b14f] mb-2">Bạn đang tìm kiếm cơ hội mới?</h3>
                <p className="text-gray-600 mb-6">Hàng ngàn việc làm freelancer hấp dẫn đang chờ đón bạn. Tạo hồ sơ ngay hôm nay!</p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <Link href="/jobs" className="px-6 py-3 bg-[#00b14f] text-white font-bold rounded-lg hover:bg-[#008e3f] transition-all shadow-md hover:shadow-lg">
                    Tìm việc ngay
                  </Link>
                  <Link href="/register" className="px-6 py-3 border border-[#00b14f] text-[#00b14f] font-bold rounded-lg hover:bg-white transition-all">
                    Đăng ký tài khoản
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </article>

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <section className="bg-gray-50 mt-16 py-16">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <div className="w-2 h-8 bg-[#00b14f] rounded-full" />
                Bài viết liên quan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((ra) => (
                  <TextCard key={ra.id} article={ra} showImage />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link 
                  href="/blog" 
                  className="inline-flex items-center gap-2 text-[#00b14f] font-bold hover:underline"
                >
                  Xem tất cả bài viết
                  <Icon name="arrow_forward" size={20} />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
