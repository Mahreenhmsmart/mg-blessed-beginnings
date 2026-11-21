import SEOHead from '@/components/SEOHead';
import VideoEmbed from '@/components/VideoEmbed';
import { Card } from '@/components/ui';
import { cn } from '@/utils/cn';
import { Clapperboard, Hash, MessageSquare, FileText } from 'lucide-react';

interface EpisodeData {
  episode: number;
  title: string;
  script: string;
  captions: string[];
  hashtags: string[];
  videoUrl: string;
}

const episodes: EpisodeData[] = [
  {
    episode: 1,
    title: 'An AI Tool for Sellers (How It Started)',
    script: "I was tired of watching online sellers struggle with content, writing descriptions, finding hashtags, doing SEO. It took hours. So I built something, an AI toolkit that does it all in seconds. 14 free tools, one dashboard, free forever. No signup, no credit card. This is MG Blessed Beginnings, and this is how it started.",
    captions: ['IT TOOK HOURS', '14 FREE TOOLS — ONE DASHBOARD', 'FREE FOREVER — NO SIGNUP'],
    hashtags: ['#AITools', '#OnlineSeller', '#SmallBusiness', '#FreeTools', '#MGblessedbeginnings'],
    videoUrl: 'https://drive.google.com/file/d/1WIzjjZ5h6W5wHzfdPSiKyobzGfvCYZn-/preview',
  },
  {
    episode: 2,
    title: 'I Added an AI Product Description Generator',
    script: "Watch me turn three words into a product description that actually sells. Type a few words and the AI writes a full description in seconds. Polished, professional, and ready to publish. Headlines, features, benefits, everything your buyer needs to say yes. No waiting, no writer's block. Free forever, no sign-up. MG Blessed Beginnings. mgblessed.icod.ai",
    captions: ['THREE WORDS IN', 'A DESCRIPTION THAT SELLS', 'FREE FOREVER - NO SIGN-UP', 'mgblessed.icod.ai'],
    hashtags: ['#ProductDescription', '#AITools', '#Ecommerce', '#OnlineSeller', '#MGblessedbeginnings'],
    videoUrl: 'https://drive.google.com/file/d/1-d4ENPvZQoNZRpHwHmMwVeLf-UQQNlXA/preview',
  },
  {
    episode: 3,
    title: 'SEO Title Optimizer',
    script: "Your product title is probably killing your search ranking. Here's proof. I added an SEO title optimizer. Titles that don't just rank on Google, they get cited by AI answers. Clear, human, and made to be found. Free forever, no sign-up. MG Blessed Beginnings. mgblessed.icod.ai",
    captions: ['KILLING YOUR SEARCH RANKING', 'TITLES THAT RANK ON GOOGLE', 'CLEAR, HUMAN, MADE TO BE FOUND'],
    hashtags: ['#SEO', '#ProductTitles', '#GoogleRanking', '#AITools', '#MGblessedbeginnings'],
    videoUrl: 'https://drive.google.com/file/d/1gKhODEyQye8_0eNXbuR8vi8NN6fMyEuG/preview',
  },
  {
    episode: 4,
    title: 'Social Media Studio',
    script: "I generated an entire week of social media posts in under 60 seconds. Hashtags, captions, ideas, all in your voice, all searchable, all ready to post. Because social media is a search engine now, and your buyers are searching. Free forever. No sign-up. MG Blessed Beginnings. mgblessed.icod.ai",
    captions: ['A WEEK OF POSTS IN 60 SECONDS', 'ALL IN YOUR VOICE — READY TO POST', 'SOCIAL MEDIA IS A SEARCH ENGINE'],
    hashtags: ['#SocialMedia', '#ContentCreation', '#Hashtags', '#AITools', '#MGblessedbeginnings'],
    videoUrl: 'https://drive.google.com/file/d/1hVZikx0WoTdZQunEfOz7O7SPxHbXklKh/preview',
  },
  {
    episode: 5,
    title: 'I Added Competitor Analysis',
    script: "I added competitor analysis. Here's how it works. Step 1. Type your product or shop name. Step 2. The AI finds your competitors and reads their listings. Step 3. You get strengths, gaps, and exactly what to do next. No guessing. No spreadsheets. Free forever. No sign-up. MG Blessed Beginnings. mgblessed.icod.ai",
    captions: ['STEP 1 — TYPE YOUR PRODUCT', 'STEP 2 — AI READS THEIR LISTINGS', 'STEP 3 — STRENGTHS, GAPS, NEXT STEPS'],
    hashtags: ['#CompetitorAnalysis', '#Ecommerce', '#AITools', '#OnlineSeller', '#MGblessedbeginnings'],
    videoUrl: 'https://drive.google.com/file/d/1zKMTaLT31p9qw13GBhymDJX4noXsESoe/preview',
  },
  {
    episode: 6,
    title: 'I Finally Launched MG Blessed Beginnings',
    script: "I finally launched MG Blessed Beginnings. Here's how you use it. Step 1, open mgblessed.icod.ai. Step 2, pick any of the 14 free tools. Step 3, type a few words and get your result in seconds. No sign-up, no credit card, free forever. This is MG Blessed Beginnings, built for online sellers like you.",
    captions: ['STEP 1 — OPEN THE SITE', 'STEP 2 — PICK A TOOL', 'STEP 3 — GET IT IN SECONDS'],
    hashtags: ['#LaunchDay', '#AITools', '#FreeTools', '#OnlineSeller', '#MGblessedbeginnings'],
    videoUrl: 'https://drive.google.com/file/d/1tGo1ZOtXpzNPwolewrYzCAG5xMwQ1Tl6/preview',
  },
  {
    episode: 7,
    title: '100 People Tested My AI App',
    script: "100 people tested my AI app. Here's how you can try it, too. Step 1. Pick any of the 14 free tools. Step 2. Type a few words about your business. Step 3. Get your result in seconds. Free forever, no sign-up. Now it's your turn. MG Blessed Beginnings. mgblessed.icod.ai",
    captions: ['STEP 1 — PICK A TOOL', 'STEP 2 — TYPE A FEW WORDS', 'STEP 3 — GET IT IN SECONDS'],
    hashtags: ['#AITools', '#OnlineSeller', '#TryItFree', '#SmallBusiness', '#MGblessedbeginnings'],
    videoUrl: 'https://drive.google.com/file/d/1qZWCUWapSLZCo7iTh8DPfx0DjNxtExRA/preview',
  },
];

