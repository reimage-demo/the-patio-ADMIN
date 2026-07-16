import { useState } from "react";

export default function MenuEditor({ item, count, onClose, onSave }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(item?.imageUrl || "");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = e.currentTarget,
      d = new FormData(f);
    const addOns = String(d.get("addOns"))
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, price = "0"] = line.split("|");
        return {
          name: name.trim(),
          price: Math.round(Number(price.trim()) * 100),
          isAvailable: true,
        };
      });
    try {
      await onSave({
        id: item?._id,
        file: d.get("image"),
        imageUrl: item?.imageUrl,
        imageStorageId: item?.imageStorageId,
        removeImage: d.get("removeImage") === "on",
        name: d.get("name").trim(),
        category: d.get("category").trim(),
        description: d.get("description").trim(),
        price: Math.round(Number(d.get("price")) * 100),
        accent: d.get("accent").trim() || undefined,
        isAvailable: d.get("isAvailable") === "on",
        sortOrder: Number(d.get("sortOrder")),
        addOns,
      });
    } catch (err) {
      setError(
        err?.data?.message || err?.message || "Could not save this menu item.",
      );
    } finally {
      setBusy(false);
    }
  }
  function chooseImage(e) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }
  return (
    <div className="modal-backdrop">
      <dialog className="editor-dialog" open>
        <button className="dialog-close" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow dark">Menu editor</p>
        <h2>{item ? "Edit" : "Add"} menu item</h2>
        <form onSubmit={submit}>
          <div className="menu-image-field">
            <div className={`menu-image-preview ${preview ? "has-image" : ""}`}>
              {preview ? (
                <img src={preview} alt="Menu item preview" />
              ) : (
                <span>Add a bright, clear drink photo</span>
              )}
            </div>
            <div>
              <label>
                Drink photo
                <input
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  onChange={chooseImage}
                />
                <span className="hint">
                  Automatically resized and converted to a lightweight WebP
                  before upload.
                </span>
              </label>
              {item?.imageUrl && (
                <label className="remove-image">
                  <input name="removeImage" type="checkbox" /> Remove current
                  photo
                </label>
              )}
            </div>
          </div>
          <div className="form-two">
            <label>
              Drink name
              <input name="name" defaultValue={item?.name} required />
            </label>
            <label>
              Category
              <input name="category" defaultValue={item?.category} required />
            </label>
          </div>
          <label>
            Ingredients / what it contains
            <textarea
              name="description"
              rows="3"
              defaultValue={item?.description}
              required
            />
          </label>
          <div className="form-two">
            <label>
              Price ($)
              <input
                name="price"
                type="number"
                min="0"
                step=".01"
                defaultValue={item ? (item.price / 100).toFixed(2) : ""}
                required
              />
            </label>
            <label>
              Short internal tag
              <input name="accent" defaultValue={item?.accent} />
            </label>
          </div>
          <div className="form-two">
            <label>
              Sort order
              <input
                name="sortOrder"
                type="number"
                min="0"
                defaultValue={item?.sortOrder ?? count + 1}
                required
              />
            </label>
            <label className="switch-label">
              Available now
              <input
                name="isAvailable"
                type="checkbox"
                defaultChecked={item?.isAvailable ?? true}
              />
              <span className="switch" />
            </label>
          </div>
          <label>
            Add-ons <span className="hint">One per line: Name | Price</span>
            <textarea
              name="addOns"
              rows="4"
              defaultValue={(item?.addOns || [])
                .map((a) => `${a.name} | ${(a.price / 100).toFixed(2)}`)
                .join("\n")}
            />
          </label>
          <p className="form-message">{error}</p>
          <button className="primary-button" disabled={busy}>
            {busy ? (
              "Optimizing & saving…"
            ) : (
              "Save menu item"
            )}
          </button>
        </form>
      </dialog>
    </div>
  );
}
