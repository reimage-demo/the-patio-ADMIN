import Icon from "./Icons";

export default function AdminHeader({ view, onMenu }) {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  return (
    <header className="admin-header">
      <button
        className="mobile-sidebar"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Icon name="navigation" />
      </button>
      <div>
        <p>{today}</p>
        <h1>{view[0].toUpperCase() + view.slice(1)}</h1>
      </div>
      <div className="admin-user">
        <span>Patio Admin</span>
        <i>PA</i>
      </div>
    </header>
  );
}
