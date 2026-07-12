import Navbar from '../../../shared/components/organism/Navbar';
import HeroSection from './components/HeroSection';
import Footer from '../../../shared/components/organism/Footer';
import NewsSection from '../../../shared/components/organism/NewsSection';



function LandingPage() {
    return (
        <>
            <Navbar/>
            <HeroSection/>
            <NewsSection/>
            <Footer/>
        </>
    )
}

export default LandingPage