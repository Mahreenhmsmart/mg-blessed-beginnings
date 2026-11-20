import { useState } from 'react';
import { Card, Badge } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { BlogPost } from '@/services/blogService';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface BlogCardProps {
  post: BlogPost;
  className?: string;
}

export default function BlogCard({ post, className }: BlogCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const postId = post._id ?? post.id ?? '';
  const dateValue = post.publishedAt ?? post.createdAt;
  const formattedDate = dateValue
    ? new Date(dateValue).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  // Determine if we should show the image or fallback
  // Only show image if we have a valid URL and it hasn't failed
  const hasValidImage = post.featuredImage && post.featuredImage.trim() !== '' && !imgFailed;

  return (
    <Card
      className={cn('flex flex-col h-full overflow-hidden', className)}
      data-icod-id="src_components_blogcard_tsx_daa8">
      {/* Featured Image */}
      <div
        className="aspect-[16/9] bg-secondary relative overflow-hidden"
        data-icod-id="src_components_blogcard_tsx_aa17">
        {hasValidImage ? (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
            onError={() => setImgFailed(true)}
            data-icod-id="src_components_blogcard_tsx_img" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)' }}
            data-icod-id="src_components_blogcard_tsx_placeholder">
            <span
              className="text-4xl text-primary-foreground font-bold font-heading opacity-60"
              data-icod-id="src_components_blogcard_tsx_4430">MG</span>
          </div>
        )}
      </div>
      <div
        className="p-8 flex flex-col flex-1 gap-2"
        data-icod-id="src_components_blogcard_tsx_8b37">
        {/* Category Badge */}
        {post.category && (
          <Badge
            variant="category"
            className="self-start mb-4"
            data-icod-id="src_components_blogcard_tsx_6326">
            {post.category}
          </Badge>
        )}

        {/* Title — editorial weight */}
        <h3
          className="text-2xl font-bold text-foreground mb-3 line-clamp-2 font-heading leading-snug tracking-tight"
          data-icod-id="src_components_blogcard_tsx_3728">
          <Link
            to={`/blog/${postId}`}
            className="hover:text-primary-hover transition-colors duration-[400ms]"
            data-icod-id="src_components_blogcard_tsx_6f2a">
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p
          className="text-base text-muted-foreground mb-5 line-clamp-3 flex-1 leading-relaxed font-medium"
          data-icod-id="src_components_blogcard_tsx_8743">{post.excerpt}</p>

        {/* Meta — muted, refined */}
        <div
          className="flex items-center gap-5 text-sm text-muted-foreground font-semibold pt-6 border-t border-border"
          data-icod-id="src_components_blogcard_tsx_87e8">
          {post.author && (
            <span
              className="flex items-center gap-2"
              data-icod-id="src_components_blogcard_tsx_3a67">
              <User className="h-4 w-4" data-icod-id="src_components_blogcard_tsx_13d3" />
              {post.author}
            </span>
          )}
          {formattedDate && (
            <span
              className="flex items-center gap-2"
              data-icod-id="src_components_blogcard_tsx_0db2">
              <Calendar className="h-4 w-4" data-icod-id="src_components_blogcard_tsx_0302" />
              {formattedDate}
            </span>
          )}
        </div>

        {/* Read More */}
        <Link
          to={`/blog/${postId}`}
          className="mt-5 inline-flex items-center text-base font-bold text-primary hover:text-primary-hover hover:underline underline-offset-4 transition-all duration-[400ms]"
          data-icod-id="src_components_blogcard_tsx_384d">
          Read Article <ArrowRight className="h-4 w-4 ml-1.5" data-icod-id="src_components_blogcard_tsx_8ee3" />
        </Link>
      </div>
    </Card>
  );
}
