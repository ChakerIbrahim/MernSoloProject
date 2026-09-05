// A dual-mode star display. Pass onChange to make it clickable (for
// submitting a new review); leave onChange out and it's a plain,
// non-interactive display (for showing an existing review's rating)
function StarRating({ value, onChange, size = "text-xl" }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = Boolean(onChange);

  return (
    <div className={`flex gap-0.5 ${size}`}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={interactive ? () => onChange(star) : undefined}
          className={`${interactive ? "cursor-pointer" : ""} ${
            star <= value ? "text-sand" : "text-line"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default StarRating;