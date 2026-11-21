import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import AdSenseSlot from '@/components/AdSenseSlot';
import { GraduationCap, ArrowRight, BookOpen, Video, Award } from 'lucide-react';
import { SchemaInjector, PAGE_META } from '@/seo';
import { useSeo } from '@/components/Seo';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { COURSES } from '@/data/courses';

const coursesMeta = PAGE_META['/courses'];

export default function Courses() {
  useSeo(
    'Courses | MG Blessed Beginnings',
    'Learn AI, e-commerce, eBay, Amazon, YouTube and more — paid courses from MG Blessed Beginnings.',
  );
  const { formatPrice } = useCurrencyFormatter();

  return (
    <>
      <SEOHead
        title={coursesMeta.title}
        description={coursesMeta.description}
        keywords={coursesMeta.keywords}
        canonicalUrl={coursesMeta.canonical}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: 'E-Commerce Mastery Courses',
          description: 'Comprehensive e-commerce courses covering Shopify, eBay, Etsy, and digital marketing strategies for online sellers.',
          provider: {
            '@type': 'Organization',
            name: 'MG Blessed Beginnings',
            url: 'https://mgblessed.icod.ai',
          },
          educationalLevel: 'Beginner to Advanced',
          inLanguage: 'en',
          about: ['Shopify', 'eBay', 'Etsy', 'Digital Marketing', 'SEO', 'E-Commerce'],
        }}
        data-icod-id="src_pages_courses_tsx_413d" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Courses', url: '/courses' },
        ]}
        data-icod-id="src_pages_courses_tsx_3bd1" />
      {/* Hero Section */}
      <section
        className="py-16 md:py-24 bg-background"
        data-icod-id="src_pages_courses_tsx_c9fc">
        <div
          className="container mx-auto px-4 text-center max-w-7xl"
          data-icod-id="src_pages_courses_tsx_3c27">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6"
            data-icod-id="src_pages_courses_tsx_9bfe">
            <GraduationCap className="h-4 w-4" data-icod-id="src_pages_courses_tsx_b537" />
            <span data-icod-id="src_pages_courses_tsx_de43">Online Learning</span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-heading"
            data-icod-id="src_pages_courses_tsx_58fb">
            E-commerce Courses
          </h1>
          <p
            className="text-xl text-muted-foreground mb-8 leading-relaxed"
            data-icod-id="src_pages_courses_tsx_7193">
            Comprehensive courses designed to help you master e-commerce platforms, 
            digital marketing, and business growth strategies. Learn at your own pace 
            with expert-led video lessons.
          </p>
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            data-icod-id="src_pages_courses_tsx_8f9e">
            <Link to="/services" data-icod-id="src_pages_courses_tsx_4ef8">
              <Button variant="primary" size="lg" data-icod-id="src_pages_courses_tsx_ebd1">
                Explore Services
                <ArrowRight className="h-4 w-4 ml-2" data-icod-id="src_pages_courses_tsx_e373" />
              </Button>
            </Link>
            <Link to="/contact" data-icod-id="src_pages_courses_tsx_c322">
              <Button variant="outline" size="lg" data-icod-id="src_pages_courses_tsx_e815">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* Ad Banner after Hero */}
      <div
        className="container mx-auto px-4 py-6"
        data-icod-id="src_pages_courses_tsx_a370">
        <AdSenseSlot format="banner" data-icod-id="src_pages_courses_tsx_25c3" />
      </div>
      {/* Features Section */}
      <section
        className="py-16"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_courses_tsx_7f33">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_courses_tsx_93aa">
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
            data-icod-id="src_pages_courses_tsx_8576">
            <Card className="p-6 text-center" data-icod-id="src_pages_courses_tsx_3a63">
              <div
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                data-icod-id="src_pages_courses_tsx_5f52">
                <Video
                  className="h-6 w-6 text-primary"
                  data-icod-id="src_pages_courses_tsx_a87a" />
              </div>
              <h3
                className="font-semibold text-foreground mb-2"
                data-icod-id="src_pages_courses_tsx_bf0f">Video Lessons</h3>
              <p
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_courses_tsx_dfbc">High-quality video content you can watch anytime, anywhere.</p>
            </Card>
            <Card className="p-6 text-center" data-icod-id="src_pages_courses_tsx_0f44">
              <div
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                data-icod-id="src_pages_courses_tsx_ca7f">
                <BookOpen
                  className="h-6 w-6 text-primary"
                  data-icod-id="src_pages_courses_tsx_ef46" />
              </div>
              <h3
                className="font-semibold text-foreground mb-2"
                data-icod-id="src_pages_courses_tsx_59b4">Practical Skills</h3>
              <p
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_courses_tsx_5ce4">Learn actionable strategies you can implement immediately.</p>
            </Card>
            <Card className="p-6 text-center" data-icod-id="src_pages_courses_tsx_9d9b">
              <div
                className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                data-icod-id="src_pages_courses_tsx_b16b">
                <Award
                  className="h-6 w-6 text-primary"
                  data-icod-id="src_pages_courses_tsx_eb41" />
              </div>
              <h3
                className="font-semibold text-foreground mb-2"
                data-icod-id="src_pages_courses_tsx_7662">Certificates</h3>
              <p
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_courses_tsx_acf2">Earn certificates to showcase your new skills.</p>
            </Card>
          </div>
        </div>
      </section>
      {/* Courses Grid */}
      <section
        className="py-20 md:py-28 bg-background"
        data-icod-id="src_pages_courses_tsx_courses_grid_section">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_courses_tsx_courses_grid_container">
          <div className="text-center mb-12" data-icod-id="src_pages_courses_tsx_courses_grid_header">
            <h2
              className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-heading"
              data-icod-id="src_pages_courses_tsx_courses_grid_heading">
              All Courses
            </h2>
            <p
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              data-icod-id="src_pages_courses_tsx_courses_grid_subheading">
              Browse our complete catalog of hands-on courses designed to level up your digital skills.
            </p>
          </div>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto"
            data-icod-id="src_pages_courses_tsx_courses_grid">
            {COURSES.map((course, index) => {
              return (
                <Card
                  key={course.title}
                  gradientBorder
                  className="flex flex-col overflow-hidden group relative"
                  data-icod-id={`src_pages_courses_tsx_course_card_${index}`}>
                  {/* Course thumbnail */}
                  <div className="relative" data-icod-id={`src_pages_courses_tsx_course_img_wrap_${index}`}>
                    <img
                      className="course-image"
                      src={course.thumbnail}
                      alt={course.title}
                      loading="lazy"
                      data-icod-id={`src_pages_courses_tsx_course_img_${index}`} />
                    {course.badge && (
                      <span
                        className="absolute top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider"
                        data-icod-id={`src_pages_courses_tsx_course_badge_${index}`}>
                        {course.badge}
                      </span>
                    )}
                  </div>
                  {/* Card body */}
                  <div className="flex flex-col flex-1 p-5 gap-3" data-icod-id={`src_pages_courses_tsx_course_body_${index}`}>
                    <h3
                      className="text-base font-bold text-foreground font-heading leading-snug group-hover:text-primary transition-colors duration-300"
                      data-icod-id={`src_pages_courses_tsx_course_title_${index}`}>
                      {course.title}
                    </h3>

                    <p
                      className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1"
                      data-icod-id={`src_pages_courses_tsx_course_desc_${index}`}>
                      {course.description}
                    </p>

                    {/* Tags */}
                    {course.tags.length > 0 && (
                      <div
                        className="flex flex-wrap gap-1.5 mt-1"
                        data-icod-id={`src_pages_courses_tsx_course_tags_${index}`}>
                        {course.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-md bg-muted/60 border border-border/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                            data-icod-id={`src_pages_courses_tsx_course_tag_${index}_${tag.replace(/\s+/g, '_')}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Fee */}
                    <div
                      className="mt-2 pt-3 border-t border-border/30"
                      data-icod-id={`src_pages_courses_tsx_course_fee_wrap_${index}`}>
                      <p
                        className="text-sm font-semibold text-foreground"
                        data-icod-id={`src_pages_courses_tsx_course_fee_${index}`}>
                        {formatPrice(course.price)}
                      </p>
                    </div>

                    {/* Enroll CTA */}
                    <Link
                      to="/contact"
                      className="mt-auto pt-2"
                      data-icod-id={`src_pages_courses_tsx_course_cta_link_${index}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-border text-primary hover:bg-secondary hover:border-primary/30 group/btn"
                        data-icod-id={`src_pages_courses_tsx_course_cta_btn_${index}`}>
                        Enroll Now
                        <ArrowRight
                          className="h-3.5 w-3.5 ml-1 group-hover/btn:translate-x-0.5 transition-transform duration-300"
                          data-icod-id={`src_pages_courses_tsx_course_cta_arrow_${index}`} />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section
        className="py-16"
        style={{ background: 'var(--gradient-signature)' }}
        data-icod-id="src_pages_courses_tsx_78f3">
        <div
          className="container mx-auto px-4 text-center"
          data-icod-id="src_pages_courses_tsx_51fc">
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-6 font-heading"
            data-icod-id="src_pages_courses_tsx_9ec8">
            Ready to Level Up Your Skills?
          </h2>
          <p
            className="text-lg text-white/90 mb-8 max-w-2xl mx-auto"
            data-icod-id="src_pages_courses_tsx_053c">
            Join entrepreneurs who are building their businesses with practical guidance and free tools.
          </p>
          <Link to="/contact" data-icod-id="src_pages_courses_tsx_8197">
            <Button
              variant="secondary"
              size="lg"
              className="shadow-lg"
              data-icod-id="src_pages_courses_tsx_6a19">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
