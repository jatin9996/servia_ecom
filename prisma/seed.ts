import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { products, reviews } from "./catalog";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.address.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("Seravia#Admin1", 10);
  const customerPassword = await bcrypt.hash("Seravia#Care1", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@seravia.life",
      name: "Seravia Desk",
      passwordHash: adminPassword,
      role: "ADMIN",
      phone: "9810000000",
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "mira@seravia.life",
      name: "Mira Sen",
      passwordHash: customerPassword,
      role: "CUSTOMER",
      phone: "9845011122",
      points: 180,
      addresses: {
        create: {
          fullName: "Mira Sen",
          phone: "9845011122",
          line1: "14, Lavelle Road",
          line2: "Near Cubbon Park",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
          isDefault: true,
        },
      },
    },
  });

  const created = new Map<string, { id: string; name: string; price: number }>();
  for (const product of products) {
    const { ingredients, ...data } = product;
    const row = await prisma.product.create({
      data: {
        ...data,
        ingredients: {
          create: ingredients.map((ingredient, index) => ({ ...ingredient, sort: index })),
        },
      },
    });
    created.set(product.slug, { id: row.id, name: row.name, price: row.price });
  }

  for (const review of reviews) {
    const product = created.get(review.slug);
    if (!product) continue;
    await prisma.review.create({
      data: {
        productId: product.id,
        author: review.author,
        rating: review.rating,
        title: review.title,
        body: review.body,
        skinType: review.skinType,
        ageRange: review.ageRange,
        concern: review.concern,
        verified: review.verified,
        published: true,
        userId: review.verified ? customer.id : null,
      },
    });
  }

  for (const product of created.values()) {
    const stats = await prisma.review.aggregate({
      where: { productId: product.id, published: true },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.product.update({
      where: { id: product.id },
      data: { ratingAvg: stats._avg.rating ?? 0, ratingCount: stats._count },
    });
  }

  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", type: "PERCENT", value: 10, minOrder: 499 },
      { code: "CLINIC200", type: "FLAT", value: 200, minOrder: 999 },
      { code: "SPF50", type: "FLAT", value: 50, minOrder: 549 },
    ],
  });

  const address = {
    fullName: "Mira Sen",
    phone: "9845011122",
    line1: "14, Lavelle Road",
    line2: "Near Cubbon Park",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
  } satisfies Prisma.InputJsonValue;

  const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const pick = (slug: string) => {
    const product = created.get(slug);
    if (!product) throw new Error(slug);
    return product;
  };

  const samples: {
    orderNumber: string;
    status: "PENDING" | "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentStatus: string;
    paymentMethod: string;
    days: number;
    slugs: string[];
    user?: boolean;
  }[] = [
    { orderNumber: "SRV-A1C3E890", status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "RAZORPAY", days: 12, slugs: ["spf-50-fluid", "niacinamide-10-zinc"], user: true },
    { orderNumber: "SRV-B20491AA", status: "SHIPPED", paymentStatus: "PAID", paymentMethod: "RAZORPAY", days: 3, slugs: ["vitamin-c-15", "ceramide-barrier-cream"], user: true },
    { orderNumber: "SRV-C77D1204", status: "PACKED", paymentStatus: "COD", paymentMethod: "COD", days: 1, slugs: ["amino-cleanser", "salicylic-acid-2"] },
    { orderNumber: "SRV-D9182FF0", status: "CONFIRMED", paymentStatus: "PAID", paymentMethod: "RAZORPAY", days: 0, slugs: ["retinol-0-3"] },
    { orderNumber: "SRV-E44AB221", status: "DELIVERED", paymentStatus: "PAID", paymentMethod: "RAZORPAY", days: 6, slugs: ["tranexamic-3", "spf-50-fluid", "kojic-arbutin"] },
    { orderNumber: "SRV-F01CC883", status: "CANCELLED", paymentStatus: "CANCELLED", paymentMethod: "RAZORPAY", days: 4, slugs: ["aha-bha-toner"] },
  ];

  for (const sample of samples) {
    const lines = sample.slugs.map((slug) => pick(slug));
    const subtotal = lines.reduce((sum, line) => sum + line.price, 0);
    const shipping = subtotal >= 499 ? 0 : 49;
    await prisma.order.create({
      data: {
        orderNumber: sample.orderNumber,
        userId: sample.user ? customer.id : null,
        email: sample.user ? customer.email : "guest@example.com",
        status: sample.status,
        paymentMethod: sample.paymentMethod,
        paymentStatus: sample.paymentStatus,
        razorpayPaymentId: sample.paymentStatus === "PAID" ? `pay_seed_${sample.orderNumber}` : null,
        subtotal,
        discount: 0,
        shipping,
        total: subtotal + shipping,
        pointsEarned: sample.user ? Math.floor(subtotal * 0.05) : 0,
        pointsCredited: Boolean(sample.user && sample.paymentStatus === "PAID"),
        address,
        createdAt: daysAgo(sample.days),
        items: {
          create: lines.map((line) => ({
            productId: line.id,
            name: line.name,
            price: line.price,
            qty: 1,
          })),
        },
      },
    });
  }

  await prisma.inquiry.createMany({
    data: [
      {
        name: "Rohit Menon",
        email: "rohit@example.com",
        phone: "9900011122",
        topic: "Routine help",
        message: "I have pigmentation on my cheeks and I work outdoors. Can I use the tranexamic serum with the SPF fluid every day?",
      },
      {
        name: "Clinic North",
        email: "hello@clinicnorth.example",
        topic: "Wholesale",
        message: "We are a dermatology clinic in Pune and would like a wholesale conversation for the sunscreen and niacinamide serum.",
      },
    ],
  });

  console.log(`Seeded ${created.size} products, ${reviews.length} reviews.`);
  console.log("Admin  admin@seravia.life  /  Seravia#Admin1");
  console.log("Customer  mira@seravia.life  /  Seravia#Care1");
  void admin;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
