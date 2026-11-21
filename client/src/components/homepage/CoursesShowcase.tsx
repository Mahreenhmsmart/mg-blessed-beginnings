import { Link } from 'react-router-dom';
import { Card, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { useInView } from '@/hooks/useInView';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { COURSES } from '@/data/courses';

interface CoursesShowcaseProps {
  className?: string;
}

export default function CoursesShowcase({ className }: CoursesShowcaseProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { formatPrice } = useCurrencyFormatter();

  return (
    <section
      className={cn('py-20 md:py-28 bg-background relative overflow-hidden', className)}
      data-icod-id="src_components_homepage_coursesshowcase_tsx_section">
      {/* Background accent */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.03] blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_coursesshowcase_tsx_glow_1" />
      <div
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.03] blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_homepage_coursesshowcase_tsx_glow_2" />
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        data-icod-id="src_components_homepage_coursesshowcase_tsx_container">
        {/* Section header */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-6"
          data-icod-id="src_components_homepage_coursesshowcase_tsx_header">
          <div data-icod-id="src_components_homepage_coursesshowcase_tsx_header_left">
            <div
              className="inline-flex items-center gap-2 text-primary mb-4"
              data-icod-id="src_components_homepage_coursesshowcase_tsx_label">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent"
                data-icod-id="src_components_homepage_coursesshowcase_tsx_icon_wrap">
                <GraduationCap
                  className="h-4 w-4 text-primary-foreground"
                  data-icod-id="src_components_homepage_coursesshowcase_tsx_icon" />
              </div>
              <span
                className="font-bold text-sm tracking-wide uppercase"
                data-icod-id="src_components_homepage_coursesshowcase_tsx_label_text">Courses</span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 font-heading tracking-tight"
              data-icod-id="src_components_homepage_coursesshowcase_tsx_heading">
              Learn With Us —{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)' }}
                data-icod-id="src_components_homepage_coursesshowcase_tsx_heading_gradient">
                Courses I Teach
              </span>
            </h2>
            <p
              className="text-lg text-muted-foreground"
              data-icod-id="src_components_homepage_coursesshowcase_tsx_description">
              Practical, hands-on courses to help you master in-demand digital skills.
            </p>
          </div>
          <Link
            to="/courses"
            className="shrink-0 group"
            data-icod-id="src_components_homepage_coursesshowcase_tsx_view_all_link">
            <span
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-[0_4px_16px_rgba(var(--primary),0.25)]"
              data-icod-id="src_components_homepage_coursesshowcase_tsx_view_all_btn">
              View All Courses
              <ArrowRight
                className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300"
                data-icod-id="src_components_homepage_coursesshowcase_tsx_arrow" />
            </span>
          </Link>
        </div>

        {/* Course cards grid */}
        <div
          ref={ref}
          className={`transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
          data-icod-id="src_components_homepage_coursesshowcase_tsx_grid_wrapper">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            data-icod-id="src_components_homepage_coursesshowcase_tsx_grid">
            {COURSES.map((course, index) => {
              return (
                <Card
                  key={course.title}
                  gradientBorder
                  className="flex flex-col overflow-hidden group relative"
                  data-icod-id={`src_components_homepage_coursesshowcase_tsx_card_${index}`}>
                  {/* Course thumbnail */}
                  <div className="relative" data-icod-id={`src_components_homepage_coursesshowcase_tsx_img_wrap_${index}`}>
                    <img
                      className="course-image"
                      src={course.thumbnail}
                      alt={course.title}
                      loading="lazy"
                      data-icod-id={`src_components_homepage_coursesshowcase_tsx_img_${index}`} />
                    {course.badge && (
                      <span
                        className="absolute top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider"
                        data-icod-id={`src_components_homepage_coursesshowcase_tsx_badge_${index}`}>
                        {course.badge}
                      </span>
                    )}
                  </div>
                  {/* Card body */}
                  <div className="flex flex-col flex-1 p-5 gap-3" data-icod-id={`src_components_homepage_coursesshowcase_tsx_body_${index}`}>
                    <h3
                      className="text-base font-bold text-foreground font-heading leading-snug group-hover:text-primary transition-colors duration-300"
                      data-icod-id={`src_components_homepage_coursesshowcase_tsx_title_${index}`}>
                      {course.title}
                    </h3>

                    <p
                      className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1"
                      data-icod-id={`src_components_homepage_coursesshowcase_tsx_desc_${index}`}>
                      {course.description}
                    </p>

                    {/* Tags */}
                    {course.tags.length > 0 && (
                      <div
                        className="flex flex-wrap gap-1.5 mt-1"
                        data-icod-id={`src_components_homepage_coursesshowcase_tsx_tags_${index}`}>
                        {course.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-md bg-muted/60 border border-border/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                            data-icod-id={`src_components_homepage_coursesshowcase_tsx_tag_${index}_${tag.replace(/\s+/g, '_')}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Fee */}
                    <div
                      className="mt-2 pt-3 border-t border-border/30"
                      data-icod-id={`src_components_homepage_coursesshowcase_tsx_fee_wrap_${index}`}>
                      <p
                        className="text-sm font-semibold text-foreground"
                        data-icod-id={`src_components_homepage_coursesshowcase_tsx_fee_${index}`}>
                        {formatPrice(course.price)}
                      </p>
                    </div>

                    {/* Enroll CTA */}
                    <Link
                      to="/contact"
                      className="mt-auto pt-2"
                      data-icod-id={`src_components_homepage_coursesshowcase_tsx_cta_link_${index}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-border text-primary hover:bg-secondary hover:border-primary/30 group/btn"
                        data-icod-id={`src_components_homepage_coursesshowcase_tsx_cta_btn_${index}`}>
                        Enroll Now
                        <ArrowRight
                          className="h-3.5 w-3.5 ml-1 group-hover/btn:translate-x-0.5 transition-transform duration-300"
                          data-icod-id={`src_components_homepage_coursesshowcase_tsx_cta_arrow_${index}`} />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-14 text-center"
          data-icod-id="src_components_homepage_coursesshowcase_tsx_bottom_cta">
          <Link
            to="/courses"
            className="inline-flex items-center text-base font-bold text-primary hover:text-primary-hover hover:underline underline-offset-4 transition-all duration-[400ms]"
            data-icod-id="src_components_homepage_coursesshowcase_tsx_bottom_link">
            Want to learn more? Visit our full Learning Hub
            <ArrowRight className="h-4 w-4 ml-1.5" data-icod-id="src_components_homepage_coursesshowcase_tsx_bottom_arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
}
