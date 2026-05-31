import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Show the "Zentry" wordmark next to the icon mark. */
  withWordmark?: boolean;
  /** Icon mark size in px. */
  size?: number;
  className?: string;
}

/** Compact brand: gradient "Z" mark, optionally with the wordmark. */
export function Logo({ withWordmark = true, size = 32, className }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo-mark.png"
        alt="Zentry"
        width={size}
        height={size}
        className="rounded-lg"
        priority
      />
      {withWordmark ? (
        <span className="font-display text-lg font-semibold tracking-tight">
          Zentry
        </span>
      ) : null}
    </span>
  );
}
