import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight, UserPlus } from 'lucide-react';
import { Button, Input, Field, Card, Alert } from '@/components/ui';
import { cn } from '@/utils/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser } from '@/store/slices/authSlice';
import SEOHead from '@/components/SEOHead';
import { PAGE_META } from '@/seo';

const signupMeta = PAGE_META['/signup'];

export default function Signup() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  // Redirect if already authenticated
  const token = useAppSelector((s) => s.auth.token);
  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await dispatch(
      registerUser({ name: name.trim(), email: email.trim(), password }),
    );
    if (registerUser.fulfilled.match(result)) {
      navigate('/dashboard', { replace: true });
    }
  };

  const isLoading = status === 'loading';

  return (
    <>
      <SEOHead
        title={signupMeta.title}
        description={signupMeta.description}
        canonicalUrl={signupMeta.canonical}
        noindex={signupMeta.noindex}
        data-icod-id="src_pages_signup_tsx_380d" />
      <div
        className="relative flex min-h-screen w-full items-center justify-center px-4 py-12 overflow-hidden bg-background"
        data-icod-id="src_pages_signup_tsx_2db3">
        {/* Very subtle background orbs */}
        <div
          className="pointer-events-none absolute -top-48 -right-48 h-[600px] w-[600px] rounded-full opacity-[0.05] blur-3xl animate-float-slow"
          style={{ background: 'radial-gradient(circle, rgb(var(--primary)) 0%, transparent 70%)' }}
          aria-hidden="true"
          data-icod-id="src_pages_signup_tsx_108a" />
        <div
          className="pointer-events-none absolute -bottom-56 -left-56 h-[500px] w-[500px] rounded-full opacity-[0.04] blur-3xl animate-float-slow"
          style={{
            background: 'radial-gradient(circle, rgb(var(--cyan)) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
          aria-hidden="true"
          data-icod-id="src_pages_signup_tsx_72fe" />
        {/* Subtle lavender wash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(var(--primary), 0.08) 0%, transparent 50%)' }}
          aria-hidden="true"
          data-icod-id="src_pages_signup_tsx_1dfc" />
        <div
          className="relative z-10 w-full max-w-md animate-fade-up-stagger"
          data-icod-id="src_pages_signup_tsx_625f">
          {/* Brand header */}
          <div className="mb-10 text-center" data-icod-id="src_pages_signup_tsx_734c">
            <Link
              to="/"
              className="inline-block group"
              data-icod-id="src_pages_signup_tsx_9c7e">
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_4px_16px_rgba(109,0,217,0.3)] transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 bg-primary"
                data-icod-id="src_pages_signup_tsx_6a95">
                <Zap
                  className="h-8 w-8 text-primary-foreground"
                  data-icod-id="src_pages_signup_tsx_638d" />
              </div>
            </Link>
            <h1
              className="font-heading text-2xl font-extrabold text-primary tracking-tight"
              data-icod-id="src_pages_signup_tsx_4eeb">
              Create Account
            </h1>
            <p
              className="mt-2 text-sm text-muted-foreground"
              data-icod-id="src_pages_signup_tsx_9628">
              Create your Visibility Intelligence account
            </p>
          </div>

          <Card
            className={cn('p-7 sm:p-9 shadow-[0_4px_24px_rgba(109,0,217,0.12)] border-border')}
            data-icod-id="src_pages_signup_tsx_ab13">
            {error && (
              <Alert
                variant="error"
                className="mb-6 animate-fade-up-stagger"
                data-icod-id="src_pages_signup_tsx_4737">
                {error}
              </Alert>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
              data-icod-id="src_pages_signup_tsx_42e1">
              <Field
                label="Full name"
                htmlFor="signup-name"
                error={fieldErrors.name}
                required
                data-icod-id="src_pages_signup_tsx_4524">
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  autoComplete="name"
                  autoFocus
                  className="transition-all duration-[300ms] focus:shadow-[0_0_0_3px_rgba(109,0,217,0.15)]"
                  data-icod-id="src_pages_signup_tsx_2602" />
              </Field>

              <Field
                label="Email address"
                htmlFor="signup-email"
                error={fieldErrors.email}
                required
                data-icod-id="src_pages_signup_tsx_8732">
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  autoComplete="email"
                  className="transition-all duration-[300ms] focus:shadow-[0_0_0_3px_rgba(109,0,217,0.15)]"
                  data-icod-id="src_pages_signup_tsx_e095" />
              </Field>

              <Field
                label="Password"
                htmlFor="signup-password"
                error={fieldErrors.password}
                required
                data-icod-id="src_pages_signup_tsx_a1a2">
                <div className="relative" data-icod-id="src_pages_signup_tsx_e80d">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    autoComplete="new-password"
                    className="pr-10 transition-all duration-[300ms] focus:shadow-[0_0_0_3px_rgba(109,0,217,0.15)]"
                    data-icod-id="src_pages_signup_tsx_1f46" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-[300ms]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    data-icod-id="src_pages_signup_tsx_5d6e">
                    {showPassword ? <EyeOff className="h-4 w-4" data-icod-id="src_pages_signup_tsx_9367" /> : <Eye className="h-4 w-4" data-icod-id="src_pages_signup_tsx_bc7b" />}
                  </button>
                </div>
              </Field>

              <Field
                label="Confirm password"
                htmlFor="signup-confirm-password"
                error={fieldErrors.confirmPassword}
                required
                data-icod-id="src_pages_signup_tsx_6012">
                <div className="relative" data-icod-id="src_pages_signup_tsx_dbf2">
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword)
                        setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    autoComplete="new-password"
                    className="pr-10 transition-all duration-[300ms] focus:shadow-[0_0_0_3px_rgba(109,0,217,0.15)]"
                    data-icod-id="src_pages_signup_tsx_d073" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-[300ms]"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    data-icod-id="src_pages_signup_tsx_157b">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" data-icod-id="src_pages_signup_tsx_ea5b" /> : <Eye className="h-4 w-4" data-icod-id="src_pages_signup_tsx_1c66" />}
                  </button>
                </div>
              </Field>

              <Button
                type="submit"
                loading={isLoading}
                className="w-full mt-3 shadow-[0_4px_16px_rgba(109,0,217,0.3)] hover:shadow-[0_6px_24px_rgba(109,0,217,0.4)]"
                data-icod-id="src_pages_signup_tsx_3c9d">
                Create Account
                {!isLoading && <UserPlus className="h-4 w-4 ml-2" data-icod-id="src_pages_signup_tsx_67bc" />}
              </Button>
            </form>
          </Card>

          {/* Link to login */}
          <div className="mt-6 text-center" data-icod-id="src_pages_signup_tsx_2eca">
            <p
              className="text-sm text-muted-foreground"
              data-icod-id="src_pages_signup_tsx_1345">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors duration-[300ms]"
                data-icod-id="src_pages_signup_tsx_52ed">
                Sign in
              </Link>
            </p>
          </div>

          {/* Back to home link */}
          <div className="mt-6 text-center" data-icod-id="src_pages_signup_tsx_020b">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-[300ms] inline-flex items-center gap-1"
              data-icod-id="src_pages_signup_tsx_9979">
              <ArrowRight className="h-3 w-3 rotate-180" data-icod-id="src_pages_signup_tsx_9d65" />
              Back to Home
            </Link>
          </div>

          <p
            className="mt-6 text-center text-xs text-muted-foreground"
            data-icod-id="src_pages_signup_tsx_e671">
            &copy; {new Date().getFullYear()} MG Blessed Beginnings. All rights reserved.
          </p>
        </div>
      </div>
    </>
  );
}
