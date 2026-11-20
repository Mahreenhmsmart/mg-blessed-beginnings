import { useState } from 'react';
import { Card, Button, CopyButton } from '@/components/ui';
import { BookOpen, ExternalLink, ChevronDown, ChevronUp, Download } from 'lucide-react';

interface ChatGPTPrompt {
  id: string;
  text: string;
}

interface ChatGPTCategory {
  name: string;
  color: string;
  glow: string;
  prompts: ChatGPTPrompt[];
}

const CHATGPT_CATEGORIES: ChatGPTCategory[] = [
  {
    name: 'Marketing & Social Media',
    color: 'rgb(var(--primary))',
    glow: 'rgba(157, 106, 255, 0.15)',
    prompts: [
      { id: 'mkt-1', text: 'Write a [platform] post about [topic] targeting [audience] with a [tone] tone. Include [number] hashtags and a call-to-action that encourages [desired action].' },
      { id: 'mkt-2', text: 'Create a [number]-day social media content calendar for [brand/business] in the [industry] niche. Include post types, captions, best posting times, and hashtag suggestions for each day.' },
      { id: 'mkt-3', text: 'Generate [number] Facebook ad headline variations for [product/service] targeting [demographic]. Each headline should be under [character limit] characters and emphasize [key benefit].' },
      { id: 'mkt-4', text: 'Write an Instagram Reel script (under [seconds] seconds) promoting [product/event]. Start with a hook that addresses [pain point], include [number] key talking points, and end with a CTA to [action].' },
      { id: 'mkt-5', text: 'Draft a LinkedIn thought leadership post about [industry trend] from the perspective of a [job title] at a [company type]. Keep it professional yet conversational, include [number] actionable insights, and end with a question to drive engagement.' },
      { id: 'mkt-6', text: 'Create a TikTok video concept for [brand] showcasing [product feature]. Describe the visual sequence, suggest trending audio, write the on-screen text overlays, and craft a caption with [number] relevant hashtags.' },
      { id: 'mkt-7', text: 'Write a Twitter/X thread ([number] tweets) explaining [complex topic] for [audience]. Start with a provocative hook tweet, break the concept into digestible points, and end with a summary and follow CTA.' },
      { id: 'mkt-8', text: 'Design an email marketing campaign for [product launch/event] consisting of [number] emails. Outline subject lines, preview text, key messaging for each email, send timing, and A/B test suggestions.' },
      { id: 'mkt-9', text: 'Generate [number] YouTube video title and description pairs for a [channel niche] channel. Each title should be SEO-optimized under [character limit] characters, and descriptions should include timestamps, links, and [number] keywords.' },
      { id: 'mkt-10', text: 'Write a Pinterest pin description for [product/blog post] targeting [audience]. Include [number] keyword-rich sentences, a compelling CTA, and suggest [number] related search terms to boost discoverability.' },
    ],
  },
  {
    name: 'Content Writing & Blogging',
    color: '#FF6EB4',
    glow: 'rgba(255, 110, 180, 0.15)',
    prompts: [
      { id: 'cwb-1', text: 'Write a [word count]-word blog post about [topic] for [target audience]. Use a [tone] tone, include [number] subheadings, add practical examples, and optimize for the keyword "[target keyword]".' },
      { id: 'cwb-2', text: 'Create a detailed outline for a comprehensive guide on [topic]. Include [number] main sections with subsections, suggest internal linking opportunities, recommend [number] statistics or data points to include, and propose a compelling introduction hook.' },
      { id: 'cwb-3', text: 'Rewrite the following paragraph in a [tone] voice while maintaining its core message: "[paste text]". Improve readability, add transition words, and ensure it scores above [score] on readability tools.' },
      { id: 'cwb-4', text: 'Generate [number] SEO-optimized meta descriptions (under 155 characters each) for a blog post about [topic] targeting the keyword "[keyword]". Each should include a value proposition and a subtle CTA.' },
      { id: 'cwb-5', text: 'Write a product review for [product name] in the style of [publication/writer]. Cover pros, cons, pricing, alternatives, and a final verdict. Target [word count] words and include [number] comparison points against competitors.' },
      { id: 'cwb-6', text: 'Create a listicle titled "[Number] Ways to [Achieve Result]" for [audience]. Write engaging introductions for each point, include actionable tips, real-world examples, and a conclusion with a CTA to [desired action].' },
      { id: 'cwb-7', text: 'Draft a case study about how [company/person] achieved [result] using [method/tool]. Structure it with background, challenge, solution, results (include [number] metrics), and key takeaways. Target [word count] words.' },
      { id: 'cwb-8', text: 'Write a newsletter edition for [newsletter name] covering [topic]. Include a personal anecdote opener, [number] curated insights with commentary, one actionable tip, and a closing question to encourage replies. Keep it under [word count] words.' },
      { id: 'cwb-9', text: 'Create a guest post pitch email to [publication name] proposing an article about [topic]. Highlight your expertise in [area], suggest [number] angle options, explain why their audience would care, and include a brief author bio.' },
      { id: 'cwb-10', text: 'Write an FAQ section with [number] questions and answers about [topic/product]. Address common objections, use natural language matching how customers actually search, and include internal links to relevant pages where appropriate.' },
    ],
  },
  {
    name: 'Business Strategy & E-commerce',
    color: 'rgb(var(--accent))',
    glow: 'rgba(0, 212, 245, 0.15)',
    prompts: [
      { id: 'bse-1', text: 'Develop a [timeframe]-month business plan for a [business type] targeting [market]. Include executive summary, market analysis, revenue model, marketing strategy, operational plan, and financial projections with [number] key milestones.' },
      { id: 'bse-2', text: 'Analyze the competitive landscape for [product/niche] in the [industry] space. Identify [number] direct competitors, compare pricing strategies, evaluate their strengths and weaknesses, and suggest [number] differentiation opportunities.' },
      { id: 'bse-3', text: 'Create a customer persona for [product/service] based on these demographics: [age, location, income, interests]. Detail their pain points, buying triggers, preferred channels, objections, and the journey from awareness to purchase.' },
      { id: 'bse-4', text: 'Design an e-commerce product launch checklist for [product category]. Cover pre-launch ([number] tasks), launch day ([number] tasks), and post-launch optimization ([number] tasks). Include timeline, responsible roles, and success metrics.' },
      { id: 'bse-5', text: 'Write a SWOT analysis for [business/product] in the [industry] market. Provide [number] specific items for each quadrant with actionable recommendations to leverage strengths, address weaknesses, capitalize on opportunities, and mitigate threats.' },
      { id: 'bse-6', text: 'Generate a pricing strategy recommendation for [product/service] considering [cost structure], [competitor prices], and [target margin]. Compare [number] pricing models (e.g., cost-plus, value-based, competitive) and recommend the best approach with justification.' },
      { id: 'bse-7', text: 'Create a customer retention strategy for [business type] with a current churn rate of [percentage]. Suggest [number] specific tactics including loyalty programs, email sequences, feedback loops, and win-back campaigns with expected impact estimates.' },
      { id: 'bse-8', text: 'Draft a partnership proposal to [potential partner] for a co-marketing campaign around [theme/product]. Outline mutual benefits, proposed activities, resource commitments, timeline, KPIs, and how success will be measured for both parties.' },
      { id: 'bse-9', text: 'Build a conversion rate optimization plan for [website/store] currently converting at [rate]. Audit [number] key pages, identify friction points, propose A/B tests with hypotheses, and prioritize improvements by expected ROI.' },
      { id: 'bse-10', text: 'Create a quarterly OKR framework for a [team/department] focused on [objective area]. Define [number] objectives with [number] measurable key results each, suggest tracking cadence, and include examples of initiatives that drive each KR.' },
    ],
  },
  {
    name: 'Coding & Web Development',
    color: '#FFAA44',
    glow: 'rgba(255, 170, 68, 0.15)',
    prompts: [
      { id: 'cwd-1', text: 'Write a [language] function that [description of functionality]. Handle edge cases for [edge case 1] and [edge case 2], include inline comments explaining the logic, and provide [number] usage examples with expected outputs.' },
      { id: 'cwd-2', text: 'Create a REST API endpoint specification for [resource] in a [framework] application. Define the request/response schemas, validation rules, error handling for [number] scenarios, authentication requirements, and example cURL commands.' },
      { id: 'cwd-3', text: 'Debug this [language] code that is throwing [error message]: [paste code]. Explain what is causing the issue, provide the corrected code, and suggest [number] preventive measures to avoid similar bugs in the future.' },
      { id: 'cwd-4', text: 'Design a database schema for a [application type] using [database type]. Include [number] tables with relationships, indexes for common queries, sample data, and explain normalization decisions. Provide the CREATE TABLE statements.' },
      { id: 'cwd-5', text: 'Write a React component called [ComponentName] that [functionality]. Accept props for [prop list], manage internal state for [state needs], include TypeScript interfaces, handle loading and error states, and follow accessibility best practices.' },
      { id: 'cwd-6', text: 'Create a CI/CD pipeline configuration for a [tech stack] project using [CI/CD tool]. Include stages for linting, testing ([number] test types), building, deploying to [environment], and notification on failure. Add comments explaining each stage.' },
      { id: 'cwd-7', text: 'Refactor this [language] code to improve performance and readability: [paste code]. Apply [design pattern] where appropriate, reduce time complexity from [current] to [target], add proper error handling, and explain each change.' },
      { id: 'cwd-8', text: 'Write unit tests for [function/module] using [testing framework]. Cover happy path, [number] edge cases, error conditions, and boundary values. Use descriptive test names following the "[pattern]" convention and include setup/teardown where needed.' },
      { id: 'cwd-9', text: 'Create a Docker setup for a [tech stack] application. Write the Dockerfile with multi-stage builds, docker-compose.yml with [number] services (app, database, cache), environment variable configuration, and health checks. Include a README with setup instructions.' },
      { id: 'cwd-10', text: 'Explain [technical concept] as if teaching a junior developer. Use analogies, provide a minimal working example in [language], show common pitfalls with [number] bad practice examples, and link the concept to real-world applications in [domain].' },
    ],
  },
  {
    name: 'Productivity & Daily Workflow',
    color: 'rgb(var(--success))',
    glow: 'rgba(52, 214, 107, 0.15)',
    prompts: [
      { id: 'pdw-1', text: 'Create a structured daily schedule for a [role/profession] working [hours] per day. Block time for deep work, meetings, breaks, and [personal priority]. Include buffer periods and suggest [number] productivity techniques to maintain focus.' },
      { id: 'pdw-2', text: 'Design a weekly review template covering [number] key areas: accomplishments, goals progress, challenges, lessons learned, and next week priorities. Include reflection prompts for each section and a scoring system to track trends over time.' },
      { id: 'pdw-3', text: 'Write a meeting agenda template for a [meeting type] with [number] attendees lasting [duration]. Include pre-meeting prep items, timed discussion blocks, decision points, action item format, and a follow-up email template.' },
      { id: 'pdw-4', text: 'Create a project kickoff document for [project name]. Cover objectives, scope, deliverables, timeline with [number] milestones, team roles, communication plan, risk register, and success criteria. Format it as a ready-to-share template.' },
      { id: 'pdw-5', text: 'Build a personal goal-setting framework using the [methodology: SMART/OKR/etc.] method for [life area]. Break down a [timeframe] vision into quarterly goals, monthly targets, weekly actions, and daily habits. Include tracking mechanisms and accountability suggestions.' },
      { id: 'pdw-6', text: 'Draft a delegation framework for a [manager role] managing [team size]. Categorize tasks by delegation level, create handoff checklists for [number] recurring tasks, define check-in cadences, and write feedback templates for course correction.' },
      { id: 'pdw-7', text: 'Create an email triage system for handling [number]+ emails daily. Define categories, response time SLAs, template responses for [number] common types, rules for auto-filtering, and an end-of-day inbox-zero routine.' },
      { id: 'pdw-8', text: 'Design a learning plan to master [skill/tool] in [timeframe]. Break it into [number] phases with specific resources (courses, books, projects), practice exercises, milestone assessments, and a capstone project that demonstrates proficiency.' },
      { id: 'pdw-9', text: 'Write a standard operating procedure (SOP) for [recurring task] in a [department/team]. Include purpose, scope, step-by-step instructions with [number] steps, required tools, quality checkpoints, troubleshooting tips, and revision history format.' },
      { id: 'pdw-10', text: 'Create a decision-making framework for [type of decision] considering [number] stakeholders. Include criteria weighting matrix, risk assessment template, pros/cons analysis format, stakeholder alignment checklist, and a post-decision review process.' },
    ],
  },
];

