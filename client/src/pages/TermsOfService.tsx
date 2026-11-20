import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import { FileText, ChevronLeft } from 'lucide-react';
import { SchemaInjector, PAGE_META } from '@/seo';

const termsOfServiceMeta = PAGE_META['/terms-of-service'];

export default function TermsOfService() {
  return (
    <>
      <SEOHead
        title={termsOfServiceMeta.title}
        description={termsOfServiceMeta.description}
        keywords={termsOfServiceMeta.keywords}
        canonicalUrl={termsOfServiceMeta.canonical}
        data-icod-id="src_pages_termsofservice_tsx_3340" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Terms of Service', url: '/terms-of-service' },
        ]}
        data-icod-id="src_pages_termsofservice_tsx_7b61" />
      <div
        className="py-12 md:py-16"
        data-icod-id="src_pages_termsofservice_tsx_a723">
        <div
          className="max-w-4xl mx-auto"
          data-icod-id="src_pages_termsofservice_tsx_c674">
          <nav className="mb-8" data-icod-id="src_pages_termsofservice_tsx_05cd">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              data-icod-id="src_pages_termsofservice_tsx_89ab">
              <ChevronLeft className="h-4 w-4 mr-1" data-icod-id="src_pages_termsofservice_tsx_b095" />
              Back to Home
            </Link>
          </nav>

          <div
            className="flex items-center gap-3 mb-8"
            data-icod-id="src_pages_termsofservice_tsx_6ada">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
              data-icod-id="src_pages_termsofservice_tsx_fc6f">
              <FileText className="h-6 w-6" data-icod-id="src_pages_termsofservice_tsx_80df" />
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-foreground font-heading"
              data-icod-id="src_pages_termsofservice_tsx_f0e2">
              Terms of Service
            </h1>
          </div>

          <p
            className="text-muted-foreground mb-8"
            data-icod-id="src_pages_termsofservice_tsx_e244">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8" data-icod-id="src_pages_termsofservice_tsx_8140">
            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_debd">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_8cbf">1. Agreement to Terms</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_termsofservice_tsx_1566">
                By accessing or using the MG Blessed Beginnings website ("Site"), AI tools, dashboard, consultation services, or any other services we provide (collectively, "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use our Services.
              </p>
              <p
                className="text-muted-foreground leading-relaxed mt-4"
                data-icod-id="src_pages_termsofservice_tsx_99ec">
                These Terms constitute a legally binding agreement between you and MG Blessed Beginnings. We reserve the right to modify these Terms at any time. Continued use after changes constitutes acceptance.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_f0e0">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_8fdb">2. Eligibility</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_termsofservice_tsx_33df">
                You must be at least 18 years old and have the legal capacity to enter into binding agreements to use our Services. If you are using the Services on behalf of a business entity, you represent and warrant that you have authority to bind that entity to these Terms.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_e623">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_24a8">3. User Accounts</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_termsofservice_tsx_2caa">
                When you create an account with us:
              </p>
              <ul
                className="list-disc list-inside space-y-2 text-muted-foreground ml-4"
                data-icod-id="src_pages_termsofservice_tsx_476e">
                <li data-icod-id="src_pages_termsofservice_tsx_6eef">You must provide accurate, current, and complete information</li>
                <li data-icod-id="src_pages_termsofservice_tsx_a6ec">You are responsible for maintaining the confidentiality of your credentials</li>
                <li data-icod-id="src_pages_termsofservice_tsx_2132">You are responsible for all activities that occur under your account</li>
                <li data-icod-id="src_pages_termsofservice_tsx_3d41">You must notify us immediately of any unauthorized access</li>
                <li data-icod-id="src_pages_termsofservice_tsx_bec6">We reserve the right to suspend or terminate accounts that violate these Terms</li>
              </ul>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_2424">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_4494">4. Free AI Tools</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_termsofservice_tsx_5854">
                Our free AI tools (product description generator, SEO title optimizer, hashtag generator, price calculator, competitor analyzer, review response writer) are provided:
              </p>
              <ul
                className="list-disc list-inside space-y-2 text-muted-foreground ml-4"
                data-icod-id="src_pages_termsofservice_tsx_e5be">
                <li data-icod-id="src_pages_termsofservice_tsx_68d7">For informational and educational purposes</li>
                <li data-icod-id="src_pages_termsofservice_tsx_5c4d">"As is" without warranties of any kind</li>
                <li data-icod-id="src_pages_termsofservice_tsx_1608">With no guarantee of accuracy, completeness, or suitability</li>
                <li data-icod-id="src_pages_termsofservice_tsx_aee2">Subject to usage limits at our discretion</li>
              </ul>
              <p
                className="text-muted-foreground leading-relaxed mt-4"
                data-icod-id="src_pages_termsofservice_tsx_4e9c">
                AI-generated content should be reviewed, edited, and verified before commercial use. You are solely responsible for how you use AI-generated outputs.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_665b">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_4ce1">5. Paid Services & Consultations</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_termsofservice_tsx_5d8c">
                For paid services including consultations, audits, and premium features:
              </p>
              <ul
                className="list-disc list-inside space-y-2 text-muted-foreground ml-4"
                data-icod-id="src_pages_termsofservice_tsx_4994">
                <li data-icod-id="src_pages_termsofservice_tsx_75e3">Fees are as stated at the time of purchase and are non-refundable unless otherwise specified</li>
                <li data-icod-id="src_pages_termsofservice_tsx_3949">Payment is processed through our secure payment provider; you agree to their terms</li>
                <li data-icod-id="src_pages_termsofservice_tsx_da80">Consultation bookings are subject to availability and confirmation</li>
                <li data-icod-id="src_pages_termsofservice_tsx_6d88">Cancellations must be made at least 24 hours in advance for a reschedule option</li>
                <li data-icod-id="src_pages_termsofservice_tsx_d2e7">We reserve the right to refuse service to anyone for any reason</li>
              </ul>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_a882">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_2229">6. Dashboard & Audit Services</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_termsofservice_tsx_a11d">
                The visibility intelligence dashboard provides:
              </p>
              <ul
                className="list-disc list-inside space-y-2 text-muted-foreground ml-4"
                data-icod-id="src_pages_termsofservice_tsx_a438">
                <li data-icod-id="src_pages_termsofservice_tsx_6ed5">Website audits analyzing SEO, AEO, GEO, AIO, and SXO factors</li>
                <li data-icod-id="src_pages_termsofservice_tsx_3323">Competitor analysis based on publicly available data</li>
                <li data-icod-id="src_pages_termsofservice_tsx_9cf3">Keyword gap analysis and backlink opportunity identification</li>
                <li data-icod-id="src_pages_termsofservice_tsx_d983">Content recommendations and AI visibility assessments</li>
              </ul>
              <p
                className="text-muted-foreground leading-relaxed mt-4"
                data-icod-id="src_pages_termsofservice_tsx_f802">
                Audit results are estimates based on automated analysis and may not reflect actual search engine rankings or performance. Use them as guidance, not definitive metrics.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_182d">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_e476">7. Acceptable Use</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_termsofservice_tsx_6517">
                You agree NOT to:
              </p>
              <ul
                className="list-disc list-inside space-y-2 text-muted-foreground ml-4"
                data-icod-id="src_pages_termsofservice_tsx_d065">
                <li data-icod-id="src_pages_termsofservice_tsx_8682">Use Services for illegal, fraudulent, or harmful purposes</li>
                <li data-icod-id="src_pages_termsofservice_tsx_905f">Attempt to gain unauthorized access to systems or accounts</li>
                <li data-icod-id="src_pages_termsofservice_tsx_e199">Reverse engineer, decompile, or disassemble our software</li>
                <li data-icod-id="src_pages_termsofservice_tsx_d66d">Use automated tools to scrape or extract data without permission</li>
                <li data-icod-id="src_pages_termsofservice_tsx_c48c">Interfere with or disrupt the Services or servers</li>
                <li data-icod-id="src_pages_termsofservice_tsx_d30e">Submit malicious code, viruses, or harmful content</li>
                <li data-icod-id="src_pages_termsofservice_tsx_ea59">Impersonate others or misrepresent your identity</li>
                <li data-icod-id="src_pages_termsofservice_tsx_79a6">Violate intellectual property rights of MG Blessed Beginnings or third parties</li>
              </ul>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_646e">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_6444">8. Intellectual Property</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_termsofservice_tsx_4a43">
                All content, features, and functionality of our Services—including but not limited to text, graphics, logos, software, AI models, and design—are owned by MG Blessed Beginnings or its licensors and protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p
                className="text-muted-foreground leading-relaxed mt-4"
                data-icod-id="src_pages_termsofservice_tsx_5440">
                Content you generate using our AI tools belongs to you, subject to these Terms. However, we retain ownership of the underlying AI systems, prompts, and methodologies.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_5d2d">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_7af9">9. Disclaimer of Warranties</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_termsofservice_tsx_7787">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_d43a">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_3e9b">10. Limitation of Liability</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_termsofservice_tsx_83df">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, MG BLESSED BEGINNINGS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, BUSINESS OPPORTUNITIES, OR GOODWILL. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_dfe4">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_281d">11. Indemnification</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_termsofservice_tsx_fb79">
                You agree to indemnify and hold harmless MG Blessed Beginnings, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Services, violation of these Terms, or infringement of any third-party rights.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_28d4">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_16ae">12. Termination</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_termsofservice_tsx_b7b0">
                We may terminate or suspend your access to the Services at any time, with or without cause, with or without notice. Upon termination, your right to use the Services ceases immediately. Sections that by their nature survive termination (disclaimers, liability limitations, indemnification) will continue in effect.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_1f3e">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_0902">13. Governing Law</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_termsofservice_tsx_2b77">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising under these Terms shall be resolved in the appropriate courts of the governing jurisdiction.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_e381">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_55e9">14. Severability</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_termsofservice_tsx_f07b">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_termsofservice_tsx_da79">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_termsofservice_tsx_ad8f">15. Contact</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_termsofservice_tsx_ccdc">
                For questions about these Terms of Service, please contact us:
              </p>
              <div
                className="bg-muted/30 rounded-lg p-4 space-y-2 text-muted-foreground"
                data-icod-id="src_pages_termsofservice_tsx_cf53">
                <p data-icod-id="src_pages_termsofservice_tsx_8e0b"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_termsofservice_tsx_c3bc">Email:</strong> <a
                  href="mailto:hmsmart.official@gmail.com"
                  className="text-primary hover:underline"
                  data-icod-id="src_pages_termsofservice_tsx_email_link">hmsmart.official@gmail.com</a></p>
                <p data-icod-id="src_pages_termsofservice_tsx_cc8b"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_termsofservice_tsx_b6a8">General Inquiries:</strong> <Link
                  to="/contact"
                  className="text-primary hover:underline"
                  data-icod-id="src_pages_termsofservice_tsx_c823">Contact Form</Link></p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
