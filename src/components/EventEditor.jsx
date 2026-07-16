import { useState } from "react";

export default function EventEditor({ event, onClose, onSave }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const d = new FormData(e.currentTarget),
      file = d.get("image");
    try {
      if (
        file?.size &&
        !["image/jpeg", "image/png", "image/webp"].includes(file.type)
      )
        throw new Error("Please upload a JPG, PNG or WebP image.");
      if (file?.size > 10 * 1024 * 1024)
        throw new Error("Event images must be 10 MB or smaller.");
      await onSave({
        id: event?._id,
        title: d.get("title").trim(),
        date: d.get("date"),
        startTime: d.get("startTime").trim(),
        endTime: d.get("endTime").trim() || undefined,
        description: d.get("description").trim(),
        isPublished: d.get("isPublished") === "on",
        file,
        imageUrl: event?.imageUrl,
        imageStorageId: event?.imageStorageId,
      });
    } catch (err) {
      setError(
        err?.data?.message || err?.message || "Could not save this event.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-backdrop">
      <dialog className="editor-dialog" open>
        <button className="dialog-close" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow dark">Event editor</p>
        <h2>{event ? "Edit" : "Add"} event</h2>
        <form onSubmit={submit}>
          <label>
            Event name
            <input name="title" defaultValue={event?.title} required />
          </label>
          <div className="form-two">
            <label>
              Date
              <input
                name="date"
                type="date"
                defaultValue={event?.date}
                required
              />
            </label>
            <label>
              Start time
              <input
                name="startTime"
                defaultValue={event?.startTime}
                required
              />
            </label>
          </div>
          <label>
            End time
            <input name="endTime" defaultValue={event?.endTime} />
          </label>
          <label>
            Description
            <textarea
              name="description"
              rows="4"
              defaultValue={event?.description}
              required
            />
          </label>
          <label>
            Flyer or event image
            <input
              name="image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
            />
            <span className="hint">
              JPG, PNG or WebP, up to 10 MB. Large images are resized and
              converted to WebP before upload.
            </span>
          </label>
          <label className="switch-label">
            Published on website
            <input
              name="isPublished"
              type="checkbox"
              defaultChecked={event?.isPublished ?? true}
            />
            <span className="switch" />
          </label>
          <p className="form-message">{error}</p>
          <button className="primary-button" disabled={busy}>
            {busy ? "Saving…" : "Save event"}
          </button>
        </form>
      </dialog>
    </div>
  );
}
