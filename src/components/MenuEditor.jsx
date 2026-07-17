import { useState } from "react";

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));

export default function MenuEditor({
  item,
  count,
  optionGroups,
  onClose,
  onSave,
  bottleService = false,
}) {
  const isEditing = Boolean(item?._id);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(item?.imageUrl || "");
  const [name, setName] = useState(item?.name || "");
  const [category, setCategory] = useState(
    item?.category || (bottleService ? "Bottle Service" : ""),
  );
  const [description, setDescription] = useState(item?.description || "");
  const [price, setPrice] = useState(
    item ? (item.price / 100).toFixed(2) : "",
  );
  const [available, setAvailable] = useState(item?.isAvailable ?? true);
  const [featured, setFeatured] = useState(item?.isFeatured ?? false);
  const [drinkOfNight, setDrinkOfNight] = useState(
    item?.isDrinkOfNight ?? false,
  );
  const [customDrink, setCustomDrink] = useState(
    item?.isCustomDrink ?? bottleService,
  );
  const [selectedGroups, setSelectedGroups] = useState(
    item?.optionGroupIds || [],
  );

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      if ((customDrink || bottleService) && !selectedGroups.length)
        throw new Error(
          bottleService
            ? "Attach at least one bottle, included-drink or chaser choice."
            : "Attach at least one pricing group to a Build Your Own drink.",
        );
      await onSave({
        id: item?._id,
        file: data.get("image"),
        imageUrl: item?.imageUrl,
        imageStorageId: item?.imageStorageId,
        removeImage: data.get("removeImage") === "on",
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Math.round(Number(price) * 100),
        accent: data.get("accent").trim() || undefined,
        isAvailable: available,
        isFeatured: featured,
        isDrinkOfNight: drinkOfNight,
        isCustomDrink: bottleService || customDrink,
        isBottleService: bottleService,
        optionGroupIds: selectedGroups,
        sortOrder: Number(data.get("sortOrder")),
        addOns: item?.addOns || [],
      });
    } catch (err) {
      setError(
        err?.data?.message || err?.message || "Could not save this menu item.",
      );
    } finally {
      setBusy(false);
    }
  }

  function chooseImage(event) {
    const file = event.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  function toggleGroup(groupId) {
    setSelectedGroups((current) =>
      current.includes(groupId)
        ? current.filter((id) => id !== groupId)
        : [...current, groupId],
    );
  }

  return (
    <div className="modal-backdrop">
      <dialog className="editor-dialog menu-editor guided-editor" open>
        <button className="dialog-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <header className="editor-heading">
          <p className="eyebrow dark">
            {bottleService ? "Bottle service editor" : "Menu editor"}
          </p>
          <h2>
            {isEditing ? "Edit" : "Add"}{" "}
            {bottleService ? "a bottle package" : "a drink"}
          </h2>
          <p>
            {bottleService
              ? "Set the package price, then attach choices for bottles, included drinks and chasers."
              : "Everything customers need to decide, customize and order."}
          </p>
        </header>

        <form onSubmit={submit}>
          <div className="guided-editor-layout">
            <div className="guided-editor-main">
              <section className="editor-section">
                <div className="editor-section-title">
                  <b>1</b><span><strong>Drink details</strong><small>Use a short name and a clear ingredient description.</small></span>
                </div>
                <div className="form-two">
                  <label>
                    {bottleService ? "Package name" : "Drink name"}
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Passion Fruit Margarita"
                      required
                    />
                  </label>
                  {!bottleService && <label>
                    Category
                    <input
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      placeholder="House Favorites"
                      required
                    />
                  </label>}
                </div>
                <label>
                  Ingredients / what it contains
                  <textarea
                    rows="3"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Tequila, passion fruit, fresh lime and agave."
                    required
                  />
                  <span className="field-count">{description.length}/180 recommended characters</span>
                </label>
                <div className="form-two">
                  <label>
                    Base price ($)
                    <input
                      type="number"
                      min="0"
                      step=".01"
                      value={price}
                      onChange={(event) => setPrice(event.target.value)}
                      required
                    />
                    <span className="hint">For custom drinks, the menu says “Starting at.”</span>
                  </label>
                  <label>
                    Short internal tag
                    <input name="accent" defaultValue={item?.accent} placeholder="Tropical" />
                  </label>
                </div>
              </section>

              <section className="editor-section">
                <div className="editor-section-title">
                  <b>2</b><span><strong>Add the photo</strong><small>It is automatically resized and converted to WebP.</small></span>
                </div>
                <div className="menu-image-field improved-image-field">
                  <div className={`menu-image-preview ${preview ? "has-image" : ""}`}>
                    {preview ? (
                      <img src={preview} alt="Drink preview" />
                    ) : (
                      <span>Add a bright, clear drink photo</span>
                    )}
                  </div>
                  <div>
                    <label className="file-button-label">
                      Choose photo
                      <input
                        name="image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        onChange={chooseImage}
                      />
                    </label>
                    <span className="hint">JPG, PNG, WebP or HEIC. Large files are optimized before upload.</span>
                    {isEditing && item?.imageUrl && (
                      <label className="remove-image">
                        <input name="removeImage" type="checkbox" /> Remove current photo
                      </label>
                    )}
                  </div>
                </div>
              </section>

              <section className="editor-section">
                <div className="editor-section-title">
                  <b>3</b><span><strong>Choose where it appears</strong><small>These settings update the customer menu immediately.</small></span>
                </div>
                <div className="menu-visibility-options visibility-cards">
                  <label className="switch-label">
                    <span><strong>Available now</strong><small>Customers can order it</small></span>
                    <input type="checkbox" checked={available} onChange={(event) => setAvailable(event.target.checked)} />
                    <span className="switch" />
                  </label>
                  <label className="switch-label">
                    <span><strong>Featured</strong><small>Move it near the beginning</small></span>
                    <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
                    <span className="switch" />
                  </label>
                  <label className="switch-label">
                    <span><strong>Drink of the Night</strong><small>Highlights it above featured drinks</small></span>
                    <input type="checkbox" checked={drinkOfNight} onChange={(event) => setDrinkOfNight(event.target.checked)} />
                    <span className="switch" />
                  </label>
                  <label className="switch-label">
                    <span><strong>Build Your Own</strong><small>Shows “Starting at” and opens choices</small></span>
                    <input type="checkbox" checked={customDrink} onChange={(event) => setCustomDrink(event.target.checked)} />
                    <span className="switch" />
                  </label>
                </div>
                <label className="sort-order-field">
                  Display order
                  <input name="sortOrder" type="number" min="0" defaultValue={item?.sortOrder ?? count + 1} required />
                  <span className="hint">Lower numbers appear first within the same priority level.</span>
                </label>
              </section>

              <section className="editor-section">
                <div className="editor-section-title">
                  <b>4</b><span><strong>{bottleService ? "Choose what can be included" : "Attach customization"}</strong><small>{bottleService ? "Attach choice groups for bottles, drinks and chasers." : "Customers see these questions after tapping the plus button."}</small></span>
                </div>
                {optionGroups.length ? (
                  <div className="option-group-picker improved-group-picker">
                    {optionGroups.map((group) => {
                      const selected = selectedGroups.includes(group._id);
                      return (
                        <label key={group._id} className={selected ? "selected" : ""}>
                          <input type="checkbox" checked={selected} onChange={() => toggleGroup(group._id)} />
                          <span>
                            <strong>{group.name}</strong>
                            <small>{group.minSelections ? "Required" : "Optional"} · {group.selectionMode === "single" ? "Choose one" : `Up to ${group.maxSelections}`} · {group.options.length} choices</small>
                          </span>
                          <b>{selected ? "Attached" : "Attach"}</b>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="inline-empty">Create bottle, included-drink and chaser choices under Pricing & Options, then return here to attach them.</div>
                )}
              </section>
            </div>

            <aside className="editor-summary menu-summary">
              <p className="summary-label">Customer preview</p>
              <div className="summary-image">
                {preview ? <img src={preview} alt="" /> : <span>Photo preview</span>}
              </div>
              <span className="summary-category">{category || "Category"}</span>
              <h3>{name || "Drink name"}</h3>
              <strong className="summary-price">
                {customDrink || bottleService ? "Starting at " : ""}{money(price)}
              </strong>
              <p>{description || "The drink description appears here."}</p>
              <div className="summary-badges">
                {drinkOfNight && <span>Drink of the Night</span>}
                {!drinkOfNight && featured && <span>Featured</span>}
                {customDrink && <span>Build Your Own</span>}
                {!available && <span>Hidden</span>}
              </div>
              <small>{selectedGroups.length} customization group{selectedGroups.length === 1 ? "" : "s"} attached</small>
            </aside>
          </div>

          <p className="form-message">{error}</p>
          <div className="editor-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button className="primary-button" disabled={busy}>{busy ? "Optimizing & saving…" : "Save menu item"}</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
