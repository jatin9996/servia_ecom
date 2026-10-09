import { prisma } from "@/lib/prisma";
import { ReviewToggle } from "@/components/admin/review-toggle";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <p className="eyebrow">Notes</p>
      <h1 className="mt-2 font-serif text-4xl">Reviews</h1>
      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <article key={review.id} className="border border-line bg-ivory p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-stone">{review.product.name} · {review.rating}/5 · {review.published ? "Live" : "Hidden"}</p>
                <h2 className="mt-1 font-serif text-2xl">{review.title}</h2>
                <p className="mt-2 text-sm">{review.body}</p>
                <p className="mt-2 text-xs text-stone">{review.author} · {review.skinType} · {review.concern}</p>
              </div>
              <ReviewToggle id={review.id} published={review.published} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
