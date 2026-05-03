import HeroSlider from "../components/site/HeroSlider";
import QuickActions from "../components/site/QuickActions";
import BikeGrid from "../components/site/BikeGrid";
import ServicesSection from "../components/site/ServicesSection";
import Testimonials from "../components/site/Testimonials";
import ShowroomSection from "../components/site/ShowroomSection";

export default function Home({ onOpenEnquiry }) {
  return (
    <>
      <HeroSlider />
      <QuickActions onOpenEnquiry={onOpenEnquiry} />
      <BikeGrid limit={8} />
      <ServicesSection />
      <Testimonials />
      <ShowroomSection />
    </>
  );
}
