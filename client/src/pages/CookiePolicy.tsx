import { Link } from 'react-router-dom';
import { Card, Button } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import { Cookie, ChevronLeft, Check, X } from 'lucide-react';
import { SchemaInjector, PAGE_META } from '@/seo';

const cookiePolicyMeta = PAGE_META['/cookie-policy'];

const cookieCategories = [
  {
    name: 'Essential Cookies',
    required: true,
    description: 'Required for basic site functionality including authentication, security, and session management.',
    cookies: [
      { name: 'session_id', purpose: 'Maintains your session during navigation', duration: 'Session' },
      { name: 'csrf_token', purpose: 'Protects against cross-site request forgery', duration: 'Session' },
      { name: 'auth_token', purpose: 'Keeps you logged in across page refreshes', duration: '7 days' },
    ],
  },
  {
    name: 'Analytics Cookies',
    required: false,
    description: 'Help us understand how visitors interact with our website so we can improve the experience.',
    cookies: [
      { name: '_ga', purpose: 'Google Analytics - distinguishes users', duration: '2 years' },
      { name: '_gid', purpose: 'Google Analytics - distinguishes users', duration: '24 hours' },
      { name: '_gat', purpose: 'Google Analytics - throttle request rate', duration: '1 minute' },
    ],
  },
  {
    name: 'Functional Cookies',
    required: false,
    description: 'Enable enhanced features and personalization such as remembering preferences and settings.',
    cookies: [
      { name: 'theme_preference', purpose: 'Remembers your display preferences', duration: '1 year' },
      { name: 'language', purpose: 'Stores your preferred language', duration: '1 year' },
      { name: 'recent_tools', purpose: 'Remembers recently used AI tools', duration: '30 days' },
    ],
  },
  {
    name: 'Marketing Cookies',
    required: false,
    description: 'Used to deliver relevant advertisements and track campaign performance across websites.',
    cookies: [
      { name: '_fbp', purpose: 'Facebook Pixel - tracks conversions from ads', duration: '3 months' },
      { name: '_gcl_au', purpose: 'Google Ads - conversion tracking', duration: '3 months' },
      { name: 'adsense_id', purpose: 'Google AdSense - personalized advertising', duration: '1 year' },
    ],
  },
];

