'use client';

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import Link from 'next/link';
import Image from 'next/image';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const carouselItems = [
  {
    id: 1,
    image: '/images/carousel/carousel-1.jpg',
    title: 'Discover Culinary Delights',
    description: 'Explore a world of flavors with our diverse collection of recipes, crafted for every palate and occasion.',
    buttonText: 'Explore Recipes',
    buttonLink: '/recipes',
  },
  {
    id: 2,
    image: '/images/carousel/carousel-2.jpg',
    title: 'Taste the World, One Recipe at a Time',
    description: 'From classic comforts to exotic adventures, find your next favorite meal here.',
    buttonText: 'Explore Recipes',
    buttonLink: '/recipes',
  },
  {
    id: 3,
    image: '/images/carousel/carousel-3.jpg',
    title: 'Your Kitchen, Our Inspiration',
    description: 'Unlock your cooking potential with easy-to-follow recipes and helpful tips.',
    buttonText: 'Share Your Recipe',
    buttonLink: '/create-recipe',
  },
];

export default function HeroSwiper() {
  return (
    <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden rounded-xl shadow-xl">
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation={false}
        modules={[Autoplay, Pagination]}
        className="mySwiper h-full w-full"
      >
        {carouselItems.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="relative w-full h-full flex items-center justify-center text-center p-4">
              <Image
                src={item.image}
                alt={item.title}
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-black opacity-50"></div>

              <div className="relative z-20 max-w-4xl mx-auto text-white">
                {/* تعديل حجم الخط للعنوان الرئيسي */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                  {item.title}
                </h1>
                {/* تعديل حجم الخط للوصف */}
                <p className="text-base sm:text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  {item.description}
                </p>
                <Link
                  href={item.buttonLink}
                  className="bg-gray-800 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-gray-700 transition-colors duration-300 shadow-lg"
                >
                  {item.buttonText}
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}