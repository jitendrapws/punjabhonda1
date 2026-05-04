import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchBike } from "../lib/api";
import BikeHero from "./BikeDetail.parts/BikeHero";
import { BikeHighlights, ColorOptions, SpecsTable } from "./BikeDetail.parts/BikeSections";
import VisitCta from "./BikeDetail.parts/VisitCta";

function LoadingState() {
  return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500" data-testid="bike-detail-loading">Loading...</div>;
}

function NotFoundState() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center" data-testid="bike-not-found">
      <h2 className="font-display font-black text-3xl">Bike not found</h2>
      <Link to="/bikes" className="mt-4 inline-block text-honda font-bold">← Back to all bikes</Link>
    </div>
  );
}

export default function BikeDetail({ onOpenEnquiry }) {
  const { slug } = useParams();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const [activeColor, setActiveColor] = useState("");

  useEffect(() => {
    setLoading(true);
    setErr(false);
    fetchBike(slug)
      .then((b) => {
        setBike(b);
        setActiveColor((b?.color_options || [])[0] || "");
      })
      .catch(() => setErr(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingState />;
  if (err || !bike) return <NotFoundState />;

  return (
    <>
      <BikeHero bike={bike} onOpenEnquiry={onOpenEnquiry} />
      <BikeHighlights bike={bike} />
      <ColorOptions colors={bike.color_options} activeColor={activeColor} onSelect={setActiveColor} />
      <SpecsTable specifications={bike.specifications} />
      <VisitCta bike={bike} onOpenEnquiry={onOpenEnquiry} />
    </>
  );
}
