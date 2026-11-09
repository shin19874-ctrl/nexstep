import Hero from '../components/home/Hero'
import FeaturedWebinars from '../components/home/FeaturedWebinars'
import WorkshopsSection from '../components/home/WorkshopsSection'
import WhyNexstep from '../components/home/WhyNexstep'
import AboutSection from '../components/home/AboutSection'
import FinalCta from '../components/home/FinalCta'

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedWebinars />
      <WorkshopsSection />
      <WhyNexstep />
      <AboutSection />
      <FinalCta />
    </>
  )
}
