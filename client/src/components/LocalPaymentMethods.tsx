import { Card, CopyButton } from '@/components/ui';
import { cn } from '@/utils/cn';
import { CreditCard, Smartphone, MessageCircle } from 'lucide-react';

interface LocalPaymentMethodsProps {
  className?: string;
}

interface PaymentMethod {
  name: string;
  accountTitle: string;
  accountNumber?: string;
  iban?: string;
  phoneNumber?: string;
  icon: typeof CreditCard | typeof Smartphone;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    name: 'MCB Bank',
    accountTitle: 'Mahreen Yousaf',
    accountNumber: '0918728651004185',
    iban: 'PK77MUCB0918728651004185',
    icon: CreditCard,
  },
  {
    name: 'JazzCash',
    accountTitle: 'Mahreen Yousaf',
    phoneNumber: '03021143129',
    icon: Smartphone,
  },
  {
    name: 'SadaPay',
    accountTitle: 'Mahreen Yousaf',
    phoneNumber: '03021143129',
    icon: Smartphone,
  },
  {
    name: 'NayaPay',
    accountTitle: 'Mahreen Yousaf',
    phoneNumber: '03021143129',
    icon: Smartphone,
  },
];

export default function LocalPaymentMethods({ className }: LocalPaymentMethodsProps) {
  return (
    <section
      className={cn('py-16 md:py-20 bg-background relative', className)}
      data-icod-id="src_components_localpaymentmethods_tsx_section">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        data-icod-id="src_components_localpaymentmethods_tsx_container">
        {/* Section header */}
        <div
          className="text-center mb-10"
          data-icod-id="src_components_localpaymentmethods_tsx_header">
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground mb-3 font-heading"
            data-icod-id="src_components_localpaymentmethods_tsx_title">
            How to Pay — Local Pakistani Payment Methods
          </h2>
          <p
            className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto"
            data-icod-id="src_components_localpaymentmethods_tsx_subtitle">
            Prefer direct payment over Gumroad? Use any of these local payment options.
          </p>
        </div>

        {/* Payment methods grid */}
        <div
          className="grid gap-4 md:grid-cols-2"
          data-icod-id="src_components_localpaymentmethods_tsx_grid">
          {PAYMENT_METHODS.map((method) => (
            <Card
              key={method.name}
              hoverLift={false}
              className="p-6 border-border/80"
              data-icod-id={`src_components_localpaymentmethods_tsx_card_${method.name.toLowerCase()}`}>
              <div
                className="flex items-start gap-4"
                data-icod-id={`src_components_localpaymentmethods_tsx_content_${method.name.toLowerCase()}`}>
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20"
                  data-icod-id={`src_components_localpaymentmethods_tsx_icon_wrap_${method.name.toLowerCase()}`}>
                  <method.icon
                    className="h-6 w-6 text-primary"
                    data-icod-id={`src_components_localpaymentmethods_tsx_icon_${method.name.toLowerCase()}`} />
                </div>
                <div className="flex-1 min-w-0" data-icod-id={`src_components_localpaymentmethods_tsx_details_${method.name.toLowerCase()}`}>
                  <h3
                    className="text-lg font-semibold text-foreground mb-1"
                    data-icod-id={`src_components_localpaymentmethods_tsx_name_${method.name.toLowerCase()}`}>
                    {method.name}
                  </h3>
                  <p
                    className="text-sm text-muted-foreground mb-3"
                    data-icod-id={`src_components_localpaymentmethods_tsx_account_title_${method.name.toLowerCase()}`}>
                    Account Title: {method.accountTitle}
                  </p>

                  {/* Bank-specific fields */}
                  {method.accountNumber && (
                    <div
                      className="mb-2"
                      data-icod-id={`src_components_localpaymentmethods_tsx_account_row_${method.name.toLowerCase()}`}>
                      <p className="text-xs text-muted-foreground mb-0.5" data-icod-id={`src_components_localpaymentmethods_tsx_account_label_${method.name.toLowerCase()}`}>
                        Account Number
                      </p>
                      <div className="flex items-center gap-2" data-icod-id={`src_components_localpaymentmethods_tsx_account_value_row_${method.name.toLowerCase()}`}>
                        <code
                          className="text-sm bg-muted px-2 py-1 rounded font-mono text-foreground"
                          data-icod-id={`src_components_localpaymentmethods_tsx_account_code_${method.name.toLowerCase()}`}>
                          {method.accountNumber}
                        </code>
                        <CopyButton
                          text={method.accountNumber}
                          label="Copy"
                          className="shrink-0"
                          data-icod-id={`src_components_localpaymentmethods_tsx_copy_account_${method.name.toLowerCase()}`} />
                      </div>
                    </div>
                  )}

                  {method.iban && (
                    <div
                      className="mb-2"
                      data-icod-id={`src_components_localpaymentmethods_tsx_iban_row_${method.name.toLowerCase()}`}>
                      <p className="text-xs text-muted-foreground mb-0.5" data-icod-id={`src_components_localpaymentmethods_tsx_iban_label_${method.name.toLowerCase()}`}>
                        IBAN
                      </p>
                      <div className="flex items-center gap-2" data-icod-id={`src_components_localpaymentmethods_tsx_iban_value_row_${method.name.toLowerCase()}`}>
                        <code
                          className="text-sm bg-muted px-2 py-1 rounded font-mono text-foreground"
                          data-icod-id={`src_components_localpaymentmethods_tsx_iban_code_${method.name.toLowerCase()}`}>
                          {method.iban}
                        </code>
                        <CopyButton
                          text={method.iban}
                          label="Copy"
                          className="shrink-0"
                          data-icod-id={`src_components_localpaymentmethods_tsx_copy_iban_${method.name.toLowerCase()}`} />
                      </div>
                    </div>
                  )}

                  {/* Phone number for mobile wallets */}
                  {method.phoneNumber && (
                    <div
                      data-icod-id={`src_components_localpaymentmethods_tsx_phone_row_${method.name.toLowerCase()}`}>
                      <p className="text-xs text-muted-foreground mb-0.5" data-icod-id={`src_components_localpaymentmethods_tsx_phone_label_${method.name.toLowerCase()}`}>
                        Phone Number
                      </p>
                      <div className="flex items-center gap-2" data-icod-id={`src_components_localpaymentmethods_tsx_phone_value_row_${method.name.toLowerCase()}`}>
                        <code
                          className="text-sm bg-muted px-2 py-1 rounded font-mono text-foreground"
                          data-icod-id={`src_components_localpaymentmethods_tsx_phone_code_${method.name.toLowerCase()}`}>
                          {method.phoneNumber}
                        </code>
                        <CopyButton
                          text={method.phoneNumber}
                          label="Copy"
                          className="shrink-0"
                          data-icod-id={`src_components_localpaymentmethods_tsx_copy_phone_${method.name.toLowerCase()}`} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* WhatsApp instruction */}
        <div
          className="mt-8 p-6 rounded-2xl bg-accent/10 border border-accent/20"
          data-icod-id="src_components_localpaymentmethods_tsx_whatsapp_box">
          <div
            className="flex items-start gap-4"
            data-icod-id="src_components_localpaymentmethods_tsx_whatsapp_content">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/20 ring-1 ring-accent/30"
              data-icod-id="src_components_localpaymentmethods_tsx_whatsapp_icon_wrap">
              <MessageCircle
                className="h-6 w-6 text-accent"
                data-icod-id="src_components_localpaymentmethods_tsx_whatsapp_icon" />
            </div>
            <div data-icod-id="src_components_localpaymentmethods_tsx_whatsapp_text">
              <h3
                className="text-lg font-semibold text-foreground mb-2"
                data-icod-id="src_components_localpaymentmethods_tsx_whatsapp_title">
                After Payment
              </h3>
              <p
                className="text-muted-foreground leading-relaxed"
                data-icod-id="src_components_localpaymentmethods_tsx_whatsapp_instruction">
                After payment, send the payment screenshot on WhatsApp{' '}
                <span className="inline-flex items-center gap-1.5" data-icod-id="src_components_localpaymentmethods_tsx_whatsapp_number_wrap">
                  <code
                    className="text-sm bg-muted px-2 py-0.5 rounded font-mono text-foreground"
                    data-icod-id="src_components_localpaymentmethods_tsx_whatsapp_number">
                    +92 335 8380233
                  </code>
                  <CopyButton
                    text="+92 335 8380233"
                    label="Copy"
                    className="shrink-0"
                    data-icod-id="src_components_localpaymentmethods_tsx_copy_whatsapp" />
                </span>{' '}
                and receive the product.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
