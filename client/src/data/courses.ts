import { GraduationCap, Palette, Megaphone, ShoppingCart, Video, Package, Globe, Youtube, Sparkles, UserCircle } from 'lucide-react';
import type { CoursePriceData } from '@/hooks/useCurrencyFormatter';

export interface CourseData {
  title: string;
  description: string;
  tags: string[];
  price: CoursePriceData;
  icon: React.ElementType;
  gradient: string;
  badge?: string;
  thumbnail?: string;
}

/**
 * All 10 courses with exact prices as specified.
 * Base prices are in PKR; USD is included where both currencies were provided.
 */
export const COURSES: CourseData[] = [
  {
    title: 'AI Advance',
    description: 'A comprehensive course on advanced AI tools and techniques.',
    tags: [],
    price: { pkr: 20000 },
    icon: GraduationCap,
    gradient: 'linear-gradient(135deg, rgb(var(--primary)) 0%, rgb(var(--accent)) 100%)',
    badge: 'Currently Running',
    thumbnail: 'https://drive.google.com/thumbnail?id=1Tk2BY-aMZHZBuEfT60LvhXdUrYbDD9Ty&sz=w1920',
  },
  {
    title: 'Graphic Designing',
    description: 'Master visual communication and create stunning designs using industry-standard tools. Learn branding, logo design, social media graphics, and build a professional portfolio.',
    tags: ['Canva', 'Adobe Photoshop', 'Adobe Illustrator', 'Logo & Brand Identity Design'],
    price: { pkr: 7000, usd: 25 },
    icon: Palette,
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
    thumbnail: 'https://drive.google.com/thumbnail?id=1gna3vgH_GbECQ2AyGBo1RJ8TfVqBFa3u&sz=w1920',
  },
  {
    title: 'Social Media Marketing & Management',
    description: 'Build powerful social media marketing strategies and manage campaigns across platforms. Master content planning, analytics, and audience growth techniques.',
    tags: ['Facebook & Instagram Marketing', 'Meta Business Suite', 'Content Planning & Strategy', 'Social Media Management'],
    price: { pkr: 15000, usd: 54 },
    icon: Megaphone,
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    thumbnail: 'https://drive.google.com/thumbnail?id=16iUAyQtSfJsc8Lwh3uAwWv1J4E_tfMrD&sz=w1920',
  },
  {
    title: 'E-Commerce & Shopify Store Development',
    description: 'Launch and scale profitable online stores with Shopify. Master store setup, product research, listing optimization, and conversion strategies.',
    tags: ['Shopify Store Setup', 'Store Design & Customization', 'Product Research & Hunting', 'Product Listing'],
    price: { pkr: 20000 },
    icon: ShoppingCart,
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    thumbnail: 'https://drive.google.com/thumbnail?id=1UHwOPcPQmi158da9Fz1sZ-twBXUycSzR&sz=w1920',
  },
  {
    title: 'Video Editing',
    description: 'Create professional video content for social media and beyond. Master editing techniques, motion graphics, color grading, and produce engaging reels, shorts, and long-form videos.',
    tags: ['CapCut', 'Adobe Premiere Pro', 'Adobe After Effects', 'Reels & Shorts Editing'],
    price: { pkr: 15000 },
    icon: Video,
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)',
    thumbnail: 'https://drive.google.com/thumbnail?id=1SmSWRjWJYetas2DGu-MvFgk7TiWG08qy&sz=w1920',
  },
  {
    title: 'eBay',
    description: 'A complete course on building a profitable eBay selling business.',
    tags: [],
    price: { pkr: 30000 },
    icon: Package,
    gradient: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)',
    thumbnail: 'https://drive.google.com/thumbnail?id=1y7vuTbCYjc19vYcp6SUD4GR2rXeMeL6o&sz=w1920',
  },
  {
    title: 'Amazon',
    description: 'A complete course on mastering Amazon selling and e-commerce strategies.',
    tags: [],
    price: { pkr: 40000 },
    icon: Globe,
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    thumbnail: 'https://drive.google.com/thumbnail?id=1LR3RcUMtSyJTuEXetIPoKMC83lO47EfU&sz=w1920',
  },
  {
    title: 'YouTube',
    description: 'A complete course on creating, growing, and monetizing a YouTube channel.',
    tags: [],
    price: {
      pkr: 20000,
      secondaryPkr: 10000,
      primaryLabel: 'Full course',
      secondaryLabel: 'Recorded lectures',
    },
    icon: Youtube,
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    thumbnail: 'https://drive.google.com/thumbnail?id=12Ph2xSmCDlHmpO8z_VwxFt97LH8YGHn7&sz=w1920',
  },
  {
    title: 'Personal Branding',
    description: 'A course on building and leveraging your personal brand effectively.',
    tags: [],
    price: { pkr: 15000 },
    icon: UserCircle,
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    thumbnail: 'https://drive.google.com/thumbnail?id=10zJjP4hMWDYEMCFppYh1onSw6tCq8ffx&sz=w1920',
  },
  {
    title: 'Muse AI',
    description: 'A course on harnessing Muse AI for creative and productive workflows.',
    tags: [],
    price: { pkr: 15000 },
    icon: Sparkles,
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    thumbnail: 'https://drive.google.com/thumbnail?id=15MfRIvuK-ripJ4oTSW7QPvmqpt-MOL-6&sz=w1920',
  },
];
