import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { BrandIntroSection } from "@/components/home/BrandIntroSection";
import { WellnessConnectionSection } from "@/components/home/WellnessConnectionSection";
import { FeaturedProductSection } from "@/components/home/FeaturedProductSection";
import { WhyGutGlowSection } from "@/components/home/WhyGutGlowSection";
import { OurApproachSection } from "@/components/home/OurApproachSection";
import { EducationJournalSection } from "@/components/home/EducationJournalSection";
import { CustomerFeedbackSection } from "@/components/home/CustomerFeedbackSection";
import { HomeFaqSection } from "@/components/home/HomeFaqSection";
import { FinalCtaSection } from "@/components/home/FinalCtaSection";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <AnnouncementBar />
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <BrandIntroSection />
        <WellnessConnectionSection />
        <FeaturedProductSection />
        <WhyGutGlowSection />
        <OurApproachSection />
        <EducationJournalSection />
        <CustomerFeedbackSection />
        <HomeFaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}
