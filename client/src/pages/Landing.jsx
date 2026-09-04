import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getDestinationImage } from "../utils/destinationImages";

const popularDestinations = ["Thailand", "Bali", "Morocco", "Italy"];

function Landing() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/browse?destination=${query}`);
  };

  const handleDestinationClick = (destination) => {
    navigate(`/browse?destination=${destination}`);
  };

  return (
    <>
      <Header />

      <section className="px-6 py-20 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Find your next trip
        </h1>
        <p className="mx-auto mt-3 max-w-md text-ink/70">
          Compare packages from real travel agencies, all in one place.
        </p>

        <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-md gap-2">
          <input
            type="text"
            placeholder="Where do you want to go?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-line bg-white px-4 py-2.5 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ocean"
          />
          <button
            type="submit"
            className="whitespace-nowrap rounded-md bg-ocean-dark px-5 py-2.5 font-semibold text-white hover:bg-ocean"
          >
            Search
          </button>
        </form>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-4 text-lg font-semibold text-ink">Popular destinations</h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {popularDestinations.map((destination) => (
            <button
              key={destination}
              onClick={() => handleDestinationClick(destination)}
              className="group overflow-hidden rounded-lg border border-line bg-white text-left"
            >
              <img
                src={getDestinationImage(destination)}
                alt={destination}
                className="h-28 w-full object-cover transition group-hover:opacity-90"
              />
              <span className="block px-3 py-2 font-medium text-ink">
                {destination}
              </span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

export default Landing;