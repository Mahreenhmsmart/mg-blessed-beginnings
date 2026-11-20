import { Link } from 'react-router-dom';
import { Card } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import { Shield, ChevronLeft } from 'lucide-react';
import { SchemaInjector, PAGE_META } from '@/seo';

const privacyPolicyMeta = PAGE_META['/privacy-policy'];

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead
        title={privacyPolicyMeta.title}
        description={privacyPolicyMeta.description}
        keywords={privacyPolicyMeta.keywords}
        canonicalUrl={privacyPolicyMeta.canonical}
        data-icod-id="src_pages_privacypolicy_tsx_6dc7" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy', url: '/privacy-policy' },
        ]}
        data-icod-id="src_pages_privacypolicy_tsx_d0cb" />
      <div
        className="py-12 md:py-16"
        data-icod-id="src_pages_privacypolicy_tsx_585d">
        <div
          className="max-w-4xl mx-auto"
          data-icod-id="src_pages_privacypolicy_tsx_d47c">
          <nav className="mb-8" data-icod-id="src_pages_privacypolicy_tsx_9e0b">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              data-icod-id="src_pages_privacypolicy_tsx_35df">
              <ChevronLeft className="h-4 w-4 mr-1" data-icod-id="src_pages_privacypolicy_tsx_e831" />
              Back to Home
            </Link>
          </nav>

          <div
            className="flex items-center gap-3 mb-8"
            data-icod-id="src_pages_privacypolicy_tsx_0c06">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
              data-icod-id="src_pages_privacypolicy_tsx_9330">
              <Shield className="h-6 w-6" data-icod-id="src_pages_privacypolicy_tsx_fc70" />
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-foreground font-heading"
              data-icod-id="src_pages_privacypolicy_tsx_1b6a">
              Privacy Policy
            </h1>
          </div>

          <p
            className="text-muted-foreground mb-8"
            data-icod-id="src_pages_privacypolicy_tsx_3d4a">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8" data-icod-id="src_pages_privacypolicy_tsx_9d84">
            <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_ccd8">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_privacypolicy_tsx_32b4">1. Introduction</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_privacypolicy_tsx_3e56">
                Welcome to MG Blessed Beginnings ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us in any way.
              </p>
              <p
                className="text-muted-foreground leading-relaxed mt-4"
                data-icod-id="src_pages_privacypolicy_tsx_1ccc">
                This policy complies with the General Data Protection Regulation (GDPR), the UK Data Protection Act 2018, and other applicable international privacy laws.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_8676">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_privacypolicy_tsx_91b1">2. Data Controller</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_privacypolicy_tsx_e1be">
                MG Blessed Beginnings is the data controller responsible for your personal data. If you have any questions about this policy or our data practices, please contact us at:
              </p>
              <ul
                className="mt-4 space-y-2 text-muted-foreground"
                data-icod-id="src_pages_privacypolicy_tsx_8e66">
                <li
                  className="flex items-start gap-2"
                  data-icod-id="src_pages_privacypolicy_tsx_0cd2">
                  <span
                    className="font-medium text-foreground"
                    data-icod-id="src_pages_privacypolicy_tsx_fe94">Email:</span>
                  <a
                    href="mailto:hmsmart.official@gmail.com"
                    className="text-primary hover:underline"
                    data-icod-id="src_pages_privacypolicy_tsx_815c">
                    hmsmart.official@gmail.com
                  </a>
                </li>
                <li
                  className="flex items-start gap-2"
                  data-icod-id="src_pages_privacypolicy_tsx_162e">
                  <span
                    className="font-medium text-foreground"
                    data-icod-id="src_pages_privacypolicy_tsx_bb0e">Address:</span>
                  <span data-icod-id="src_pages_privacypolicy_tsx_73dd">MG Blessed Beginnings, Digital Services Division</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_c092">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_privacypolicy_tsx_73c3">3. Information We Collect</h2>
              
              <h3
                className="text-lg font-medium text-foreground mt-6 mb-3"
                data-icod-id="src_pages_privacypolicy_tsx_67ac">3.1 Personal Data You Provide</h3>
              <ul
                className="list-disc list-inside space-y-2 text-muted-foreground ml-4"
                data-icod-id="src_pages_privacypolicy_tsx_ee9e">
                <li data-icod-id="src_pages_privacypolicy_tsx_a844">Name and email address (when you contact us or book consultations)</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_a60f">Phone number (for consultation bookings)</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_8e52">Business information (website URLs, competitor data for audits)</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_8b30">Payment information (processed securely through our payment provider; we never store full card details)</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_fa21">Account credentials (email and hashed password for registered users)</li>
              </ul>

              <h3
                className="text-lg font-medium text-foreground mt-6 mb-3"
                data-icod-id="src_pages_privacypolicy_tsx_5141">3.2 Automatically Collected Data</h3>
              <ul
                className="list-disc list-inside space-y-2 text-muted-foreground ml-4"
                data-icod-id="src_pages_privacypolicy_tsx_36eb">
                <li data-icod-id="src_pages_privacypolicy_tsx_595c">IP address and approximate geographic location</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_eb22">Browser type, version, and operating system</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_05d3">Pages visited, time spent, and navigation patterns</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_e934">Device type and screen resolution</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_fcfb">Referring website or search engine</li>
              </ul>

              <h3
                className="text-lg font-medium text-foreground mt-6 mb-3"
                data-icod-id="src_pages_privacypolicy_tsx_f546">3.3 Cookies and Tracking Technologies</h3>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_privacypolicy_tsx_7ca9">
                We use cookies and similar technologies to improve your experience. See our <Link
                to="/cookie-policy"
                className="text-primary hover:underline"
                data-icod-id="src_pages_privacypolicy_tsx_30bc">Cookie Policy</Link> for detailed information.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_76bd">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_privacypolicy_tsx_0f17">4. How We Use Your Data</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_privacypolicy_tsx_ee19">
                We process your personal data for the following purposes and legal bases:
              </p>
              <div
                className="overflow-x-auto"
                data-icod-id="src_pages_privacypolicy_tsx_8bd1">
                <table
                  className="w-full text-sm"
                  data-icod-id="src_pages_privacypolicy_tsx_10dc">
                  <thead className="bg-muted/50" data-icod-id="src_pages_privacypolicy_tsx_0be0">
                    <tr
                      className="border-b border-border"
                      data-icod-id="src_pages_privacypolicy_tsx_41d9">
                      <th
                        className="px-4 py-3 text-left font-medium text-foreground"
                        data-icod-id="src_pages_privacypolicy_tsx_e305">Purpose</th>
                      <th
                        className="px-4 py-3 text-left font-medium text-foreground"
                        data-icod-id="src_pages_privacypolicy_tsx_c170">Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody
                    className="text-muted-foreground"
                    data-icod-id="src_pages_privacypolicy_tsx_a0ce">
                    <tr
                      className="border-b border-border/30"
                      data-icod-id="src_pages_privacypolicy_tsx_110b">
                      <td className="px-4 py-3" data-icod-id="src_pages_privacypolicy_tsx_3bcc">Providing AI tools and audit services</td>
                      <td className="px-4 py-3" data-icod-id="src_pages_privacypolicy_tsx_5322">Contract performance</td>
                    </tr>
                    <tr
                      className="border-b border-border/30"
                      data-icod-id="src_pages_privacypolicy_tsx_d9d6">
                      <td className="px-4 py-3" data-icod-id="src_pages_privacypolicy_tsx_3c83">Processing consultation bookings</td>
                      <td className="px-4 py-3" data-icod-id="src_pages_privacypolicy_tsx_8ee9">Contract performance</td>
                    </tr>
                    <tr
                      className="border-b border-border/30"
                      data-icod-id="src_pages_privacypolicy_tsx_3885">
                      <td className="px-4 py-3" data-icod-id="src_pages_privacypolicy_tsx_1482">Sending service-related communications</td>
                      <td className="px-4 py-3" data-icod-id="src_pages_privacypolicy_tsx_e813">Legitimate interest</td>
                    </tr>
                    <tr
                      className="border-b border-border/30"
                      data-icod-id="src_pages_privacypolicy_tsx_a178">
                      <td className="px-4 py-3" data-icod-id="src_pages_privacypolicy_tsx_1df4">Improving our website and services</td>
                      <td className="px-4 py-3" data-icod-id="src_pages_privacypolicy_tsx_f8a9">Legitimate interest</td>
                    </tr>
                    <tr
                      className="border-b border-border/30"
                      data-icod-id="src_pages_privacypolicy_tsx_bd57">
                      <td className="px-4 py-3" data-icod-id="src_pages_privacypolicy_tsx_ac9f">Marketing communications (with consent)</td>
                      <td className="px-4 py-3" data-icod-id="src_pages_privacypolicy_tsx_fe43">Consent</td>
                    </tr>
                    <tr data-icod-id="src_pages_privacypolicy_tsx_6269">
                      <td className="px-4 py-3" data-icod-id="src_pages_privacypolicy_tsx_3857">Legal compliance and fraud prevention</td>
                      <td className="px-4 py-3" data-icod-id="src_pages_privacypolicy_tsx_71de">Legal obligation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_0d63">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_privacypolicy_tsx_458e">5. Data Sharing</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_privacypolicy_tsx_a60e">
                We may share your data with the following third parties:
              </p>
              <ul
                className="list-disc list-inside space-y-2 text-muted-foreground ml-4"
                data-icod-id="src_pages_privacypolicy_tsx_dde6">
                <li data-icod-id="src_pages_privacypolicy_tsx_1e9b"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_c958">Service Providers:</strong> Cloud hosting (AWS/Azure), email delivery (SMTP providers), payment processing</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_434c"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_587f">AI Service Providers:</strong> OpenAI, Anthropic, Google, or Qwen for AI-powered tool functionality</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_7952"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_2081">Analytics Providers:</strong> Google Analytics for website usage insights</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_ec35"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_d9aa">Legal Requirements:</strong> When required by law, court order, or government authorities</li>
              </ul>
              <p
                className="text-muted-foreground leading-relaxed mt-4"
                data-icod-id="src_pages_privacypolicy_tsx_6972">
                All third-party processors are bound by contractual obligations to protect your data and process it only on our instructions.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_f59d">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_privacypolicy_tsx_689c">6. International Data Transfers</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_privacypolicy_tsx_fac1">
                Your data may be transferred to and processed in countries outside the European Economic Area (EEA), including the United States. When we transfer data internationally, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses approved by the European Commission, adequacy decisions, or binding corporate rules.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_ed5c">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_privacypolicy_tsx_03af">7. Data Retention</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_privacypolicy_tsx_b74b">
                We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy:
              </p>
              <ul
                className="list-disc list-inside space-y-2 text-muted-foreground ml-4"
                data-icod-id="src_pages_privacypolicy_tsx_b395">
                <li data-icod-id="src_pages_privacypolicy_tsx_b6dd"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_b794">Account data:</strong> Retained while your account is active, plus 30 days after deletion request</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_55b7"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_776f">Audit/project data:</strong> Retained while associated with an active project</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_649a"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_0591">Contact form submissions:</strong> Retained for 2 years for business records</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_fed3"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_12b9">Consultation records:</strong> Retained for 3 years for service history</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_66f4"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_1ecd">Marketing consent records:</strong> Retained for duration of consent plus 1 year</li>
              </ul>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_8ca8">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_privacypolicy_tsx_2a1b">8. Your Rights (GDPR)</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_privacypolicy_tsx_1faf">
                Under GDPR and applicable data protection laws, you have the following rights:
              </p>
              <ul
                className="list-disc list-inside space-y-3 text-muted-foreground ml-4"
                data-icod-id="src_pages_privacypolicy_tsx_849e">
                <li data-icod-id="src_pages_privacypolicy_tsx_151e"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_3623">Right of Access:</strong> Request a copy of your personal data</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_680b"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_b04f">Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_c838"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_f890">Right to Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_3af6"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_ef83">Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_ff16"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_8d7d">Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_ee36"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_d509">Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_3662"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_1c19">Right to Withdraw Consent:</strong> Withdraw consent at any time for consent-based processing</li>
                <li data-icod-id="src_pages_privacypolicy_tsx_1ea1"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_7302">Right to Lodge a Complaint:</strong> File a complaint with your local supervisory authority</li>
              </ul>
              <p
                className="text-muted-foreground leading-relaxed mt-4"
                data-icod-id="src_pages_privacypolicy_tsx_7135">
                To exercise any of these rights, please contact us at <a
                href="mailto:hmsmart.official@gmail.com"
                className="text-primary hover:underline"
                data-icod-id="src_pages_privacypolicy_tsx_5123">hmsmart.official@gmail.com</a>. We will respond within 30 days.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_090a">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_privacypolicy_tsx_72c0">9. Data Security</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_privacypolicy_tsx_6f48">
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These include encryption in transit (TLS/SSL), secure password hashing (bcrypt), access controls, regular security audits, and employee training on data protection.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_5a79">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_privacypolicy_tsx_68bf">10. Children's Privacy</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_privacypolicy_tsx_822f">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal data from children. If you believe we have inadvertently collected such data, please contact us immediately and we will take steps to delete it.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_ce29">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_privacypolicy_tsx_890b">11. Changes to This Policy</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_privacypolicy_tsx_3892">
                We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes by posting the updated policy on this page with a revised "Last updated" date. Continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_privacypolicy_tsx_7663">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_privacypolicy_tsx_f435">12. Contact Us</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_privacypolicy_tsx_004f">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div
                className="bg-muted/30 rounded-lg p-4 space-y-2 text-muted-foreground"
                data-icod-id="src_pages_privacypolicy_tsx_6f5b">
                <p data-icod-id="src_pages_privacypolicy_tsx_d52b"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_8c29">Data Protection Officer:</strong> <a
                  href="mailto:hmsmart.official@gmail.com"
                  className="text-primary hover:underline"
                  data-icod-id="src_pages_privacypolicy_tsx_dpo_link">hmsmart.official@gmail.com</a></p>
                <p data-icod-id="src_pages_privacypolicy_tsx_f061"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_privacypolicy_tsx_9db0">General Inquiries:</strong> <Link
                  to="/contact"
                  className="text-primary hover:underline"
                  data-icod-id="src_pages_privacypolicy_tsx_37b4">Contact Form</Link></p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
