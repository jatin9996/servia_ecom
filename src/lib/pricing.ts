export const FREE_SHIPPING_AT = 499;
export const SHIPPING_FEE = 49;
export const POINTS_EARN_RATE = 0.05;
export const MAX_POINTS_SHARE = 0.3;
export const GST_RATE = 0.18;

export type CouponRule = {
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrder: number;
};

export function inr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function shippingFor(merchandise: number) {
  if (merchandise <= 0) return 0;
  return merchandise >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;
}

export function couponDiscount(subtotal: number, coupon: CouponRule | null) {
  if (!coupon || subtotal < coupon.minOrder) return 0;
  if (coupon.type === "PERCENT") {
    return Math.min(subtotal, Math.round((subtotal * coupon.value) / 100));
  }
  return Math.min(subtotal, coupon.value);
}

export function maxRedeemablePoints(subtotal: number, discount: number, available: number) {
  const base = Math.max(0, subtotal - discount);
  const cap = Math.floor(base * MAX_POINTS_SHARE);
  return Math.max(0, Math.min(available, cap, base));
}

export function quote(input: {
  subtotal: number;
  coupon: CouponRule | null;
  pointsRequested: number;
  pointsAvailable: number;
}) {
  const discount = couponDiscount(input.subtotal, input.coupon);
  const pointsUsed = maxRedeemablePoints(input.subtotal, discount, Math.max(0, input.pointsRequested && input.pointsAvailable ? Math.min(input.pointsRequested, input.pointsAvailable) : 0));
  const merchandise = Math.max(0, input.subtotal - discount - pointsUsed);
  const shipping = shippingFor(input.subtotal);
  const total = merchandise + shipping;
  const pointsEarned = Math.floor(merchandise * POINTS_EARN_RATE);
  const gst = Math.round(merchandise - merchandise / (1 + GST_RATE));
  return { discount, pointsUsed, merchandise, shipping, total, pointsEarned, gst };
}

export function gstOf(amount: number) {
  return Math.round(amount - amount / (1 + GST_RATE));
}
