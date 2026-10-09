import { prisma } from "@/lib/prisma";
import { CouponForm, CouponToggle } from "@/components/admin/coupon-form";

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <p className="eyebrow">Offers</p>
      <h1 className="mt-2 font-serif text-4xl">Codes</h1>
      <div className="mt-6"><CouponForm /></div>
      <div className="mt-6 divide-y divide-line border-y border-line">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="flex items-center justify-between py-3 text-sm">
            <div>
              <p className="font-medium">{coupon.code}</p>
              <p className="text-xs text-stone">
                {coupon.type === "PERCENT" ? `${coupon.value}%` : `₹${coupon.value}`} off · min ₹{coupon.minOrder} · {coupon.active ? "Live" : "Paused"}
              </p>
            </div>
            <CouponToggle id={coupon.id} active={coupon.active} />
          </div>
        ))}
      </div>
    </div>
  );
}
