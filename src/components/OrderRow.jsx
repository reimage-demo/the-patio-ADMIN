const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});
const money = (cents) => moneyFormatter.format(cents / 100);
const statuses = [
  "received",
  "in-progress",
  "ready",
  "completed",
  "cancelled",
  "refunded",
];
const statusLabel = (value) =>
  value === "refunded" ? "refunded (after Clover)" : value.replace("-", " ");
const itemLabel = (item) =>
  `${item.quantity}× ${item.name}${item.selectedAddOns?.length ? ` — ${item.selectedAddOns.map((option) => option.name).join(", ")}` : ""}`;
export default function OrderRow({ order, compact, onStatus, onPaid }) {
  return (
    <article className="order-row">
      <div className="order-person">
        <h3>
          {order.customerName} · {order.orderNumber}
        </h3>
        <p>
          {order.phone}
          {order.email && ` · ${order.email}`}
        </p>
      </div>
      <div className="order-items">
        <strong>{order.items.map(itemLabel).join(" | ")}</strong>
        <p>{order.notes || "No special notes"}</p>
      </div>
      <div className="order-meta">
        <strong>{money(order.total)}</strong>
        <span>{timeFormatter.format(new Date(order.createdAt))}</span>
        <span>
          {order.cloverPaymentId ? "Clover verified" : "Payment recorded"}
        </span>
      </div>
      {compact ? (
        <div className="order-meta">
          <strong>{order.status.replace("-", " ")}</strong>
          <span>{order.paid ? "Paid" : "Not paid"}</span>
        </div>
      ) : (
        <div className="order-actions">
          <select
            className="status-select"
            value={order.status}
            onChange={(e) => onStatus(order._id, e.target.value)}
          >
            {statuses.map((value) => (
              <option key={value} value={value}>
                {statusLabel(value)}
              </option>
            ))}
          </select>
          <label className="paid-toggle">
            <input
              type="checkbox"
              checked={order.paid}
              onChange={(e) => onPaid(order._id, e.target.checked)}
            />{" "}
            Paid
          </label>
        </div>
      )}
    </article>
  );
}
