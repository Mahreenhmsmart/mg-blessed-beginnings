import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchServices } from '@/store/slices/servicesSlice';
import { createBooking, resetBooking } from '@/store/slices/consultationSlice';
import { Button, Input, Field, Card, Alert, Spinner, inputClass } from '@/components/ui';
import SEOHead from '@/components/SEOHead';
import LocalPaymentMethods from '@/components/LocalPaymentMethods';
import { Calendar, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { SchemaInjector, PAGE_META } from '@/seo';

const bookConsultationMeta = PAGE_META['/book-consultation'];

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
];

export default function BookConsultation() {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service');

  const dispatch = useAppDispatch();
  const { items: services, status: servicesStatus } = useAppSelector((state) => state.services);
  const { status: bookingStatus, error, booking } = useAppSelector((state) => state.consultation);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: preselectedService || '',
    preferredDate: '',
    preferredTime: '',
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (servicesStatus === 'idle') {
      dispatch(fetchServices());
    }
  }, [dispatch, servicesStatus]);

  // Auto-select pre-selected service from URL params when services load
  useEffect(() => {
    if (preselectedService && services.length > 0 && !formData.service) {
      // Try exact match first
      const exactMatch = services.find((s) => s.title === preselectedService);
      if (exactMatch) {
        setFormData((prev) => ({ ...prev, service: exactMatch.title }));
      } else {
        // Try partial/fuzzy match
        const partialMatch = services.find(
          (s) =>
            s.title.toLowerCase().includes(preselectedService.toLowerCase()) ||
            preselectedService.toLowerCase().includes(s.title.toLowerCase()),
        );
        if (partialMatch) {
          setFormData((prev) => ({ ...prev, service: partialMatch.title }));
        } else {
          // Keep the pre-selected value even if it doesn't match a DB service —
          // the user came from a specific service card and we should honor that
          setFormData((prev) => ({ ...prev, service: preselectedService }));
        }
      }
    }
  }, [preselectedService, services, formData.service]);

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.service;
      case 2:
        return !!formData.preferredDate && !!formData.preferredTime;
      case 3:
        return !!(
          formData.name.trim() &&
          formData.email.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
          formData.phone.trim()
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4));
    } else {
      // Mark all fields in current step as touched
      const fieldsToTouch = step === 1 ? ['service'] :
        step === 2 ? ['preferredDate', 'preferredTime'] :
        ['name', 'email', 'phone'];
      setTouched((prev) => ({
        ...prev,
        ...Object.fromEntries(fieldsToTouch.map((f) => [f, true])),
      }));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    await dispatch(createBooking(formData));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Reset on success
  useEffect(() => {
    if (bookingStatus === 'succeeded') {
      setStep(4);
    }
  }, [bookingStatus]);

  // Cleanup
  useEffect(() => {
    return () => {
      dispatch(resetBooking());
    };
  }, [dispatch]);

  if (bookingStatus === 'succeeded' || step === 4) {
    return (
      <>
        <SEOHead
          title={bookConsultationMeta.title}
          description={bookConsultationMeta.description}
          canonicalUrl={bookConsultationMeta.canonical}
          noindex
          data-icod-id="src_pages_bookconsultation_tsx_deb6" />
        <section
          className="min-h-[60vh] flex items-center justify-center bg-background py-20"
          data-icod-id="src_pages_bookconsultation_tsx_61f4">
          <div
            className="container mx-auto px-4 text-center max-w-lg"
            data-icod-id="src_pages_bookconsultation_tsx_98c9">
            <div
              className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"
              data-icod-id="src_pages_bookconsultation_tsx_22e1">
              <Check
                className="h-10 w-10 text-success"
                data-icod-id="src_pages_bookconsultation_tsx_91d2" />
            </div>
            <h1
              className="text-3xl font-bold text-foreground mb-4"
              data-icod-id="src_pages_bookconsultation_tsx_acbf">Booking Confirmed!</h1>
            <p
              className="text-muted-foreground mb-8"
              data-icod-id="src_pages_bookconsultation_tsx_ef81">
              Thank you for booking a consultation. We've received your request and will contact you at <strong data-icod-id="src_pages_bookconsultation_tsx_cef2">{booking?.email}</strong> to confirm the details.
            </p>
            <div
              className="bg-muted/50 rounded-lg p-6 mb-8 text-left"
              data-icod-id="src_pages_bookconsultation_tsx_7336">
              <h3
                className="font-semibold text-foreground mb-3"
                data-icod-id="src_pages_bookconsultation_tsx_7c42">Booking Summary:</h3>
              <dl
                className="space-y-2 text-sm"
                data-icod-id="src_pages_bookconsultation_tsx_961c">
                <div
                  className="flex justify-between"
                  data-icod-id="src_pages_bookconsultation_tsx_1c64">
                  <dt
                    className="text-muted-foreground"
                    data-icod-id="src_pages_bookconsultation_tsx_50e2">Service:</dt>
                  <dd
                    className="text-foreground"
                    data-icod-id="src_pages_bookconsultation_tsx_dbcc">{booking?.service}</dd>
                </div>
                <div
                  className="flex justify-between"
                  data-icod-id="src_pages_bookconsultation_tsx_e3b6">
                  <dt
                    className="text-muted-foreground"
                    data-icod-id="src_pages_bookconsultation_tsx_4ae8">Date:</dt>
                  <dd
                    className="text-foreground"
                    data-icod-id="src_pages_bookconsultation_tsx_04e9">
                    {new Date(booking?.preferredDate || '').toLocaleDateString()}
                  </dd>
                </div>
                <div
                  className="flex justify-between"
                  data-icod-id="src_pages_bookconsultation_tsx_cbf7">
                  <dt
                    className="text-muted-foreground"
                    data-icod-id="src_pages_bookconsultation_tsx_b236">Time:</dt>
                  <dd
                    className="text-foreground"
                    data-icod-id="src_pages_bookconsultation_tsx_6312">{booking?.preferredTime}</dd>
                </div>
              </dl>
            </div>
            <Link to="/" data-icod-id="src_pages_bookconsultation_tsx_b907">
              <Button
                variant="primary"
                size="lg"
                data-icod-id="src_pages_bookconsultation_tsx_ae76">
                Back to Home
              </Button>
            </Link>
          </div>
        </section>
        {/* Payment Methods — shown after successful quote submission */}
        <LocalPaymentMethods data-icod-id="src_pages_bookconsultation_tsx_payment_methods" />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={bookConsultationMeta.title}
        description={bookConsultationMeta.description}
        keywords={bookConsultationMeta.keywords}
        canonicalUrl={bookConsultationMeta.canonical}
        data-icod-id="src_pages_bookconsultation_tsx_1a4c" />
      {/* Hero */}
      <section
        className="bg-gradient-to-br from-primary/5 via-background to-accent/10 py-16"
        data-icod-id="src_pages_bookconsultation_tsx_0549">
        <div
          className="container mx-auto px-4 text-center"
          data-icod-id="src_pages_bookconsultation_tsx_fa12">
          <h1
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            data-icod-id="src_pages_bookconsultation_tsx_9d47">Book a Consultation</h1>
          <p
            className="text-lg text-muted-foreground max-w-xl mx-auto"
            data-icod-id="src_pages_bookconsultation_tsx_3a29">
            Schedule a session to discuss your e-commerce goals and get personalized recommendations.
          </p>
        </div>
      </section>
      {/* AEO Direct Answer Section */}
      <section className="max-w-4xl mx-auto px-4 py-8" data-icod-id="src_pages_bookconsultation_tsx_aeo_section">
        <h2 className="text-xl font-bold text-foreground mb-3 text-center" data-icod-id="src_pages_bookconsultation_tsx_aeo_h2">How does consultation booking work?</h2>
        <p className="text-muted-foreground leading-relaxed text-center" data-icod-id="src_pages_bookconsultation_tsx_aeo_p">
          Choose a service from our catalog, pick your preferred date and time slot, provide your contact details, and submit your booking request. We review every submission personally and confirm your appointment via email within 24 hours. Consultations are conducted via video call, phone, or WhatsApp based on your preference.
        </p>
      </section>
      <section
        className="py-12 bg-background"
        data-icod-id="src_pages_bookconsultation_tsx_0bda">
        <div
          className="container mx-auto px-4"
          data-icod-id="src_pages_bookconsultation_tsx_97da">
          <div
            className="max-w-2xl mx-auto"
            data-icod-id="src_pages_bookconsultation_tsx_bc8a">
            {/* Progress Steps */}
            <div
              className="flex items-center justify-between mb-12"
              data-icod-id="src_pages_bookconsultation_tsx_43bd">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className="flex items-center"
                  data-icod-id={`src_pages_bookconsultation_tsx_732b_${s}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-[250ms] ${
                      step >= s
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground'
                    }`}
                    data-icod-id={`src_pages_bookconsultation_tsx_4244_${s}`}>
                    {step > s ? <Check
                      className="h-5 w-5"
                      data-icod-id={`src_pages_bookconsultation_tsx_cb08_${s}`} /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`w-16 md:w-24 h-1 mx-2 rounded-full transition-colors duration-[250ms] ${
                        step > s ? 'bg-primary' : 'bg-muted'
                      }`}
                      data-icod-id={`src_pages_bookconsultation_tsx_342c_${s}`} />
                  )}
                </div>
              ))}
            </div>

            <Card className="p-8 shadow-[var(--shadow-md)]" data-icod-id="src_pages_bookconsultation_tsx_a552">
              {/* Step 1: Select Service */}
              {step === 1 && (
                <div className="space-y-6" data-icod-id="src_pages_bookconsultation_tsx_df00">
                  <h2
                    className="text-xl font-semibold text-foreground"
                    data-icod-id="src_pages_bookconsultation_tsx_aecf">Select a Service</h2>

                  {servicesStatus === 'loading' ? (
                    <div
                      className="flex justify-center py-8"
                      data-icod-id="src_pages_bookconsultation_tsx_7e50">
                      <Spinner size="md" data-icod-id="src_pages_bookconsultation_tsx_f250" />
                    </div>
                  ) : (
                    <div className="space-y-3" data-icod-id="src_pages_bookconsultation_tsx_254b">
                      {/* Show pre-selected service from URL if it doesn't match any DB service */}
                      {preselectedService && !services.some((s) => s.title === preselectedService) && (
                        <label
                          className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-[250ms] ${
                            formData.service === preselectedService
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
                          }`}
                          data-icod-id="src_pages_bookconsultation_tsx_preselected">
                          <input
                            type="radio"
                            name="service"
                            value={preselectedService}
                            checked={formData.service === preselectedService}
                            onChange={(e) => handleChange('service', e.target.value)}
                            className="mt-1"
                            data-icod-id="src_pages_bookconsultation_tsx_preselected_radio" />
                          <div className="flex-1" data-icod-id="src_pages_bookconsultation_tsx_preselected_content">
                            <div className="font-medium text-foreground" data-icod-id="src_pages_bookconsultation_tsx_preselected_title">
                              {preselectedService}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1" data-icod-id="src_pages_bookconsultation_tsx_preselected_desc">
                              Selected from services page
                            </div>
                          </div>
                        </label>
                      )}
                      {services.map((service) => (
                        <label
                          key={service._id}
                          className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-[250ms] ${
                            formData.service === service.title
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
                          }`}
                          data-icod-id={`src_pages_bookconsultation_tsx_ef45_${service._id}`}>
                          <input
                            type="radio"
                            name="service"
                            value={service.title}
                            checked={formData.service === service.title}
                            onChange={(e) => handleChange('service', e.target.value)}
                            className="mt-1"
                            data-icod-id={`src_pages_bookconsultation_tsx_c0a8_${service._id}`} />
                          <div
                            className="flex-1"
                            data-icod-id={`src_pages_bookconsultation_tsx_2041_${service._id}`}>
                            <div
                              className="font-medium text-foreground"
                              data-icod-id={`src_pages_bookconsultation_tsx_36a9_${service._id}`}>{service.title}</div>
                            <div
                              className="text-sm text-muted-foreground mt-1"
                              data-icod-id={`src_pages_bookconsultation_tsx_d699_${service._id}`}>
                              {service.price} · {service.duration}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {touched.service && !formData.service && (
                    <Alert variant="error" data-icod-id="src_pages_bookconsultation_tsx_9651">Please select a service</Alert>
                  )}
                </div>
              )}

              {/* Step 2: Choose Date & Time */}
              {step === 2 && (
                <div className="space-y-6" data-icod-id="src_pages_bookconsultation_tsx_543e">
                  <h2
                    className="text-xl font-semibold text-foreground"
                    data-icod-id="src_pages_bookconsultation_tsx_eed6">Choose Date & Time</h2>

                  <Field
                    label="Preferred Date"
                    required
                    data-icod-id="src_pages_bookconsultation_tsx_1832">
                    <Input
                      type="date"
                      min={today}
                      value={formData.preferredDate}
                      onChange={(e) => handleChange('preferredDate', e.target.value)}
                      data-icod-id="src_pages_bookconsultation_tsx_302d" />
                  </Field>

                  <div data-icod-id="src_pages_bookconsultation_tsx_fa00">
                    <label
                      className="block text-sm font-medium text-foreground mb-3"
                      data-icod-id="src_pages_bookconsultation_tsx_868f">
                      Preferred Time <span
                      className="text-destructive"
                      data-icod-id="src_pages_bookconsultation_tsx_adc4">*</span>
                    </label>
                    <div
                      className="grid grid-cols-2 md:grid-cols-4 gap-3"
                      data-icod-id="src_pages_bookconsultation_tsx_6388">
                      {TIME_SLOTS.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => handleChange('preferredTime', time)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all duration-[250ms] ${
                            formData.preferredTime === time
                              ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                              : 'border-border/60 hover:border-primary/40 hover:bg-muted/30 text-foreground'
                          }`}
                          data-icod-id={`src_pages_bookconsultation_tsx_0f1e_${time}`}>
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {touched.preferredTime && !formData.preferredTime && (
                    <Alert variant="error" data-icod-id="src_pages_bookconsultation_tsx_469d">Please select a time slot</Alert>
                  )}
                </div>
              )}

              {/* Step 3: Your Details */}
              {step === 3 && (
                <div className="space-y-6" data-icod-id="src_pages_bookconsultation_tsx_9c63">
                  <h2
                    className="text-xl font-semibold text-foreground"
                    data-icod-id="src_pages_bookconsultation_tsx_c3f8">Your Details</h2>

                  <Field
                    label="Full Name"
                    htmlFor="booking-name"
                    required
                    data-icod-id="src_pages_bookconsultation_tsx_6320">
                    <Input
                      id="booking-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                      placeholder="John Doe"
                      data-icod-id="src_pages_bookconsultation_tsx_bd56" />
                  </Field>

                  <Field
                    label="Email Address"
                    htmlFor="booking-email"
                    required
                    data-icod-id="src_pages_bookconsultation_tsx_8516">
                    <Input
                      id="booking-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                      placeholder="john@example.com"
                      data-icod-id="src_pages_bookconsultation_tsx_e9fc" />
                  </Field>

                  <Field
                    label="Phone Number"
                    htmlFor="booking-phone"
                    required
                    data-icod-id="src_pages_bookconsultation_tsx_8123">
                    <Input
                      id="booking-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                      placeholder="+1 234 567 8900"
                      data-icod-id="src_pages_bookconsultation_tsx_cadf" />
                  </Field>

                  <Field
                    label="Additional Message (Optional)"
                    htmlFor="booking-message"
                    data-icod-id="src_pages_bookconsultation_tsx_8055">
                    <textarea
                      id="booking-message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Tell us about your specific needs..."
                      rows={4}
                      className={inputClass('min-h-[100px] resize-none')}
                      data-icod-id="src_pages_bookconsultation_tsx_9759" />
                  </Field>

                  {error && <Alert variant="error" data-icod-id="src_pages_bookconsultation_tsx_1abf">{error}</Alert>}
                </div>
              )}

              {/* Navigation Buttons */}
              <div
                className="flex items-center justify-between mt-8 pt-6 border-t border-border"
                data-icod-id="src_pages_bookconsultation_tsx_5e1a">
                {step > 1 ? (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    data-icod-id="src_pages_bookconsultation_tsx_180f">
                    <ChevronLeft
                      className="h-4 w-4 mr-2"
                      data-icod-id="src_pages_bookconsultation_tsx_589f" />
                    Back
                  </Button>
                ) : (
                  <div data-icod-id="src_pages_bookconsultation_tsx_b853" />
                )}

                {step < 3 ? (
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    data-icod-id="src_pages_bookconsultation_tsx_65b1">
                    Next
                    <ChevronRight
                      className="h-4 w-4 ml-2"
                      data-icod-id="src_pages_bookconsultation_tsx_2437" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    loading={bookingStatus === 'loading'}
                    disabled={bookingStatus === 'loading'}
                    data-icod-id="src_pages_bookconsultation_tsx_f48e">
                    Confirm Booking
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
