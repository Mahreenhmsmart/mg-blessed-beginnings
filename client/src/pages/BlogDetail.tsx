import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPost, clearCurrentPost, fetchPosts } from '@/store/slices/blogSlice';
import { fetchAITools } from '@/store/slices/aiToolsSlice';
import { Spinner } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import AdSenseSlot from '@/components/AdSenseSlot';
import AIToolCard from '@/components/AIToolCard';
import BlogCard from '@/components/BlogCard';
import { Calendar, User, ArrowLeft, Tag, Sparkles, Clock, List, Share2 } from 'lucide-react';
import type { BlogPost } from '@/types';
import { SchemaInjector, SITE_NAME } from '@/seo';
// Security fix: Sanitize HTML content to prevent XSS attacks
import { sanitizeRichText } from '@/utils/sanitize';

// Map blog categories/tags to relevant tool slugs
const categoryToToolSlugs: Record<string, string[]> = {
  'eBay': ['seo-title-optimizer', 'product-description-generator'],
  'Etsy': ['hashtag-generator', 'seo-title-optimizer'],
  'Shopify': ['product-description-generator', 'listing-optimizer'],
  'SEO': ['seo-title-optimizer', 'competitor-analyzer'],
  'AI Tools': ['product-description-generator', 'seo-title-optimizer', 'hashtag-generator'],
  'Marketing': ['hashtag-generator', 'product-description-generator'],
};

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentPost, status } = useAppSelector((state) => state.blog);
  const { items: aiTools } = useAppSelector((state) => state.aiTools);

  useEffect(() => {
    if (id) {
      dispatch(fetchPost(id));
    }
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, id]);

  // Fetch AI tools when blog post loads to show related tools
  useEffect(() => {
    if (currentPost && aiTools.length === 0) {
      dispatch(fetchAITools());
    }
  }, [dispatch, currentPost, aiTools.length]);

  // Calculate reading time
  const readingTime = useMemo(() => {
    if (!currentPost?.content) return 1;
    const textContent = currentPost.content.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [currentPost?.content]);

  // Extract headings for table of contents
  const tocItems = useMemo(() => {
    if (!currentPost?.content) return [];
    const headingRegex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
    const items: { level: number; text: string; id: string }[] = [];
    let match;
    while ((match = headingRegex.exec(currentPost.content)) !== null) {
      const text = match[2].replace(/<[^>]*>/g, '').trim();
      if (text) {
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        items.push({ level: parseInt(match[1]), text, id });
      }
    }
    return items;
  }, [currentPost?.content]);

  // Get related blog posts (same category, excluding current)
  const { posts: allPosts } = useAppSelector((state) => state.blog);
  useEffect(() => {
    if (allPosts.length === 0) dispatch(fetchPosts());
  }, [dispatch, allPosts.length]);

  const relatedPosts = useMemo(() => {
    if (!currentPost || allPosts.length === 0) return [];
    return allPosts
      .filter((p: BlogPost) => p._id !== currentPost._id && p.category === currentPost.category && p.status === 'published')
      .slice(0, 3);
  }, [currentPost, allPosts]);

  if (status === 'loading') {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        data-icod-id="src_pages_blogdetail_tsx_e7da">
        <Spinner size="lg" data-icod-id="src_pages_blogdetail_tsx_168c" />
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
        data-icod-id="src_pages_blogdetail_tsx_f6ce">
        <h2
          className="text-2xl font-bold text-foreground mb-4"
          data-icod-id="src_pages_blogdetail_tsx_86bd">Article Not Found</h2>
        <p
          className="text-muted-foreground mb-6"
          data-icod-id="src_pages_blogdetail_tsx_a617">The article you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/blog"
          className="inline-flex items-center text-primary hover:underline"
          data-icod-id="src_pages_blogdetail_tsx_26bb">
          <ArrowLeft className="h-4 w-4 mr-2" data-icod-id="src_pages_blogdetail_tsx_a9d2" />
          Back to Blog
        </Link>
      </div>
    );
  }

  const dateValue = currentPost.publishedAt ?? currentPost.createdAt;
  const formattedDate = dateValue
    ? new Date(dateValue).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  // Split content to insert ad after 2nd paragraph
  // Security fix: Sanitize HTML content before splitting to prevent XSS
  const sanitizedContent = sanitizeRichText(currentPost.content);
  const contentParts = sanitizedContent.split('</p>');
  const firstPart = contentParts.slice(0, 2).join('</p>') + '</p>';
  const secondPart = contentParts.slice(2).join('</p>');

  // Find related tools based on blog category
  const relatedToolSlugs = categoryToToolSlugs[currentPost.category || ''] || [];
  const relatedTools = (aiTools || []).filter((tool) => relatedToolSlugs.includes(tool.slug)).slice(0, 3);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: currentPost.title,
    description: currentPost.excerpt ?? '',
    author: {
      '@type': 'Person',
      name: currentPost.author ?? 'Mahreen Yousaf',
      jobTitle: 'E-Commerce Consultant',
      url: 'https://mgblessed.icod.ai/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MG Blessed Beginnings',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mgblessed.icod.ai/assets/mg-logo.svg',
      },
    },
    datePublished: currentPost.publishedAt ?? currentPost.createdAt ?? '',
    dateModified: currentPost.updatedAt ?? currentPost.publishedAt ?? '',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://mgblessed.icod.ai/blog/${currentPost.slug || id}`,
    },
    articleSection: currentPost.category ?? '',
    keywords: (currentPost.tags ?? []).join(', '),
    wordCount: currentPost.content?.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length ?? 0,
  };

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: currentPost.title, url: `/blog/${currentPost.slug || id}` },
  ];

  return (
    <>
      <SEOHead
        title={`${currentPost.title} — ${SITE_NAME}`}
        description={currentPost.excerpt ?? ''}
        keywords={(currentPost.tags ?? []).join(', ') || (currentPost.category ?? '')}
        canonicalUrl={`/blog/${currentPost.slug || id}`}
        ogType="article"
        ogImage={currentPost.featuredImage}
        structuredData={structuredData}
        breadcrumbs={breadcrumbs}
        data-icod-id="src_pages_blogdetail_tsx_b2cb" />
      <SchemaInjector
        schemaType="blogPost"
        post={{
          title: currentPost.title,
          excerpt: currentPost.excerpt,
          featuredImage: currentPost.featuredImage,
          publishedAt: currentPost.publishedAt ?? currentPost.createdAt,
          updatedAt: currentPost.updatedAt,
          author: currentPost.author,
          category: currentPost.category,
          tags: currentPost.tags,
          slug: currentPost.slug || id,
        }}
        breadcrumbs={breadcrumbs}
        data-icod-id="src_pages_blogdetail_tsx_32f2" />
      <article
        className="py-12 bg-background"
        data-icod-id="src_pages_blogdetail_tsx_a1f6">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_blogdetail_tsx_0366">
          <div
            className="max-w-4xl mx-auto"
            data-icod-id="src_pages_blogdetail_tsx_04b1">
            {/* Breadcrumb */}
            <nav className="mb-8" data-icod-id="src_pages_blogdetail_tsx_876c">
              <Link
                to="/blog"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                data-icod-id="src_pages_blogdetail_tsx_9676">
                <ArrowLeft className="h-4 w-4 mr-2" data-icod-id="src_pages_blogdetail_tsx_d7e0" />
                Back to Blog
              </Link>
            </nav>

            {/* Header */}
            <header className="mb-8" data-icod-id="src_pages_blogdetail_tsx_878e">
              {currentPost.category && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-accent text-accent-foreground mb-4"
                  data-icod-id="src_pages_blogdetail_tsx_c9be">
                  <Tag className="h-3 w-3" data-icod-id="src_pages_blogdetail_tsx_c9b1" />
                  {currentPost.category}
                </span>
              )}

              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight"
                data-icod-id="src_pages_blogdetail_tsx_6549">
                {currentPost.title}
              </h1>

              <div
                className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pb-6 border-b border-border"
                data-icod-id="src_pages_blogdetail_tsx_9fa3">
                {currentPost.author && (
                  <span
                    className="flex items-center gap-2"
                    data-icod-id="src_pages_blogdetail_tsx_13f2">
                    <User className="h-4 w-4" data-icod-id="src_pages_blogdetail_tsx_c321" />
                    {currentPost.author}
                  </span>
                )}
                {formattedDate && (
                  <span
                    className="flex items-center gap-2"
                    data-icod-id="src_pages_blogdetail_tsx_8d61">
                    <Calendar className="h-4 w-4" data-icod-id="src_pages_blogdetail_tsx_e58e" />
                    {formattedDate}
                  </span>
                )}
                <span
                  className="flex items-center gap-2"
                  data-icod-id="src_pages_blogdetail_tsx_67a9">
                  <Clock className="h-4 w-4" data-icod-id="src_pages_blogdetail_tsx_addd" />
                  {readingTime} min read
                </span>
              </div>
            </header>

            {/* Featured Image Placeholder */}
            <div
              className="aspect-video bg-muted rounded-lg mb-8 flex items-center justify-center"
              data-icod-id="src_pages_blogdetail_tsx_fc13">
              {currentPost.featuredImage ? (
                <img
                  src={currentPost.featuredImage}
                  alt={currentPost.title}
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                  width="1200"
                  height="675"
                  data-icod-id="src_pages_blogdetail_tsx_ce6d" />
              ) : (
                <span
                  className="text-6xl text-muted-foreground"
                  data-icod-id="src_pages_blogdetail_tsx_971e">📝</span>
              )}
            </div>

            {/* Table of Contents */}
            {tocItems.length > 2 && (
              <nav
                className="mb-8 p-6 rounded-xl border border-border bg-card not-prose"
                aria-label="Table of contents"
                data-icod-id="src_pages_blogdetail_tsx_87f8">
                <div
                  className="flex items-center gap-2 mb-4"
                  data-icod-id="src_pages_blogdetail_tsx_414d">
                  <List
                    className="h-5 w-5 text-primary"
                    data-icod-id="src_pages_blogdetail_tsx_635e" />
                  <h2
                    className="text-lg font-semibold text-foreground"
                    data-icod-id="src_pages_blogdetail_tsx_6619">Table of Contents</h2>
                </div>
                <ul className="space-y-2" data-icod-id="src_pages_blogdetail_tsx_96ec">
                  {tocItems.map((item, idx) => (
                    <li
                      key={idx}
                      style={{ paddingLeft: item.level === 3 ? '1.5rem' : 0 }}
                      data-icod-id={`src_pages_blogdetail_tsx_7615_${idx}`}>
                      <a
                        href={`#${item.id}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors block py-1"
                        onClick={(e) => {
                          e.preventDefault();
                          const el = document.getElementById(item.id);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        data-icod-id={`src_pages_blogdetail_tsx_acf9_${idx}`}>
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Social Sharing */}
            <div
              className="flex items-center gap-3 mb-8 not-prose"
              data-icod-id="src_pages_blogdetail_tsx_f268">
              <span
                className="text-sm font-medium text-muted-foreground"
                data-icod-id="src_pages_blogdetail_tsx_5cca">Share:</span>
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: currentPost.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                aria-label="Share this article"
                data-icod-id="src_pages_blogdetail_tsx_fc3b">
                <Share2 className="h-4 w-4" data-icod-id="src_pages_blogdetail_tsx_e24e" />
                Share
              </button>
            </div>

            {/* Content with Ad Insertion */}
            <div
              className="prose prose-lg max-w-none text-foreground"
              data-icod-id="src_pages_blogdetail_tsx_f1ba">
              <div
                dangerouslySetInnerHTML={{ __html: firstPart }}
                data-icod-id="src_pages_blogdetail_tsx_eac6" />

              {/* In-content AdSense */}
              <div className="my-8 not-prose" data-icod-id="src_pages_blogdetail_tsx_156f">
                <AdSenseSlot
                  format="horizontal"
                  slotId="blog-detail-incontent"
                  data-icod-id="src_pages_blogdetail_tsx_e63d" />
              </div>

              <div
                dangerouslySetInnerHTML={{ __html: secondPart }}
                data-icod-id="src_pages_blogdetail_tsx_256a" />
            </div>

            {/* Try Our Free Tools Section */}
            {relatedTools.length > 0 && (
              <div className="mt-12 p-8 rounded-xl" style={{ background: 'var(--section-lavender)' }} data-icod-id="src_pages_blogdetail_tsx_tools_section">
                <div className="flex items-center gap-3 mb-6" data-icod-id="src_pages_blogdetail_tsx_tools_header">
                  <Sparkles className="h-6 w-6 text-primary" data-icod-id="src_pages_blogdetail_tsx_tools_icon" />
                  <h2 className="text-2xl font-bold text-foreground font-heading" data-icod-id="src_pages_blogdetail_tsx_tools_title">
                    Try Our Free Tools
                  </h2>
                </div>
                <p className="text-muted-foreground mb-6" data-icod-id="src_pages_blogdetail_tsx_tools_desc">
                  Put these tips into action with our free AI-powered tools designed for e-commerce sellers.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose" data-icod-id="src_pages_blogdetail_tsx_tools_grid">
                  {relatedTools.map((tool) => (
                    <AIToolCard key={tool._id} tool={tool} data-icod-id={`src_pages_blogdetail_tsx_tool_${tool._id}`} />
                  ))}
                </div>
              </div>
            )}

            {/* Author Bio */}
            <div
              className="mt-12 p-6 rounded-lg bg-muted/50"
              data-icod-id="src_pages_blogdetail_tsx_b0f6">
              <div
                className="flex items-start gap-4"
                data-icod-id="src_pages_blogdetail_tsx_7c23">
                <div
                  className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                  data-icod-id="src_pages_blogdetail_tsx_6f76">
                  <User
                    className="h-8 w-8 text-primary"
                    data-icod-id="src_pages_blogdetail_tsx_8e56" />
                </div>
                <div data-icod-id="src_pages_blogdetail_tsx_1427">
                  <h3
                    className="font-semibold text-foreground mb-2"
                    data-icod-id="src_pages_blogdetail_tsx_d5dc">About {currentPost.author}</h3>
                  <p
                    className="text-sm text-muted-foreground"
                    data-icod-id="src_pages_blogdetail_tsx_9818">
                    Mahreen Yousaf is an e-commerce consultant specializing in helping sellers succeed on Shopify, eBay, and Etsy. With years of experience in digital marketing and online retail, she provides expert guidance to entrepreneurs worldwide.
                  </p>
                </div>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-16 not-prose" data-icod-id="src_pages_blogdetail_tsx_9d6b">
                <h2
                  className="text-2xl font-bold text-foreground font-heading mb-6"
                  data-icod-id="src_pages_blogdetail_tsx_d07d">
                  Related Articles
                </h2>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  data-icod-id="src_pages_blogdetail_tsx_b152">
                  {relatedPosts.map((post: BlogPost, __icodIdx0) => (<BlogCard
                    key={post._id || post.id}
                    post={post}
                    data-icod-id={`src_pages_blogdetail_tsx_020c_${__icodIdx0}`} />))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar AdSense */}
          <div
            className="hidden xl:block fixed right-8 top-1/2 -translate-y-1/2 w-48 z-30"
            data-icod-id="src_pages_blogdetail_tsx_262a">
            <AdSenseSlot
              format="vertical"
              slotId="blog-detail-sidebar"
              data-icod-id="src_pages_blogdetail_tsx_9631" />
          </div>
        </div>
      </article>
      {/* Ad Banner after Post Content */}
      <div
        className="container mx-auto px-4 py-8"
        data-icod-id="src_pages_blogdetail_tsx_dc64">
        <AdSenseSlot format="banner" data-icod-id="src_pages_blogdetail_tsx_d5cf" />
      </div>
    </>
  );
}
