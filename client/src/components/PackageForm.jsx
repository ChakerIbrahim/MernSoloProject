import { useState } from "react";

// Shared form for both creating a new package and editing an existing one.
// Pass initialValues (a real package object) to pre-fill it for editing;
// leave it out entirely for a blank create form.
//
// IMPORTANT: always render this with a unique `key` prop that changes
// between "create" and "edit package X" (e.g. key="create" vs
// key={`edit-${pkg._id}`}) — that forces React to fully remount the
// component with fresh internal state instead of reusing stale values
// from whatever was being edited before.
function PackageForm({ initialValues = {}, onSubmit, onCancel, submitLabel }) {
  const [title, setTitle] = useState(initialValues.title || "");
  const [destination, setDestination] = useState(initialValues.destination || "");
  const [price, setPrice] = useState(initialValues.price ?? "");
  const [durationDays, setDurationDays] = useState(initialValues.durationDays ?? "");
  const [includes, setIncludes] = useState((initialValues.includes || []).join(", "));
  const [description, setDescription] = useState(initialValues.description || "");
  const [spotsAvailable, setSpotsAvailable] = useState(initialValues.spotsAvailable ?? "");
  const [tags, setTags] = useState((initialValues.tags || []).join(", "));
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");

  // isEditing just checks whether we were handed a real package to prefill
  // from — used purely to tweak the photo label's wording below
  const isEditing = Boolean(initialValues.title);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("destination", destination);
    formData.append("price", price);
    formData.append("durationDays", durationDays);
    formData.append(
      "includes",
      JSON.stringify(includes.split(",").map((s) => s.trim()).filter(Boolean)),
    );
    formData.append("description", description);
    formData.append("spotsAvailable", spotsAvailable);
    formData.append(
      "tags",
      JSON.stringify(tags.split(",").map((s) => s.trim()).filter(Boolean)),
    );
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      // onSubmit is provided by the parent (AgencyDashboard) — it decides
      // whether this becomes a POST (create) or a PUT (edit)
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 flex flex-col gap-3 rounded-lg border border-line bg-white p-4"
    >
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="rounded-md border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ocean"
      />
      <input
        type="text"
        placeholder="Destination"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        required
        className="rounded-md border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ocean"
      />
      <div className="flex gap-3">
        <input
          type="number"
          placeholder="Price ($)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-1/2 rounded-md border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ocean"
        />
        <input
          type="number"
          placeholder="Duration (days)"
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
          required
          className="w-1/2 rounded-md border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ocean"
        />
      </div>
      <input
        type="text"
        placeholder="Includes (comma separated, e.g. Flights, Hotel, Breakfast)"
        value={includes}
        onChange={(e) => setIncludes(e.target.value)}
        className="rounded-md border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ocean"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="rounded-md border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ocean"
      />
      <div className="flex gap-3">
        <input
          type="number"
          placeholder="Spots available"
          value={spotsAvailable}
          onChange={(e) => setSpotsAvailable(e.target.value)}
          required
          className="w-1/2 rounded-md border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ocean"
        />
        <input
          type="text"
          placeholder="Tags (comma separated, e.g. beach, budget)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-1/2 rounded-md border border-line px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ocean"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-ink/70">
          {isEditing
            ? "Replace photo (optional — leave blank to keep the current one)"
            : "Photo (optional — falls back to a destination photo if skipped)"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
          className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink file:mr-3 file:rounded file:border-0 file:bg-ocean-dark file:px-3 file:py-1 file:text-sm file:text-white"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="mt-1 rounded-md bg-ocean-dark px-4 py-2 text-sm font-semibold text-white hover:bg-ocean"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-1 rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-ocean"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default PackageForm;