import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight, Gift, User, Shield, Users } from 'lucide-react';
import { Button, Input, Field, Card, Alert } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser } from '@/store/slices/authSlice';
import { applyReferralCode } from '@/store/slices/referralSlice';
import SEOHead from '@/components/SEOHead';
import { PAGE_META } from '@/seo';
import { DEMO_USERS, type DemoUser } from '@/config/demoUsers';

const loginMeta = PAGE_META['/login'];

// ── Demo Credential Row Component ──────────────────────────────────────────────
interface DemoCredentialRowProps {
  demo: DemoUser;
  onFill: (email: string, password: string) => void;
}

function getRoleIcon(role: DemoUser['role']) {
  switch (role) {
    case 'admin': return <Shield className="h-3 w-3 text-primary" data-icod-id="src_pages_login_tsx_2ec8" />;
    case 'manager': return <Users className="h-3 w-3 text-primary" data-icod-id="src_pages_login_tsx_e7df" />;
    default: return <User className="h-3 w-3 text-primary" data-icod-id="src_pages_login_tsx_aa04" />;
  }
}

function DemoCredentialRow({ demo, onFill }: DemoCredentialRowProps) {
  return (
    <div
      className="group flex items-center justify-between rounded-lg border border-border/40 bg-background/50 p-3 transition-all hover:border-primary/30 hover:bg-muted/40"
      data-icod-id="src_pages_login_tsx_demo_credential_row">
      <div className="flex items-center gap-3 min-w-0" data-icod-id="src_pages_login_tsx_demo_info">
        <div className="flex-shrink-0" data-icod-id="src_pages_login_tsx_demo_role_icon">
          {getRoleIcon(demo.role)}
        </div>
        <div className="min-w-0" data-icod-id="src_pages_login_tsx_demo_text">
          <p className="text-xs font-medium text-foreground truncate" data-icod-id="src_pages_login_tsx_demo_email">
            {demo.email}
          </p>
          <p className="text-[10px] text-muted-foreground capitalize" data-icod-id="src_pages_login_tsx_demo_role_label">
            {demo.role} account
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onFill(demo.email, demo.password)}
        className="flex-shrink-0 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label={`Fill ${demo.role} credentials`}
        data-icod-id="src_pages_login_tsx_demo_fill_btn">
        Fill
      </button>
    </div>
  );
}

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect if already authenticated
  const token = useAppSelector((s) => s.auth.token);
  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await dispatch(loginUser({ email: email.trim(), password }));
    if (loginUser.fulfilled.match(result)) {
      // Apply stored referral code after successful login
      const storedRef = localStorage.getItem('referralCode');
      if (storedRef) {
        try {
          await dispatch(applyReferralCode(storedRef));
          localStorage.removeItem('referralCode');
        } catch { /* ignore — referral failure shouldn't block login */ }
      }
      // Navigation to /dashboard is handled by the useEffect that watches `token`
    }
  };

  const isLoading = status === 'loading';

  return (
    <>
      <SEOHead
        title={loginMeta.title}
        description={loginMeta.description}
        canonicalUrl={loginMeta.canonical}
        noindex={loginMeta.noindex}
        data-icod-id="src_pages_login_tsx_0baf" />
      <div
        className="relative flex min-h-screen w-full items-center justify-center px-4 py-12 overflow-hidden bg-background"
        data-icod-id="src_pages_login_tsx_b0b4">
      {/* Very subtle background orbs */}
      <div
        className="pointer-events-none absolute -top-48 -right-48 h-[600px] w-[600px] rounded-full opacity-[0.05] blur-3xl animate-float-slow"
        style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
        aria-hidden="true"
        data-icod-id="src_pages_login_tsx_7916" />
      <div
        className="pointer-events-none absolute -bottom-56 -left-56 h-[500px] w-[500px] rounded-full opacity-[0.04] blur-3xl animate-float-slow"
        style={{ 
          background: 'radial-gradient(circle, rgb(var(--cyan)) 0%, transparent 70%)',
          animationDelay: '2s'
        }}
        aria-hidden="true"
        data-icod-id="src_pages_login_tsx_b914" />
      {/* Subtle lavender wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(var(--primary), 0.08) 0%, transparent 50%)' }}
        aria-hidden="true"
        data-icod-id="src_pages_login_tsx_3940" />
      <div
        className="relative z-10 w-full max-w-md animate-fade-up-stagger"
        data-icod-id="src_pages_login_tsx_ad65">
        
        {/* Brand header — clean */}
        <div className="mb-10 text-center" data-icod-id="src_pages_login_tsx_a0ec">
          <Link
            to="/"
            className="inline-block group"
            data-icod-id="src_pages_login_tsx_e065">
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_4px_16px_rgba(109,0,217,0.3)] transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 overflow-hidden"
              data-icod-id="src_pages_login_tsx_df3a">
              <img
                className="mg-logo"
                src="/assets/1795177902729_mg-logo-new-transparent-upload.webp"
                alt="MG Blessed Beginnings"
                data-icod-id="src_pages_login_tsx_logo_img" />
            </div>
          </Link>
          <h1
            className="font-heading text-2xl font-extrabold text-primary tracking-tight"
            data-icod-id="src_pages_login_tsx_dbea">
            Sign In
          </h1>
          <p
            className="mt-2 text-sm text-muted-foreground"
            data-icod-id="src_pages_login_tsx_0992">
            Sign in to your Visibility Intelligence dashboard
          </p>
        </div>

        <Card
          className={cn('p-7 sm:p-9 shadow-[0_4px_24px_rgba(109,0,217,0.12)] border-border')}
          data-icod-id="src_pages_login_tsx_cce9">
          {error && (
            <Alert variant="error" className="mb-6 animate-fade-up-stagger" data-icod-id="src_pages_login_tsx_9832">
              {error}
            </Alert>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            data-icod-id="src_pages_login_tsx_3f7d">
            <Field
              label="Email address"
              htmlFor="login-email"
              error={fieldErrors.email}
              required
              data-icod-id="src_pages_login_tsx_84ac">
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                autoComplete="email"
                autoFocus
                className="transition-all duration-[300ms] focus:shadow-[0_0_0_3px_rgba(109,0,217,0.15)]"
                data-icod-id="src_pages_login_tsx_045d" />
            </Field>

            <Field
              label="Password"
              htmlFor="login-password"
              error={fieldErrors.password}
              required
              data-icod-id="src_pages_login_tsx_96cb">
              <div className="relative" data-icod-id="src_pages_login_tsx_4936">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  autoComplete="current-password"
                  className="pr-10 transition-all duration-[300ms] focus:shadow-[0_0_0_3px_rgba(109,0,217,0.15)]"
                  data-icod-id="src_pages_login_tsx_2afe" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-[300ms]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  data-icod-id="src_pages_login_tsx_095d">
                  {showPassword ? <EyeOff className="h-4 w-4" data-icod-id="src_pages_login_tsx_4913" /> : <Eye className="h-4 w-4" data-icod-id="src_pages_login_tsx_4f8d" />}
                </button>
              </div>
            </Field>

            <Button
              type="submit"
              loading={isLoading}
              className="w-full mt-3 shadow-[0_4px_16px_rgba(109,0,217,0.3)] hover:shadow-[0_6px_24px_rgba(109,0,217,0.4)]"
              data-icod-id="src_pages_login_tsx_c4c4">
              Sign In
              {!isLoading && <ArrowRight className="h-4 w-4 ml-2" data-icod-id="src_pages_login_tsx_025a" />}
            </Button>
          </form>
        </Card>

        {/* Demo Credentials Section */}
        <div className="mt-6 animate-fade-up-stagger" data-icod-id="src_pages_login_tsx_demo_section">
          <div
            className="rounded-xl border border-border/60 bg-muted/30 p-5 backdrop-blur-sm"
            data-icod-id="src_pages_login_tsx_demo_box">
            <div className="mb-4 flex items-center gap-2 text-primary" data-icod-id="src_pages_login_tsx_demo_header">
              <Shield className="h-4 w-4" data-icod-id="src_pages_login_tsx_demo_icon" />
              <h3 className="text-sm font-semibold" data-icod-id="src_pages_login_tsx_demo_title">Demo Accounts Available</h3>
            </div>
            <p className="mb-4 text-xs text-muted-foreground" data-icod-id="src_pages_login_tsx_demo_desc">
              Use these credentials to explore the dashboard features:
            </p>
            <div className="space-y-2" data-icod-id="src_pages_login_tsx_demo_list">
              {DEMO_USERS.map((demo) => (
                <DemoCredentialRow
                  key={demo.email}
                  demo={demo}
                  onFill={(email, password) => {
                    setEmail(email);
                    setPassword(password);
                    setFieldErrors({});
                  }}
                  data-icod-id={`src_pages_login_tsx_e432_${demo.email}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Back to home link */}
        <div className="mt-8 text-center" data-icod-id="src_pages_login_tsx_7206">
          <p
            className="text-sm text-muted-foreground mb-3"
            data-icod-id="src_pages_login_tsx_f423">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors duration-[300ms]"
              data-icod-id="src_pages_login_tsx_0d6a">
              Create one
            </Link>
          </p>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-[300ms] inline-flex items-center gap-1"
            data-icod-id="src_pages_login_tsx_538a">
            <ArrowRight className="h-3 w-3 rotate-180" data-icod-id="src_pages_login_tsx_7f9b" />
            Back to Home
          </Link>
        </div>

        {/* Referral code hint */}
        {localStorage.getItem('referralCode') && (
          <div
            className="mt-4 flex items-center justify-center gap-2 text-xs text-primary"
            data-icod-id="src_pages_login_tsx_d05b">
            <Gift className="h-3 w-3" data-icod-id="src_pages_login_tsx_4990" />
            <span data-icod-id="src_pages_login_tsx_0b19">You have a referral code — it will be applied automatically after sign-in.</span>
          </div>
        )}

        <p
          className="mt-6 text-center text-xs text-muted-foreground"
          data-icod-id="src_pages_login_tsx_8225">
          &copy; {new Date().getFullYear()} MG Blessed Beginnings. All rights reserved.
        </p>
      </div>
    </div>
      <style data-icod-id="src_pages_login_tsx_8f7d">{`.mg-logo { height: 48px; width: auto; display: block; }`}</style>
    </>
  );
}
