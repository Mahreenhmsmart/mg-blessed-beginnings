import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPosts } from '@/store/slices/blogSlice';
import { Spinner } from '@/components/ui';
import BlogCard from '@/components/BlogCard';
import { ArrowRight } from 'lucide-react';

export default function LatestBlogPosts() {
  const dispatch = useAppDispatch();
  const { posts, status } = useAppSelector((state) => state.blog);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPosts());
    }
  }, [dispatch, status]);

  // Sort by date (newest first) and take top 3
  const latestPosts = [...posts]
    .sort((a, b) => {
      const dateA = new Date(a.publishedAt ?? a.createdAt ?? 0).getTime();
      const dateB = new Date(b.publishedAt ?? b.createdAt ?? 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);

  // Hide the entire section if no posts and not loading
  if (status !== 'loading' && latestPosts.length === 0) {
    return null;
  }

  return (
    <section
      className="py-20 bg-muted/30"
      data-icod-id="src_components_homepage_latestblogposts_tsx_b9a7">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        data-icod-id="src_components_homepage_latestblogposts_tsx_774c">
        <div
          className="text-center mb-12"
          data-icod-id="src_components_homepage_latestblogposts_tsx_eceb">
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground font-heading mb-4"
            data-icod-id="src_components_homepage_latestblogposts_tsx_bd41">
            From the Blog
          </h2>
          <p
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
            data-icod-id="src_components_homepage_latestblogposts_tsx_6129">
            Insights, strategies, and tips to grow your business online.
          </p>
        </div>

        {status === 'loading' ? (
          <div
            className="flex justify-center py-12"
            data-icod-id="src_components_homepage_latestblogposts_tsx_9fd0">
            <Spinner size="lg" data-icod-id="src_components_homepage_latestblogposts_tsx_7a15" />
          </div>
        ) : (
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            data-icod-id="src_components_homepage_latestblogposts_tsx_1629">
            {latestPosts.map((post, __icodIdx0) => (<BlogCard
              key={post._id ?? post.id}
              post={post}
              data-icod-id={`src_components_homepage_latestblogposts_tsx_e574_${__icodIdx0}`} />))}
          </div>
        )}

        <div
          className="text-center mt-10"
          data-icod-id="src_components_homepage_latestblogposts_tsx_aa4c">
          <Link
            to="/blog"
            className="inline-flex items-center text-base font-bold text-primary hover:text-primary-hover hover:underline underline-offset-4 transition-all duration-[400ms]"
            data-icod-id="src_components_homepage_latestblogposts_tsx_c940">
            View all articles <ArrowRight
            className="h-4 w-4 ml-1.5"
            data-icod-id="src_components_homepage_latestblogposts_tsx_c847" />
          </Link>
        </div>
      </div>
    </section>
  );
}
