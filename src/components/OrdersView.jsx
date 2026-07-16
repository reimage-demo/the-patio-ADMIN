import { useState } from "react";
import OrderRow from "./OrderRow";
export default function OrdersView({
  orders,
  status,
  loadMore,
  onStatus,
  onPaid,
}) {
  const [filter, setFilter] = useState("active");
  let rows = orders;
  if (filter === "active")
    rows = orders.filter((o) =>
      ["received", "in-progress", "ready"].includes(o.status),
    );
  if (filter === "completed")
    rows = orders.filter((o) =>
      ["completed", "cancelled", "refunded"].includes(o.status),
    );
  return (
    <>
      <div className="view-tools">
        <div className="filters">
          {["active", "all", "completed"].map((value) => (
            <button
              key={value}
              className={`filter ${filter === value ? "active" : ""}`}
              onClick={() => setFilter(value)}
            >
              {value === "all"
                ? "All orders"
                : value[0].toUpperCase() + value.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="orders-list">
        {rows.length ? (
          rows.map((o) => (
            <OrderRow
              key={o._id}
              order={o}
              onStatus={onStatus}
              onPaid={onPaid}
            />
          ))
        ) : (
          <div className="empty">
            {status === "LoadingFirstPage"
              ? "Loading orders…"
              : "No orders in this view."}
          </div>
        )}
      </div>
      {status !== "Exhausted" && (
        <button
          className="refresh-button load-more"
          disabled={status !== "CanLoadMore"}
          onClick={loadMore}
        >
          {status === "LoadingMore" ? "Loading…" : "Load more orders"}
        </button>
      )}
    </>
  );
}
