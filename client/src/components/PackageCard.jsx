import { getDestinationImage } from "../utils/destinationImages";

// pkg is a full package object from the API. onClick is passed in by whichever
// page uses this card, so PackageCard doesn't need to know about routing itself
function PackageCard({ pkg, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-white text-left transition hover:border-ocean"
    >
      <img
        src={getDestinationImage(pkg.destination)}
        alt={pkg.destination}
        className="h-40 w-full object-cover"
      />
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