export default function ChatGPTPromptCollection() {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <section
      className="py-16 md:py-24 bg-background relative overflow-hidden"
      data-icod-id="src_components_chatgptpromptcollection_tsx_35f5">
      {/* Decorative glow */}
      <div
        className="absolute -right-40 top-1/4 w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[100px]"
        style={{ background: 'radial-gradient(circle, #FF6EB4 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_components_chatgptpromptcollection_tsx_c16b" />
      <div
        className="container mx-auto px-4 relative z-10"
        data-icod-id="src_components_chatgptpromptcollection_tsx_ccca">
        {/* Header */}
        <div
          className="text-center mb-12"
          data-icod-id="src_components_chatgptpromptcollection_tsx_fe56">
          <div
            className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-5"
            data-icod-id="src_components_chatgptpromptcollection_tsx_aecd">
            <BookOpen
              className="h-4 w-4 text-primary"
              data-icod-id="src_components_chatgptpromptcollection_tsx_9ce4" />
            <span
              className="text-sm font-semibold text-primary tracking-wide uppercase"
              data-icod-id="src_components_chatgptpromptcollection_tsx_7e5b">
              Free Download
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-heading"
            data-icod-id="src_components_chatgptpromptcollection_tsx_9952">
            ChatGPT Prompt{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, rgb(var(--primary)) 0%, #FF6EB4 50%, #FFAA44 100%)' }}
              data-icod-id="src_components_chatgptpromptcollection_tsx_497e">
              Collection
            </span>
          </h2>
          <p
            className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed"
            data-icod-id="src_components_chatgptpromptcollection_tsx_5f8d">
            50 ready-to-use ChatGPT prompts organized in 5 categories — Marketing &amp; Social Media, Content Writing &amp; Blogging, Business Strategy &amp; E-commerce, Coding &amp; Web Development, and Productivity &amp; Daily Workflow.
          </p>

          {/* Download button at top of section */}
          <div
            className="mt-8"
            data-icod-id="src_components_chatgptpromptcollection_tsx_61ef">
            <a
              href="https://drive.google.com/file/d/1mvQS-_rgXg7VBMjPzcf_43nq-M2G702T/view?usp=drivesdk"
              target="_blank"
              rel="noopener noreferrer"
              data-icod-id="src_components_chatgptpromptcollection_tsx_96ec">
              <Button
                variant="primary"
                size="lg"
                data-icod-id="src_components_chatgptpromptcollection_tsx_a3a7">
                <Download
                  className="h-4 w-4 mr-2"
                  data-icod-id="src_components_chatgptpromptcollection_tsx_20aa" />
                Download All 50 Prompts (PDF)
                <ExternalLink
                  className="h-4 w-4 ml-1.5"
                  data-icod-id="src_components_chatgptpromptcollection_tsx_8b19" />
              </Button>
            </a>
          </div>
        </div>

        {/* Expandable Category Cards */}
        <div
          className="space-y-4 max-w-4xl mx-auto"
          data-icod-id="src_components_chatgptpromptcollection_tsx_74d8">
          {CHATGPT_CATEGORIES.map((category) => {
            const isExpanded = expandedCategories[category.name] ?? false;

            return (
              <Card
                key={category.name}
                hoverLift={false}
                className="border-border/80 overflow-hidden"
                data-icod-id={`src_components_chatgptpromptcollection_tsx_98ec_${category.name}`}>
                {/* Category Header (clickable) */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center gap-4 p-5 text-left cursor-pointer hover:bg-muted/30 transition-colors"
                  aria-expanded={isExpanded}
                  data-icod-id={`src_components_chatgptpromptcollection_tsx_8bb9_${category.name}`}>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                    style={{ background: category.glow, color: category.color }}
                    data-icod-id={`src_components_chatgptpromptcollection_tsx_65de_${category.name}`}>
                    {category.prompts.length}
                  </div>
                  <span
                    className="font-semibold text-foreground flex-1"
                    data-icod-id={`src_components_chatgptpromptcollection_tsx_35c6_${category.name}`}>
                    {category.name}
                  </span>
                  {isExpanded ? (
                    <ChevronUp
                      className="h-5 w-5 text-muted-foreground"
                      data-icod-id={`src_components_chatgptpromptcollection_tsx_025e_${category.name}`} />
                  ) : (
                    <ChevronDown
                      className="h-5 w-5 text-muted-foreground"
                      data-icod-id={`src_components_chatgptpromptcollection_tsx_e658_${category.name}`} />
                  )}
                </button>
                {/* Expandable Prompt List */}
                {isExpanded && (
                  <div
                    className="border-t border-border/60 px-5 pb-5 pt-3 space-y-3"
                    data-icod-id={`src_components_chatgptpromptcollection_tsx_f006_${category.name}`}>
                    {category.prompts.map((prompt, index) => (
                      <div
                        key={prompt.id}
                        className="group flex flex-col sm:flex-row gap-3 items-start rounded-xl bg-muted/20 border border-border/40 p-4 transition-colors hover:border-border/70"
                        data-icod-id={`src_components_chatgptpromptcollection_tsx_b0eb_${category.name}_${prompt.id}`}>
                        <span
                          className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold bg-muted/60 text-muted-foreground"
                          data-icod-id={`src_components_chatgptpromptcollection_tsx_0b4c_${category.name}_${prompt.id}`}>
                          {index + 1}
                        </span>
                        <p
                          className="flex-1 text-sm text-foreground/90 font-mono leading-relaxed whitespace-pre-wrap"
                          data-icod-id={`src_components_chatgptpromptcollection_tsx_1d85_${category.name}_${prompt.id}`}>
                          {prompt.text}
                        </p>
                        <CopyButton
                          text={prompt.text}
                          label="Copy"
                          className="shrink-0 self-end sm:self-start opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                          data-icod-id={`src_components_chatgptpromptcollection_tsx_4328_${category.name}_${prompt.id}`} />
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Bottom note */}
        <p
          className="mt-8 text-center text-sm text-muted-foreground"
          data-icod-id="src_components_chatgptpromptcollection_tsx_61b1">
          An MG Blessed Beginnings resource. Prompts include [bracket] placeholders for easy customization. Click any category to expand and copy individual prompts.
        </p>
      </div>
    </section>
  );
}
