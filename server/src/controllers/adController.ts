import type { Request, Response, NextFunction } from 'express';
import Ad from '../models/Ad';
import type { AuthRequest } from '../middleware/auth';

/** Base ad price in USD. All other currencies are derived from this using CURRENCY_RATES. */
const AD_BASE_PRICE_USD = 50;

/**
 * Exchange rates relative to USD (base price $50).
 * Manually maintained — NOT real-time market rates.
 * Rate = units of target currency per 1 USD.
 * Example: pkr: 278 → 1 USD ≈ 278 PKR → ad costs 50 × 278 = 13,900 PKR.
 */
const CURRENCY_RATES: Record<string, number> = {
  usd: 1,
  pkr: 278,
  gbp: 0.79,
  eur: 0.92,
  aed: 3.67,
  sar: 3.75,
  inr: 83,
  cad: 1.36,
  aud: 1.53,
};

/**
 * Create an ad — payment processing is currently disabled.
 */
export async function createAdCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(503).json({
      success: false,
      error: 'Payment processing is not currently configured. Please contact support.',
      statusCode: 503,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all active, non-expired ads. Public endpoint.
 */
export async function getActiveAds(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date();
    const ads = await Ad.find({
      status: 'active',
      expiresAt: { $gt: now },
    })
      .select('advertiserName title description imageUrl targetUrl brandColorPrimary brandColorSecondary purchasedAt expiresAt')
      .sort({ purchasedAt: -1 })
      .lean();

    res.json({ success: true, data: ads });
  } catch (err) {
    next(err);
  }
}

/**
 * Get ads belonging to the authenticated user. Protected endpoint.
 */
export async function getMyAds(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      res.status(401).json({ success: false, error: 'Not authenticated.', statusCode: 401 });
      return;
    }

    const ads = await Ad.find({ advertiserEmail: userEmail })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: ads });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: list all ads regardless of status.
 */
export async function adminListAds(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: ads });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: update ad status (approve, reject, expire).
 */
export async function adminUpdateAdStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'rejected', 'expired'].includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Status must be one of: active, rejected, expired.',
        statusCode: 400,
      });
      return;
    }

    const ad = await Ad.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    ).lean();

    if (!ad) {
      res.status(404).json({ success: false, error: 'Ad not found.', statusCode: 404 });
      return;
    }

    res.json({ success: true, data: ad });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: delete an ad permanently.
 */
export async function adminDeleteAd(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const ad = await Ad.findByIdAndDelete(id);

    if (!ad) {
      res.status(404).json({ success: false, error: 'Ad not found.', statusCode: 404 });
      return;
    }

    res.json({ success: true, message: 'Ad deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Verify an ad checkout session — payment processing is currently disabled.
 */
export async function verifyAdSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.status(503).json({
      success: false,
      error: 'Payment processing is not currently configured. Please contact support.',
      statusCode: 503,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Track an ad impression. Public endpoint.
 * Receives {adId, page} and increments impressions + pageViews atomically.
 */
export async function trackImpression(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { adId, page } = req.body;

    if (!adId || !page) {
      res.status(400).json({ success: false, error: 'adId and page are required.', statusCode: 400 });
      return;
    }

    // Normalize page path
    const normalizedPage = String(page).startsWith('/') ? String(page) : `/${page}`;

    // Atomically increment impressions and update pageViews map
    await Ad.findByIdAndUpdate(adId, {
      $inc: {
        impressions: 1,
        [`pageViews.${normalizedPage}`]: 1,
      },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

/**
 * Track an ad click. Public endpoint.
 * Receives {adId} and increments clicks atomically.
 */
export async function trackClick(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { adId } = req.body;

    if (!adId) {
      res.status(400).json({ success: false, error: 'adId is required.', statusCode: 400 });
      return;
    }

    await Ad.findByIdAndUpdate(adId, { $inc: { clicks: 1 } });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

/**
 * Get ad stats for the authenticated user's ads. Protected endpoint.
 * Returns all ads with their impression/click/pageView data plus calculated metrics.
 */
export async function getMyAdStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      res.status(401).json({ success: false, error: 'Not authenticated.', statusCode: 401 });
      return;
    }

    const ads = await Ad.find({ advertiserEmail: userEmail })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate aggregate stats
    let totalImpressions = 0;
    let totalClicks = 0;
    const pageAggregates: Record<string, number> = {};

    for (const ad of ads) {
      totalImpressions += ad.impressions || 0;
      totalClicks += ad.clicks || 0;

      // Aggregate page views across all ads
      if (ad.pageViews) {
        for (const [page, count] of Object.entries(ad.pageViews)) {
          pageAggregates[page] = (pageAggregates[page] || 0) + (count as number);
        }
      }
    }

    // Calculate CTR
    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

    // Sort pages by impression count (descending)
    const topPages = Object.entries(pageAggregates)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, impressions]) => ({ page, impressions }));

    // Calculate projected monthly impressions based on active ads
    const now = new Date();
    const activeAds = ads.filter((ad) => ad.status === 'active' && ad.expiresAt && new Date(ad.expiresAt) > now);

    // Calculate days remaining in current billing period (use earliest expiry or 30 days)
    let daysRemaining = 30;
    if (activeAds.length > 0) {
      const earliestExpiry = activeAds.reduce((min, ad) => {
        const expiry = ad.expiresAt ? new Date(ad.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return expiry < min ? expiry : min;
      }, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

      const diffMs = earliestExpiry.getTime() - now.getTime();
      daysRemaining = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
    }

    // Calculate daily average and project monthly
    const daysElapsed = activeAds.length > 0
      ? Math.max(1, Math.ceil((now.getTime() - new Date(activeAds[0].purchasedAt || activeAds[0].createdAt).getTime()) / (24 * 60 * 60 * 1000)))
      : 1;
    const dailyAverage = totalImpressions / daysElapsed;
    const projectedMonthly = Math.round(dailyAverage * 30);

    res.json({
      success: true,
      data: {
        ads,
        summary: {
          totalImpressions,
          totalClicks,
          ctr: parseFloat(ctr),
          daysRemaining,
          dailyAverage: Math.round(dailyAverage),
          projectedMonthly,
          topPages,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
