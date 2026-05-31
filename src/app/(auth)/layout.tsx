import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-12">
      {/* Ambient brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(50% 40% at 50% 0%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 70%)",
        }}
      />
      <Link href="/" aria-label="Zentry" className="mb-8">
        <Image
          src="/logo.png"
          alt="Zentry — Track. Plan. Grow."
          width={160}
          height={160}
          priority
          className="size-28 rounded-2xl shadow-lg"
        />
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
