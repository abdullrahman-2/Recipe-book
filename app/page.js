 import FeaturedRecipes from '@/components/featuredRecipes/FeaturedRecipes';
import HeroSwiper from '@/components/heroSwiper/HeroSwiper';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden  text-white">
     

          <HeroSwiper className=""/>
          <br/>
      <FeaturedRecipes /> 

    </div>
  );
}