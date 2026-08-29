import { Toaster } from "sonner";
import { About } from "./app/external/_components/about";
import { Blog } from "./app/external/_components/blog";
import { CtaBanner } from "./app/external/_components/cta-banner";
import { Faq } from "./app/external/_components/faq";
import { Footer } from "./app/external/_components/footer";
import { Gallery } from "./app/external/_components/gallery";
import { Hero } from "./app/external/_components/hero";
import { Navbar } from "./app/external/_components/navbar";
import { Partners } from "./app/external/_components/partners";
import { Pricing } from "./app/external/_components/pricing";
import { ScrollProgress } from "./app/external/_components/scroll-progress";
import { Services } from "./app/external/_components/services";
import { Stats } from "./app/external/_components/stats";
import { Testimonials } from "./app/external/_components/testimonials";
import { WhatsappButton } from "./app/external/_components/whatsapp-button";

export default function App() {
  return (
    <div className="lj-landing">
      <main className="overflow-x-clip bg-[#f8fafc]">
        <ScrollProgress />
        <Navbar />
        <Hero />
        <About />
        <Services />
        <Stats />
        <Gallery />
        <Pricing />
        <Testimonials />
        <Partners />
        <Faq />
        <CtaBanner />
        <Blog />
        <Footer />
        <WhatsappButton />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
