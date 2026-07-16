import logo from "../logo.webp";

const tabs = [
  ["overview", "⌂", "Overview"],
  ["orders", "◉", "Orders"],
  ["menu", "☷", "Menu"],
  ["events", "◇", "Events"],
];
export default function Sidebar({
  active,
  setActive,
  orderCount,
  open,
  onLogout,
}) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <a className="admin-brand" href="../index.html">
        <img src={logo} alt="The Patio" />
      </a>
      <nav>
        {tabs.map(([id, icon, label]) => (
          <button
            key={id}
            className={`tab ${active === id ? "active" : ""}`}
            onClick={() => setActive(id)}
          >
            <span>{icon}</span>
            {label}
            {id === "orders" && <b>{orderCount}</b>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <a href="../index.html" target="_blank">
          View website
        </a>
        <button onClick={onLogout}>Sign out</button>
      </div>
    </aside>
  );
}
