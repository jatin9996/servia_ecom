import { prisma } from "@/lib/prisma";

export default async function InquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <p className="eyebrow">Desk</p>
      <h1 className="mt-2 font-serif text-4xl">Inbox</h1>
      <div className="mt-6 space-y-4">
        {inquiries.map((inquiry) => (
          <article key={inquiry.id} className="border border-line bg-ivory p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-stone">{inquiry.topic} · {inquiry.createdAt.toLocaleString("en-IN")}</p>
            <h2 className="mt-1 font-serif text-2xl">{inquiry.name}</h2>
            <p className="text-sm text-stone">{inquiry.email}{inquiry.phone ? ` · ${inquiry.phone}` : ""}</p>
            <p className="mt-3 text-sm leading-relaxed">{inquiry.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
