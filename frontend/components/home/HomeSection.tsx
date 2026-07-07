import Link from "next/link";

export default function HomeSection({
  title,
  subtitle,
  href,
  linkLabel = "View all",
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`section-padding ${className}`}>
      <div className="container-page">
        <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="text-[14px] text-muted mt-2 max-w-lg">{subtitle}</p>}
          </div>
          {href && (
            <Link href={href} className="text-accent text-sm font-medium hover:underline shrink-0 whitespace-nowrap">
              {linkLabel}
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
