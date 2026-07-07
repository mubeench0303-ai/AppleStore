import { ORDER_STATUS_STYLES } from "@/lib/order-status";

export default function OrderStatusBadge({ status }: { status: string }) {
  const light = ORDER_STATUS_STYLES[status] || "bg-surface text-muted";
  const dark =
    ORDER_STATUS_STYLES_DARK[status] || "dark:bg-surface dark:text-muted";

  return (
    <span
      className={`inline-flex text-[11px] sm:text-[12px] font-medium px-2.5 py-1 rounded-full capitalize ${light} ${dark}`}
    >
      {status}
    </span>
  );
}

const ORDER_STATUS_STYLES_DARK: Record<string, string> = {
  pending: "dark:bg-amber-900/35 dark:text-amber-300",
  paid: "dark:bg-blue-900/35 dark:text-blue-300",
  shipped: "dark:bg-purple-900/35 dark:text-purple-300",
  delivered: "dark:bg-green-900/35 dark:text-green-300",
  cancelled: "dark:bg-red-900/35 dark:text-red-300",
};
