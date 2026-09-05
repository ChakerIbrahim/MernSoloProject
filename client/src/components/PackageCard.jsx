import { getDestinationImage } from "../utils/destinationImages";

function PackageCard({ pkg, onClick }) {
  // Prefer a real uploaded photo if the agency added one; otherwise fall
  // back to the destination-matched stock photo, exactly like before
  const imageSrc =
    pkg.images && pkg.images.length > 0
      ? `http://localhost:8000${pkg.images[0]}`
      : getDestinationImage(pkg.destination);

  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-white text-left transition hover:border-ocean"
    >
      <img src={imageSrc} alt={pkg.destination} className="h-40 w-full object-cover" />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold text-ink">{pkg.title}</h3>
        <p className="text-sm text-ink/60">
          {pkg.destination} · {pkg.durationDays} days
        </p>
        <p className="text-sm text-ink/60">
          {pkg.agency?.agencyName || pkg.agency?.firstName}
        </p>
        <p className="mt-auto pt-2 text-lg font-bold text-ink">${pkg.price}</p>
      </div>
    </button>
  );
}

export default PackageCard;