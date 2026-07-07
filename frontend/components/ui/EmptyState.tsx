import Link from "next/link";
import { PackageOpen } from "lucide-react";

export default function EmptyState({
  title = "Nothing here yet",
  message,
  actionLabel,
  actionHref,
}: {
  title?: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="py-20 sm:py-28 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-muted mb-5">
        <PackageOpen size={26} strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="font-heading text-lg font-semibold text-ink mb-2">{title}</h3>
      <p className="text-[14px] text-muted max-w-sm mx-auto leading-relaxed">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex mt-6 bg-accent hover:bg-accent-hover text-white rounded-full px-6 py-2.5 text-[14px] font-medium transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
