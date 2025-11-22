import { prisma } from '@/lib/prisma';
import { log } from '@/lib/logger';
import crypto from 'crypto';

// Coupon types
export type CouponType = 'percentage' | 'fixed' | 'trial';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number; // percentage (0-100) or fixed amount
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number;
  usedCount: number;
  applicablePlans?: string[];
  active: boolean;
  createdAt: Date;
}

export interface CouponValidation {
  valid: boolean;
  error?: string;
  discount?: number;
  finalPrice?: number;
}

// Default coupons (in production, store in database)
const COUPONS: Map<string, Coupon> = new Map([
  ['WELCOME10', {
    id: 'cpn_welcome10',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    usageLimit: 1000,
    usedCount: 0,
    active: true,
    createdAt: new Date(),
  }],
  ['FIRSTMONTH', {
    id: 'cpn_firstmonth',
    code: 'FIRSTMONTH',
    type: 'fixed',
    value: 5000,
    minPurchase: 10000,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    usageLimit: 500,
    usedCount: 0,
    active: true,
    createdAt: new Date(),
  }],
  ['PRO30', {
    id: 'cpn_pro30',
    code: 'PRO30',
    type: 'percentage',
    value: 30,
    maxDiscount: 10000,
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    applicablePlans: ['pro', 'yearly_pro'],
    usageLimit: 100,
    usedCount: 0,
    active: true,
    createdAt: new Date(),
  }],
  ['FREETRIAL', {
    id: 'cpn_freetrial',
    code: 'FREETRIAL',
    type: 'trial',
    value: 7, // 7 days free trial
    validFrom: new Date('2024-01-01'),
    validUntil: new Date('2025-12-31'),
    usageLimit: 1000,
    usedCount: 0,
    active: true,
    createdAt: new Date(),
  }],
]);

/**
 * Validate and apply coupon
 */
export async function validateCoupon(
  code: string,
  originalPrice: number,
  planId?: string,
  userId?: string
): Promise<CouponValidation> {
  const coupon = COUPONS.get(code.toUpperCase());

  if (!coupon) {
    return { valid: false, error: '유효하지 않은 쿠폰 코드입니다.' };
  }

  // Check if active
  if (!coupon.active) {
    return { valid: false, error: '비활성화된 쿠폰입니다.' };
  }

  // Check date validity
  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return { valid: false, error: '쿠폰 유효 기간이 아닙니다.' };
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: '쿠폰 사용 횟수가 초과되었습니다.' };
  }

  // Check minimum purchase
  if (coupon.minPurchase && originalPrice < coupon.minPurchase) {
    return {
      valid: false,
      error: `최소 주문 금액은 ${coupon.minPurchase.toLocaleString()}원입니다.`
    };
  }

  // Check applicable plans
  if (coupon.applicablePlans && planId) {
    if (!coupon.applicablePlans.includes(planId)) {
      return { valid: false, error: '이 플랜에는 적용할 수 없는 쿠폰입니다.' };
    }
  }

  // Check if user already used this coupon (in production, query database)
  // For now, skip this check

  // Calculate discount
  let discount = 0;

  switch (coupon.type) {
    case 'percentage':
      discount = Math.floor(originalPrice * (coupon.value / 100));
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
      break;

    case 'fixed':
      discount = coupon.value;
      break;

    case 'trial':
      // Trial coupons don't have a monetary discount
      discount = 0;
      break;
  }

  const finalPrice = Math.max(0, originalPrice - discount);

  log.info('Coupon validated', {
    code,
    originalPrice,
    discount,
    finalPrice,
    userId,
  });

  return {
    valid: true,
    discount,
    finalPrice,
  };
}

/**
 * Apply coupon (increment usage count)
 */
export async function applyCoupon(
  code: string,
  userId: string,
  orderId: string
): Promise<void> {
  const coupon = COUPONS.get(code.toUpperCase());

  if (coupon) {
    coupon.usedCount++;

    log.info('Coupon applied', {
      code,
      userId,
      orderId,
      usedCount: coupon.usedCount,
    });
  }
}

/**
 * Generate unique coupon code
 */
export function generateCouponCode(prefix: string = ''): string {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}${random}`;
}

/**
 * Create a new coupon
 */
export async function createCoupon(
  data: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>
): Promise<Coupon> {
  const coupon: Coupon = {
    ...data,
    id: `cpn_${crypto.randomBytes(8).toString('hex')}`,
    usedCount: 0,
    createdAt: new Date(),
  };

  COUPONS.set(coupon.code, coupon);

  log.info('Coupon created', { code: coupon.code, type: coupon.type });

  return coupon;
}

/**
 * Get all coupons
 */
export function getAllCoupons(): Coupon[] {
  return Array.from(COUPONS.values());
}

/**
 * Get coupon by code
 */
export function getCoupon(code: string): Coupon | undefined {
  return COUPONS.get(code.toUpperCase());
}

/**
 * Deactivate coupon
 */
export function deactivateCoupon(code: string): boolean {
  const coupon = COUPONS.get(code.toUpperCase());
  if (coupon) {
    coupon.active = false;
    log.info('Coupon deactivated', { code });
    return true;
  }
  return false;
}
