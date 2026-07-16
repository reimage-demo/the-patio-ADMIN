const money = (cents) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

export default function MenuView({ items, onAdd, onEdit, onDuplicate, onDelete }) {
  return (
    <>
      <div className="view-tools">
        <p className="subtext">
          Create drinks, upload optimized photos, update pricing and choose
          featured drinks.
        </p>
        <button className="primary-button compact" onClick={onAdd}>
          + Add menu item
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
                  <span>{item.isAvailable ? "Available" : "Unavailable"}</span>
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
                  <button className="delete" onClick={() => onDelete(item._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="empty">No menu items yet.</div>
        )}
      </div>
    </>
  );
}
