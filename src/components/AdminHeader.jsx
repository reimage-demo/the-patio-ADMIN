import Icon from "./Icons";

export default function AdminHeader({ view, onMenu }) {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const titles = { "bottle-service": "Bottle Service" };
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
        <h1>{titles[view] || view[0].toUpperCase() + view.slice(1)}</h1>
      </div>
      <div className="admin-header-actions">
        <details className="quick-links">
          <summary>Quick links</summary>
          <div>
            <a href="https://www.clover.com/" target="_blank" rel="noreferrer">Clover.com <Icon name="external" size={15} /></a>
            <a href="https://appispot.com/" target="_blank" rel="noreferrer">Appispot.com <Icon name="external" size={15} /></a>
            <a href="https://login.farajsoftwaresolutions.com/" target="_blank" rel="noreferrer">Faraj Software <Icon name="external" size={15} /></a>
          </div>
        </details>
        <div className="admin-user">
          <span>Patio Admin</span>
          <i>PA</i>
        </div>
      </div>
    </header>
  );
}
