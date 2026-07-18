const money = (cents) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

export default function MenuView({ items, onAdd, onEdit, onDuplicate, onDelete, onVisibility, bottleService = false }) {
  return (
    <>
      <div className="view-tools">
        <p className="subtext">
          {bottleService
            ? "Create bottle-service packages and attach bottle, included-drink and chaser choices."
            : "Create drinks, upload photos, and hide test items without deleting them."}
        </p>
        <button className="primary-button compact" onClick={onAdd}>
          + Add {bottleService ? "bottle package" : "menu item"}
        </button>
      </div>
      <div className="admin-grid menu-admin-grid">
        {items.length ? (
          items.map((item) => (
            <article
              key={item._id}
              className={`admin-card menu-admin-card ${item.isAvailable ? "" : "unavailable"} ${item.isDrinkOfNight ? "admin-drink-night" : ""}`}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  width="800"
                  height="600"
                  loading="lazy"
                  decoding="async"
                  alt=""
                />
              ) : (
                <div className="admin-image-placeholder">Photo needed</div>
              )}
              <div className="menu-admin-copy">
                <div className="admin-card-head">
                  <h3>{item.name}</h3>
                  <span className="admin-card-price">{money(item.price)}</span>
                </div>
                <p>{item.description}</p>
                <div className="admin-card-meta">
                  <span>{item.category}</span>
                  <span>{item.isAvailable ? "Visible on menu" : "Hidden from menu"}</span>
                  {item.isFeatured && (
                    <span className="admin-feature-tag">Featured</span>
                  )}
                  {item.isDrinkOfNight && (
                    <span className="admin-night-tag">Drink of the Night</span>
                  )}
                  {item.isCustomDrink && (
                    <span className="admin-feature-tag">Build Your Own</span>
                  )}
                </div>
                <div className="card-actions">
                  <button onClick={() => onEdit(item)}>Edit</button>
                  <button onClick={() => onDuplicate(item)}>Duplicate</button>
                  <button onClick={() => onVisibility(item, !item.isAvailable)}>
                    {item.isAvailable ? "Hide from menu" : "Show on menu"}
                  </button>
                  <button className="delete" onClick={() => onDelete(item._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="empty">No {bottleService ? "bottle-service packages" : "menu items"} yet.</div>
        )}
      </div>
    </>
  );
}
