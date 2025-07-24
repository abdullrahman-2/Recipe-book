

import Image from 'next/image';

export const metadata = {
  title: 'About Us - Recipe Book',
  description: 'Learn more about Recipe Book and our mission.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 text-center text-gray-200">
      <h1 className="text-5xl font-extrabold text-white mb-10 drop-shadow-lg">
        About Our Recipe Book
      </h1>

       <section className="bg-gray-800 p-8 rounded-lg shadow-2xl mb-12 max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-100 mb-6">Our Mission</h2>
        <p className="text-lg leading-relaxed mb-4">
          At Recipe Book, our mission is to connect food lovers from around the globe by providing a platform to share, discover, and enjoy delicious recipes. We believe that cooking should be an accessible and joyful experience for everyone, regardless of their skill level.
        </p>
        <p className="text-lg leading-relaxed">
          Whether you&apos;re a seasoned chef or just starting your culinary journey, our community-driven platform offers a diverse collection of recipes, tips, and inspiration to help you create memorable meals.
        </p>
      </section>

      {/* القسم الثاني: Who We Are (مع صورة) */}
      <section className="grid md:grid-cols-2 gap-10 items-center mb-12 max-w-5xl mx-auto">
        <div>
          <Image
            src="/images/about-chef.jpg" // مثال لصور انت ممكن تضيفها
            alt="Chef preparing food"
            width={600}
            height={400}
            className="rounded-lg shadow-xl object-cover w-full h-auto"
          />
        </div>
        <div className="text-left bg-gray-800 p-8 rounded-lg shadow-2xl">
          <h2 className="text-4xl font-bold text-gray-100 mb-6">Who We Are</h2>
          <p className="text-lg leading-relaxed mb-4">
            We are a passionate team of food enthusiasts and tech innovators dedicated to building the best online recipe sharing experience. Our goal is to make it easy for you to find exactly what you're looking for, experiment with new cuisines, and share your own culinary masterpieces with the world.
          </p>
          <p className="text-lg leading-relaxed">
            Every recipe tells a story, and we're here to help you write yours. Join our community and embark on a delicious adventure!
          </p>
        </div>
      </section>

       <section className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-100 mb-6">Contact Us</h2>
        <p className="text-lg leading-relaxed mb-4">
          Have questions, suggestions, or just want to say hello? We'd love to hear from you!
        </p>
        <p className="text-lg leading-relaxed">
          Email us at: <a href="mailto:info@recipebook.com" className="text-gray-400 hover:text-gray-200 underline">info@recipebook.com</a> {/* <<<<< تم تعديل الألوان هنا */}
        </p>
       </section>
    </div>
  );
}