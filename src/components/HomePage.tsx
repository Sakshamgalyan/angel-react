import Header from "@/components/Header"
import Hero from "@/components/Hero"
import StockSection from "@/components/StockSection"
import Footer from "@/components/Footer"

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
        <Header /> 
        <main className="flex-grow">
          <Hero />
          <StockSection />
        </main>
        <Footer />
    </div>
  )
}

export default Home