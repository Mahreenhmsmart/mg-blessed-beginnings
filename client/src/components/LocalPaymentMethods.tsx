import { useState } from 'react';
import { CreditCard, Smartphone, MessageCircle, Copy, Check } from 'lucide-react';

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
  brandColor: string;
  brandColorEnd: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    name: 'MCB Bank',
    accountTitle: 'Mahreen Yousaf',
    accountNumber: '0918728651004185',
    iban: 'PK77MUCB0918728651004185',
    icon: CreditCard,
    brandColor: '#0E7A3D',
    brandColorEnd: '#34C759',
  },
  {
    name: 'JazzCash',
    accountTitle: 'Mahreen Yousaf',
    phoneNumber: '03021143129',
    icon: Smartphone,
    brandColor: '#E4002B',
    brandColorEnd: '#FF6B35',
  },
  {
    name: 'SadaPay',
    accountTitle: 'Mahreen Yousaf',
    phoneNumber: '03021143129',
    icon: Smartphone,
    brandColor: '#00C389',
    brandColorEnd: '#00E5A0',
  },
  {
    name: 'NayaPay',
    accountTitle: 'Mahreen Yousaf',
    phoneNumber: '03021143129',
    icon: Smartphone,
    brandColor: '#6C5CE7',
    brandColorEnd: '#00D4F5',
  },
];

export default function LocalPaymentMethods({ className }: LocalPaymentMethodsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <section
      className={`how-to-pay ${className || ''}`}
      data-icod-id="src_components_localpaymentmethods_tsx_0621">
      <h2
        className="how-to-pay-title"
        data-icod-id="src_components_localpaymentmethods_tsx_0897">How to Pay</h2>
      <p
        className="how-to-pay-sub"
        data-icod-id="src_components_localpaymentmethods_tsx_8e95">Choose your preferred local payment method below</p>
      <div
        className="pay-grid"
        data-icod-id="src_components_localpaymentmethods_tsx_e048">
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method.name}
            className="pay-card"
            style={{ '--brand': method.brandColor, '--brand2': method.brandColorEnd } as React.CSSProperties}
            data-icod-id={`src_components_localpaymentmethods_tsx_a788_${method.name}`}>
            <div
              className="pay-icon"
              style={{ background: `linear-gradient(135deg, ${method.brandColor}, ${method.brandColorEnd})` }}
              data-icod-id={`src_components_localpaymentmethods_tsx_6738_${method.name}`}>
              <method.icon className="w-6 h-6 text-white" />
            </div>
            <h3
              data-icod-id={`src_components_localpaymentmethods_tsx_390a_${method.name}`}>{method.name}</h3>
            <p
              className="pay-title"
              data-icod-id={`src_components_localpaymentmethods_tsx_6155_${method.name}`}>Account Title: {method.accountTitle}</p>

            {method.accountNumber && (
              <div
                className="pay-field"
                data-icod-id={`src_components_localpaymentmethods_tsx_43fa_${method.name}`}>
                <code
                  data-icod-id={`src_components_localpaymentmethods_tsx_c86e_${method.name}`}>{method.accountNumber}</code>
                <button
                  onClick={() => handleCopy(method.accountNumber!, `${method.name}-account`)}
                  data-icod-id={`src_components_localpaymentmethods_tsx_7a08_${method.name}`}>
                  {copied === `${method.name}-account` ? 'Copied ✓' : <Copy
                    className="w-4 h-4"
                    data-icod-id={`src_components_localpaymentmethods_tsx_0cb5_${method.name}`} />}
                </button>
              </div>
            )}

            {method.iban && (
              <div
                className="pay-field"
                data-icod-id={`src_components_localpaymentmethods_tsx_59ce_${method.name}`}>
                <code
                  data-icod-id={`src_components_localpaymentmethods_tsx_8d59_${method.name}`}>{method.iban}</code>
                <button
                  onClick={() => handleCopy(method.iban!, `${method.name}-iban`)}
                  data-icod-id={`src_components_localpaymentmethods_tsx_00d9_${method.name}`}>
                  {copied === `${method.name}-iban` ? 'Copied ✓' : <Copy
                    className="w-4 h-4"
                    data-icod-id={`src_components_localpaymentmethods_tsx_a014_${method.name}`} />}
                </button>
              </div>
            )}

            {method.phoneNumber && (
              <div
                className="pay-field"
                data-icod-id={`src_components_localpaymentmethods_tsx_145f_${method.name}`}>
                <code
                  data-icod-id={`src_components_localpaymentmethods_tsx_1909_${method.name}`}>{method.phoneNumber}</code>
                <button
                  onClick={() => handleCopy(method.phoneNumber!, `${method.name}-phone`)}
                  data-icod-id={`src_components_localpaymentmethods_tsx_c9a0_${method.name}`}>
                  {copied === `${method.name}-phone` ? 'Copied ✓' : <Copy
                    className="w-4 h-4"
                    data-icod-id={`src_components_localpaymentmethods_tsx_abca_${method.name}`} />}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div
        className="pay-after"
        data-icod-id="src_components_localpaymentmethods_tsx_d41c">
        <div
          className="pay-icon"
          style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
          data-icod-id="src_components_localpaymentmethods_tsx_b27b">
          <MessageCircle
            className="w-6 h-6 text-white"
            data-icod-id="src_components_localpaymentmethods_tsx_eafc" />
        </div>
        <div
          style={{ flex: 1 }}
          data-icod-id="src_components_localpaymentmethods_tsx_b126">
          <h3 data-icod-id="src_components_localpaymentmethods_tsx_8d35">After Payment</h3>
          <p data-icod-id="src_components_localpaymentmethods_tsx_66b9">
            Send payment screenshot on WhatsApp{' '}
            <code
              style={{ background: '#0A0C14', padding: '4px 8px', borderRadius: '6px' }}
              data-icod-id="src_components_localpaymentmethods_tsx_388a">
              +92 335 8380233
            </code>{' '}
            to receive your product instantly.
          </p>
          <button
            onClick={() => handleCopy('+92 335 8380233', 'whatsapp')}
            style={{ marginTop: '12px' }}
            data-icod-id="src_components_localpaymentmethods_tsx_6db6">
            {copied === 'whatsapp' ? 'Copied ✓' : <><Copy
              className="w-4 h-4 inline mr-1"
              data-icod-id="src_components_localpaymentmethods_tsx_ec02" /> Copy Number</>}
          </button>
        </div>
      </div>
    </section>
  );
}
