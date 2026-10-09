import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page py-24">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-serif text-5xl">That page is not on the shelf.</h1>
      <Link href="/shop" className="btn mt-8">Back to the range</Link>
    </div>
  );
}