export default function CookiePolicy() {
  return (
    <>
      <SEOHead
        title={cookiePolicyMeta.title}
        description={cookiePolicyMeta.description}
        keywords={cookiePolicyMeta.keywords}
        canonicalUrl={cookiePolicyMeta.canonical}
        data-icod-id="src_pages_cookiepolicy_tsx_c353" />
      <SchemaInjector
        schemaType="page"
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'Cookie Policy', url: '/cookie-policy' },
        ]}
        data-icod-id="src_pages_cookiepolicy_tsx_7656" />
      <div className="py-12 md:py-16" data-icod-id="src_pages_cookiepolicy_tsx_3fab">
        <div
          className="max-w-4xl mx-auto"
          data-icod-id="src_pages_cookiepolicy_tsx_ed4e">
          <nav className="mb-8" data-icod-id="src_pages_cookiepolicy_tsx_4f90">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              data-icod-id="src_pages_cookiepolicy_tsx_7bf7">
              <ChevronLeft className="h-4 w-4 mr-1" data-icod-id="src_pages_cookiepolicy_tsx_a9eb" />
              Back to Home
            </Link>
          </nav>

          <div
            className="flex items-center gap-3 mb-8"
            data-icod-id="src_pages_cookiepolicy_tsx_1636">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
              data-icod-id="src_pages_cookiepolicy_tsx_d4f2">
              <Cookie className="h-6 w-6" data-icod-id="src_pages_cookiepolicy_tsx_64ac" />
            </div>
            <h1
              className="text-3xl md:text-4xl font-bold text-foreground font-heading"
              data-icod-id="src_pages_cookiepolicy_tsx_d324">
              Cookie Policy
            </h1>
          </div>

          <p
            className="text-muted-foreground mb-8"
            data-icod-id="src_pages_cookiepolicy_tsx_2136">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-8" data-icod-id="src_pages_cookiepolicy_tsx_a1eb">
            <Card className="p-6" data-icod-id="src_pages_cookiepolicy_tsx_42fb">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_cookiepolicy_tsx_86fc">What Are Cookies?</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_cookiepolicy_tsx_8432">
                Cookies are small text files that websites place on your device (computer, tablet, or mobile phone) when you visit them. They are widely used to make websites work more efficiently, provide a better user experience, and supply information to website owners.
              </p>
              <p
                className="text-muted-foreground leading-relaxed mt-4"
                data-icod-id="src_pages_cookiepolicy_tsx_87bc">
                We also use similar technologies such as local storage, session storage, and web beacons (collectively referred to as "cookies" in this policy).
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_cookiepolicy_tsx_cd15">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_cookiepolicy_tsx_dbdb">How We Use Cookies</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_cookiepolicy_tsx_6515">
                MG Blessed Beginnings uses cookies for the following purposes:
              </p>
              <ul
                className="list-disc list-inside space-y-2 text-muted-foreground ml-4"
                data-icod-id="src_pages_cookiepolicy_tsx_a830">
                <li data-icod-id="src_pages_cookiepolicy_tsx_c0b2">To ensure the website functions properly and securely</li>
                <li data-icod-id="src_pages_cookiepolicy_tsx_b36e">To remember your preferences and settings</li>
                <li data-icod-id="src_pages_cookiepolicy_tsx_6775">To analyze website traffic and user behavior</li>
                <li data-icod-id="src_pages_cookiepolicy_tsx_79ae">To personalize content and recommendations</li>
                <li data-icod-id="src_pages_cookiepolicy_tsx_d0e7">To deliver relevant advertisements</li>
                <li data-icod-id="src_pages_cookiepolicy_tsx_08f1">To improve our services based on usage patterns</li>
              </ul>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_cookiepolicy_tsx_b13e">
              <h2
                className="text-xl font-semibold text-foreground mb-6 font-heading"
                data-icod-id="src_pages_cookiepolicy_tsx_8088">Cookie Categories</h2>
              
              <div className="space-y-6" data-icod-id="src_pages_cookiepolicy_tsx_0d59">
                {cookieCategories.map((category) => (
                  <div
                    key={category.name}
                    className="border border-border/50 rounded-lg overflow-hidden"
                    data-icod-id={`src_pages_cookiepolicy_tsx_34b2_${category.name}`}>
                    <div
                      className="bg-muted/30 px-4 py-3 flex items-center justify-between"
                      data-icod-id={`src_pages_cookiepolicy_tsx_b037_${category.name}`}>
                      <div
                        className="flex items-center gap-3"
                        data-icod-id={`src_pages_cookiepolicy_tsx_e4c1_${category.name}`}>
                        {category.required ? (
                          <Check
                            className="h-5 w-5 text-success"
                            data-icod-id={`src_pages_cookiepolicy_tsx_f41b_${category.name}`} />
                        ) : (
                          <div
                            className="h-5 w-5 rounded-full border-2 border-muted-foreground/30"
                            data-icod-id={`src_pages_cookiepolicy_tsx_0270_${category.name}`} />
                        )}
                        <h3
                          className="font-semibold text-foreground"
                          data-icod-id={`src_pages_cookiepolicy_tsx_cb27_${category.name}`}>{category.name}</h3>
                      </div>
                      {category.required && (
                        <span
                          className="text-xs font-medium text-success bg-success/10 px-2 py-1 rounded"
                          data-icod-id={`src_pages_cookiepolicy_tsx_47cc_${category.name}`}>
                          Always Active
                        </span>
                      )}
                    </div>
                    
                    <div
                      className="p-4"
                      data-icod-id={`src_pages_cookiepolicy_tsx_083f_${category.name}`}>
                      <p
                        className="text-sm text-muted-foreground mb-4"
                        data-icod-id={`src_pages_cookiepolicy_tsx_42f1_${category.name}`}>{category.description}</p>
                      
                      <div
                        className="overflow-x-auto"
                        data-icod-id={`src_pages_cookiepolicy_tsx_a04e_${category.name}`}>
                        <table
                          className="w-full text-sm"
                          data-icod-id={`src_pages_cookiepolicy_tsx_9525_${category.name}`}>
                          <thead
                            className="bg-muted/20"
                            data-icod-id={`src_pages_cookiepolicy_tsx_1251_${category.name}`}>
                            <tr
                              className="border-b border-border/30"
                              data-icod-id={`src_pages_cookiepolicy_tsx_4b71_${category.name}`}>
                              <th
                                className="px-3 py-2 text-left font-medium text-foreground"
                                data-icod-id={`src_pages_cookiepolicy_tsx_fb5a_${category.name}`}>Cookie Name</th>
                              <th
                                className="px-3 py-2 text-left font-medium text-foreground"
                                data-icod-id={`src_pages_cookiepolicy_tsx_8181_${category.name}`}>Purpose</th>
                              <th
                                className="px-3 py-2 text-left font-medium text-foreground"
                                data-icod-id={`src_pages_cookiepolicy_tsx_5c92_${category.name}`}>Duration</th>
                            </tr>
                          </thead>
                          <tbody
                            className="text-muted-foreground"
                            data-icod-id={`src_pages_cookiepolicy_tsx_cc95_${category.name}`}>
                            {category.cookies.map((cookie) => (
                              <tr
                                key={cookie.name}
                                className="border-b border-border/20 last:border-0"
                                data-icod-id={`src_pages_cookiepolicy_tsx_2bf7_${category.name}_${cookie.name}`}>
                                <td
                                  className="px-3 py-2 font-mono text-xs"
                                  data-icod-id={`src_pages_cookiepolicy_tsx_e07e_${category.name}_${cookie.name}`}>{cookie.name}</td>
                                <td
                                  className="px-3 py-2"
                                  data-icod-id={`src_pages_cookiepolicy_tsx_ea45_${category.name}_${cookie.name}`}>{cookie.purpose}</td>
                                <td
                                  className="px-3 py-2 whitespace-nowrap"
                                  data-icod-id={`src_pages_cookiepolicy_tsx_c3fe_${category.name}_${cookie.name}`}>{cookie.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_cookiepolicy_tsx_28e7">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_cookiepolicy_tsx_871b">Third-Party Cookies</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_cookiepolicy_tsx_3227">
                In addition to our own cookies, we use third-party cookies from trusted partners:
              </p>
              <ul
                className="list-disc list-inside space-y-2 text-muted-foreground ml-4"
                data-icod-id="src_pages_cookiepolicy_tsx_f2a5">
                <li data-icod-id="src_pages_cookiepolicy_tsx_e3d0"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_cookiepolicy_tsx_6357">Google Analytics:</strong> Website analytics and user behavior insights (<a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  data-icod-id="src_pages_cookiepolicy_tsx_b913">Privacy Policy</a>)</li>
                <li data-icod-id="src_pages_cookiepolicy_tsx_8db5"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_cookiepolicy_tsx_d234">Google AdSense:</strong> Advertising and monetization (<a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  data-icod-id="src_pages_cookiepolicy_tsx_438d">Ad Technologies</a>)</li>
                <li data-icod-id="src_pages_cookiepolicy_tsx_add8"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_cookiepolicy_tsx_6dfa">Payment Processor:</strong> Secure payment processing (<a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                  data-icod-id="src_pages_cookiepolicy_tsx_90c6">Privacy Policy</a>)</li>
              </ul>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_cookiepolicy_tsx_7f65">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_cookiepolicy_tsx_132a">Managing Your Cookie Preferences</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_cookiepolicy_tsx_86be">
                You have several options for managing cookies:
              </p>
              
              <h3
                className="text-lg font-medium text-foreground mt-6 mb-3"
                data-icod-id="src_pages_cookiepolicy_tsx_e12d">Browser Settings</h3>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_cookiepolicy_tsx_b4a8">
                Most browsers allow you to control cookies through their settings. You can typically:
              </p>
              <ul
                className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-6"
                data-icod-id="src_pages_cookiepolicy_tsx_4a5e">
                <li data-icod-id="src_pages_cookiepolicy_tsx_74de">View and delete existing cookies</li>
                <li data-icod-id="src_pages_cookiepolicy_tsx_cb84">Block all cookies or only third-party cookies</li>
                <li data-icod-id="src_pages_cookiepolicy_tsx_81a9">Set preferences for specific websites</li>
                <li data-icod-id="src_pages_cookiepolicy_tsx_0140">Receive notifications when cookies are set</li>
              </ul>
              
              <h3
                className="text-lg font-medium text-foreground mb-3"
                data-icod-id="src_pages_cookiepolicy_tsx_44fd">Common Browser Instructions</h3>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                data-icod-id="src_pages_cookiepolicy_tsx_a384">
                {[
                  { name: 'Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                  { name: 'Firefox', url: 'https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer' },
                  { name: 'Safari', url: 'https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac' },
                  { name: 'Edge', url: 'https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
                ].map((browser) => (
                  <a
                    key={browser.name}
                    href={browser.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/50 transition-all text-sm"
                    data-icod-id={`src_pages_cookiepolicy_tsx_3bf2_${browser.name}`}>
                    <span
                      className="font-medium text-foreground"
                      data-icod-id={`src_pages_cookiepolicy_tsx_12bf_${browser.name}`}>{browser.name}</span>
                    <span
                      className="text-muted-foreground ml-2"
                      data-icod-id={`src_pages_cookiepolicy_tsx_665e_${browser.name}`}>Cookie settings guide &rarr;</span>
                  </a>
                ))}
              </div>
              
              <p
                className="text-muted-foreground leading-relaxed mt-6 text-sm"
                data-icod-id="src_pages_cookiepolicy_tsx_ff1e">
                <strong
                  className="text-foreground"
                  data-icod-id="src_pages_cookiepolicy_tsx_96a1">Note:</strong> Blocking essential cookies may prevent certain features of our website from functioning properly. We recommend keeping essential cookies enabled.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_cookiepolicy_tsx_e968">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_cookiepolicy_tsx_cfd1">Do Not Track Signals</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_cookiepolicy_tsx_1d7d">
                Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want to be tracked. Because there is no consistent industry standard for DNT signals, we currently do not respond to DNT browser signals. However, you can manage your tracking preferences through the methods described above.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_cookiepolicy_tsx_8c95">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_cookiepolicy_tsx_2362">Updates to This Policy</h2>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_pages_cookiepolicy_tsx_85c0">
                We may update this Cookie Policy from time to time to reflect changes in our practices, technology, or legal requirements. The "Last updated" date at the top indicates when revisions were made. We encourage you to review this policy periodically.
              </p>
            </Card>

            <Card className="p-6" data-icod-id="src_pages_cookiepolicy_tsx_87f2">
              <h2
                className="text-xl font-semibold text-foreground mb-4 font-heading"
                data-icod-id="src_pages_cookiepolicy_tsx_5f8d">Contact Us</h2>
              <p
                className="text-muted-foreground leading-relaxed mb-4"
                data-icod-id="src_pages_cookiepolicy_tsx_3039">
                If you have questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div
                className="bg-muted/30 rounded-lg p-4 space-y-2 text-muted-foreground"
                data-icod-id="src_pages_cookiepolicy_tsx_9087">
                <p data-icod-id="src_pages_cookiepolicy_tsx_0fc0"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_cookiepolicy_tsx_189b">Email:</strong> <a
                  href="mailto:hmsmart.official@gmail.com"
                  className="text-primary hover:underline"
                  data-icod-id="src_pages_cookiepolicy_tsx_email_link">hmsmart.official@gmail.com</a></p>
                <p data-icod-id="src_pages_cookiepolicy_tsx_4e89"><strong
                  className="text-foreground"
                  data-icod-id="src_pages_cookiepolicy_tsx_bf58">Related Policies:</strong></p>
                <div
                  className="flex gap-3 mt-2"
                  data-icod-id="src_pages_cookiepolicy_tsx_8c42">
                  <Link
                    to="/privacy-policy"
                    className="text-primary hover:underline text-sm"
                    data-icod-id="src_pages_cookiepolicy_tsx_8171">Privacy Policy</Link>
                  <span className="text-border" data-icod-id="src_pages_cookiepolicy_tsx_d26c">|</span>
                  <Link
                    to="/terms-of-service"
                    className="text-primary hover:underline text-sm"
                    data-icod-id="src_pages_cookiepolicy_tsx_dac8">Terms of Service</Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
