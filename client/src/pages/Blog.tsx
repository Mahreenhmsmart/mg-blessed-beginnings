import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPosts } from '@/store/slices/blogSlice';
import { Spinner, Button, Input, Pagination, Skeleton } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import BlogCard from '@/components/BlogCard';
import AdSenseSlot from '@/components/AdSenseSlot';
import { Search } from 'lucide-react';
import { SchemaInjector, PAGE_META } from '@/seo';

const blogMeta = PAGE_META['/blog'];

const POSTS_PER_PAGE = 9;

export default function Blog() {
  const dispatch = useAppDispatch();
  const { posts: rawPosts, status } = useAppSelector((state) => state.blog);
  // Defensive guard against null/undefined posts
  const posts = Array.isArray(rawPosts) ? rawPosts : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Derive categories from loaded posts
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const post of posts) {
      if (post.category) cats.add(post.category);
    }
    return Array.from(cats).sort();
  }, [posts]);

  // Client-side filtering
  const filteredPosts = useMemo(() => {
    let result = posts;
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
          (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }
    return result;
  }, [posts, selectedCategory, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

  // Clamp currentPage to valid range when data or filters change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  return (
    <>
      <SEOHead
        title={blogMeta.title}
        description={blogMeta.description}
        keywords={blogMeta.keywords}
        canonicalUrl={blogMeta.canonical}
        data-icod-id="src_pages_blog_tsx_4ab1" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Blog', url: '/blog' },
        ]}
        data-icod-id="src_pages_blog_tsx_a6d9" />
      {/* Hero */}
      <section
        className="py-24"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_blog_tsx_753a">
        <div
          className="container mx-auto px-4 text-center"
          data-icod-id="src_pages_blog_tsx_e1eb">
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight"
            data-icod-id="src_pages_blog_tsx_981a">Blog</h1>
          <p
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            data-icod-id="src_pages_blog_tsx_e991">
            Expert insights, tips, and strategies to help you succeed in e-commerce.
          </p>
        </div>
      </section>
      {/* Ad Banner after Hero */}
      <div
        className="container mx-auto px-4 py-6"
        data-icod-id="src_pages_blog_tsx_4ac0">
        <AdSenseSlot format="banner" data-icod-id="src_pages_blog_tsx_29d3" />
      </div>
      {/* Filters */}
      <section
        className="py-10 border-b border-border/40 sticky top-16 z-40"
        style={{ background: 'rgba(var(--background), 0.85)', backdropFilter: 'blur(12px)' }}
        data-icod-id="src_pages_blog_tsx_4da4">
        <div className="container mx-auto px-4" data-icod-id="src_pages_blog_tsx_cd65">
          <div
            className="flex flex-col md:flex-row gap-4 items-center justify-between"
            data-icod-id="src_pages_blog_tsx_c7af">
            {/* Categories */}
            <div className="flex flex-wrap gap-2" data-icod-id="src_pages_blog_tsx_9af6">
              <Button
                variant={selectedCategory === undefined ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(undefined)}
                data-icod-id="src_pages_blog_tsx_e36f">
                All Posts
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  data-icod-id={`src_pages_blog_tsx_cf0a_${category}`}>
                  {category}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div
              className="relative w-full md:w-64"
              data-icod-id="src_pages_blog_tsx_e8d9">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                data-icod-id="src_pages_blog_tsx_910f" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-icod-id="src_pages_blog_tsx_0e9e" />
            </div>
          </div>
        </div>
      </section>
      {/* Blog Grid */}
      <section className="py-24" style={{ background: 'var(--section-blush)' }} data-icod-id="src_pages_blog_tsx_71ed">
        <div className="container mx-auto px-4" data-icod-id="src_pages_blog_tsx_3fce">
          {status === 'loading' ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              data-icod-id="src_pages_blog_tsx_skeleton_grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-[20px] border border-border bg-card overflow-hidden"
                  data-icod-id={`src_pages_blog_tsx_skel_${i}`}>
                  <Skeleton variant="rect" className="h-48 w-full rounded-none" data-icod-id={`src_pages_blog_tsx_skel_img_${i}`} />
                  <div className="p-6 space-y-3" data-icod-id={`src_pages_blog_tsx_skel_body_${i}`}>
                    <Skeleton variant="text" className="h-4 w-20" data-icod-id={`src_pages_blog_tsx_skel_cat_${i}`} />
                    <Skeleton variant="text" className="h-6 w-4/5" data-icod-id={`src_pages_blog_tsx_skel_title_${i}`} />
                    <Skeleton variant="text" className="h-4 w-full" data-icod-id={`src_pages_blog_tsx_skel_desc1_${i}`} />
                    <Skeleton variant="text" className="h-4 w-3/4" data-icod-id={`src_pages_blog_tsx_skel_desc2_${i}`} />
                    <div className="pt-2 flex items-center gap-2" data-icod-id={`src_pages_blog_tsx_skel_meta_${i}`}>
                      <Skeleton variant="circle" className="h-6 w-6" data-icod-id={`src_pages_blog_tsx_skel_avatar_${i}`} />
                      <Skeleton variant="text" className="h-3 w-24" data-icod-id={`src_pages_blog_tsx_skel_author_${i}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div
                key={`blog-page-${currentPage}`}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                data-icod-id="src_pages_blog_tsx_fe97">
                {paginatedPosts.map((post, index) => (
                  <div key={post._id ?? post.id ?? index} data-icod-id={`src_pages_blog_tsx_2e53_${post._id ?? post.id ?? index}`}>
                    <BlogCard post={post} data-icod-id={`src_pages_blog_tsx_346f_${post._id ?? post.id ?? index}`} />
                  </div>
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-icod-id="src_pages_blog_tsx_f475">
                  No articles found matching your criteria.
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12" data-icod-id="src_pages_blog_tsx_c26e">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    data-icod-id="src_pages_blog_tsx_2acb" />
                </div>
              )}
            </>
          )}
        </div>
      </section>
      {/* Sidebar Ad (xl screens only) */}
      <div
        className="hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 w-44 z-30"
        data-icod-id="src_pages_blog_tsx_0eb9">
        <AdSenseSlot format="sidebar" data-icod-id="src_pages_blog_tsx_1b5f" />
      </div>
    </>
  );
}
