import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="text-primary"
      >
        <rect x="1" y="1" width="30" height="30" rx="7" className="fill-primary/10 stroke-primary/40" />
        <circle cx="10" cy="12" r="2" fill="currentColor" />
        <circle cx="22" cy="12" r="2" fill="currentColor" />
        <circle cx="16" cy="21" r="2" fill="currentColor" />
        <circle cx="10" cy="21" r="1.4" fill="currentColor" opacity="0.6" />
        <circle cx="22" cy="21" r="1.4" fill="currentColor" opacity="0.6" />
        <path
          d="M10 12L16 21L22 12M10 12L22 12M10 21L22 21"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          CortexOS
        </span>
      )}
    </div>
  );
}
