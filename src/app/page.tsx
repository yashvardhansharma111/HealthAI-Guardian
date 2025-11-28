import Navbar from "@/app/components/Navbar";
import HeroSection from "@/app/components/HeroSection";
import AboutSection from "@/app/components/AboutSection";
import Footer from "@/app/components/Footer";

export const metadata = {
  title: "HealthAI Guardian - AI-Powered Health Monitoring for Students",
  description:
    "Level up your wellness with HealthAI Guardian. AI-powered chronic disease monitoring, gamified health quests, wellness badges, and personalized recommendations for students.",
  keywords:
    "health monitoring, AI healthcare, student wellness, gamified health, chronic disease prevention, health tracking",
  openGraph: {
    title: "HealthAI Guardian - Level Up Your Wellness",
    description:
      "AI-powered health monitoring platform with gamified quests and personalized wellness recommendations for students.",
    type: "website",
    url: "/",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        <HeroSection />
        <section id="about">
          <AboutSection />
        </section>
      </main>

      <Footer />
    </div>
  );
}