export default function EpisodeScripts() {
  return (
    <>
      <SEOHead
        title="Episode Scripts — I Built This Series | MG Blessed Beginnings"
        description="Full scripts, captions, and hashtags for every episode of the I Built This series documenting the creation of MG Blessed Beginnings AI toolkit."
        keywords="episode scripts, build in public, AI tools, online seller, MG Blessed Beginnings, content series"
        canonicalUrl="/episode-scripts"
        data-icod-id="src_pages_episodescripts_tsx_seo" />

      {/* Hero Section */}
      <section
        className="py-20 md:py-28 relative overflow-hidden"
        style={{ background: 'var(--section-lavender)' }}
        data-icod-id="src_pages_episodescripts_tsx_hero">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[100px]"
          style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
          aria-hidden="true"
          data-icod-id="src_pages_episodescripts_tsx_hero_accent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10" data-icod-id="src_pages_episodescripts_tsx_hero_container">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary mb-6 border border-primary/20"
            data-icod-id="src_pages_episodescripts_tsx_badge">
            <Clapperboard className="h-4 w-4" data-icod-id="src_pages_episodescripts_tsx_badge_icon" />
            I Built This Series
          </div>
          <h1
            className="text-3xl md:text-5xl font-extrabold text-foreground mb-6 font-heading leading-tight"
            data-icod-id="src_pages_episodescripts_tsx_title">
            Episode{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--primary-hover)) 50%, rgb(var(--accent)) 100%)' }}
              data-icod-id="src_pages_episodescripts_tsx_title_gradient">
              Scripts & Captions
            </span>
          </h1>
          <p
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            data-icod-id="src_pages_episodescripts_tsx_subtitle">
            Every word-for-word script, on-screen caption, and hashtag set from the 7-episode content series documenting the build of MG Blessed Beginnings.
          </p>
        </div>
      </section>

      {/* Episodes */}
      <section className="py-16 md:py-20 bg-background" data-icod-id="src_pages_episodescripts_tsx_episodes_section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12" data-icod-id="src_pages_episodescripts_tsx_episodes_container">
          {episodes.map((ep) => (
            <Card
              key={ep.episode}
              className={cn('overflow-hidden')}
              data-icod-id={`src_pages_episodescripts_tsx_card_${ep.episode}`}>
              {/* Gradient top accent */}
              <div
                className="h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-70"
                data-icod-id={`src_pages_episodescripts_tsx_card_accent_${ep.episode}`} />

              <div className="p-6 md:p-8 space-y-6" data-icod-id={`src_pages_episodescripts_tsx_card_content_${ep.episode}`}>
                {/* Episode header */}
                <div className="flex items-start gap-4" data-icod-id={`src_pages_episodescripts_tsx_card_header_${ep.episode}`}>
                  <div
                    className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-sm shadow-md shadow-primary/20"
                    data-icod-id={`src_pages_episodescripts_tsx_ep_num_${ep.episode}`}>
                    {ep.episode}
                  </div>
                  <div data-icod-id={`src_pages_episodescripts_tsx_ep_info_${ep.episode}`}>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider" data-icod-id={`src_pages_episodescripts_tsx_ep_label_${ep.episode}`}>
                      Episode {ep.episode}
                    </span>
                    <h2
                      className="text-xl md:text-2xl font-bold text-foreground mt-1"
                      data-icod-id={`src_pages_episodescripts_tsx_ep_title_${ep.episode}`}>
                      {ep.title}
                    </h2>
                  </div>
                </div>

                {/* Video embed */}
                <VideoEmbed
                  src={ep.videoUrl}
                  title={`EP.${ep.episode} — ${ep.title}`}
                  data-icod-id={`src_pages_episodescripts_tsx_video_${ep.episode}`} />

                {/* Script section */}
                <div className="space-y-3" data-icod-id={`src_pages_episodescripts_tsx_script_wrap_${ep.episode}`}>
                  <div className="flex items-center gap-2 text-primary" data-icod-id={`src_pages_episodescripts_tsx_script_label_${ep.episode}`}>
                    <FileText className="h-4 w-4" data-icod-id={`src_pages_episodescripts_tsx_script_icon_${ep.episode}`} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider" data-icod-id={`src_pages_episodescripts_tsx_script_heading_${ep.episode}`}>
                      Full Script
                    </h3>
                  </div>
                  <div
                    className="rounded-lg bg-muted/50 border border-border/40 p-5 text-foreground leading-relaxed"
                    data-icod-id={`src_pages_episodescripts_tsx_script_text_${ep.episode}`}>
                    {ep.script}
                  </div>
                </div>

                {/* Captions section (only if present) */}
                {ep.captions.length > 0 && (
                  <div className="space-y-3" data-icod-id={`src_pages_episodescripts_tsx_captions_wrap_${ep.episode}`}>
                    <div className="flex items-center gap-2 text-accent" data-icod-id={`src_pages_episodescripts_tsx_captions_label_${ep.episode}`}>
                      <MessageSquare className="h-4 w-4" data-icod-id={`src_pages_episodescripts_tsx_captions_icon_${ep.episode}`} />
                      <h3 className="text-sm font-semibold uppercase tracking-wider" data-icod-id={`src_pages_episodescripts_tsx_captions_heading_${ep.episode}`}>
                        On-Screen Captions
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2" data-icod-id={`src_pages_episodescripts_tsx_captions_list_${ep.episode}`}>
                      {ep.captions.map((caption, idx) => (
                        <span
                          key={idx}
                          className="inline-block rounded-md bg-accent/10 border border-accent/20 px-3 py-1.5 text-sm font-medium text-accent"
                          data-icod-id={`src_pages_episodescripts_tsx_caption_${ep.episode}_${idx}`}>
                          {caption}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hashtags section */}
                <div className="space-y-3" data-icod-id={`src_pages_episodescripts_tsx_hashtags_wrap_${ep.episode}`}>
                  <div className="flex items-center gap-2 text-muted-foreground" data-icod-id={`src_pages_episodescripts_tsx_hashtags_label_${ep.episode}`}>
                    <Hash className="h-4 w-4" data-icod-id={`src_pages_episodescripts_tsx_hashtags_icon_${ep.episode}`} />
                    <h3 className="text-sm font-semibold uppercase tracking-wider" data-icod-id={`src_pages_episodescripts_tsx_hashtags_heading_${ep.episode}`}>
                      Hashtags
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2" data-icod-id={`src_pages_episodescripts_tsx_hashtags_list_${ep.episode}`}>
                    {ep.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-block rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary"
                        data-icod-id={`src_pages_episodescripts_tsx_hashtag_${ep.episode}_${idx}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
