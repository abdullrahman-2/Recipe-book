'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectCurrentUser,
  selectAuthLoading,
} from '../../redux/features/auth/authSlice';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const authLoading = useSelector(selectAuthLoading);

  return (
    <header className="bg-gray-900 p-4 text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Recipe Book Logo"
            width={50}
            height={50}
            className="rounded-full mr-2 border-2 border-gray-700"
          />
          <span className="text-2xl font-bold hover:text-gray-400 transition-colors duration-200">
            Recipe Book
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-white hover:text-gray-400 transition-colors duration-200 text-lg">
            Home
          </Link>
          <Link href="/about" className="text-white hover:text-gray-400 transition-colors duration-200 text-lg">
            About Us
          </Link>

          {authLoading ? (
            <div className="w-24 h-6 bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <>
              {isAuthenticated && (
                <Link href="/create-recipe" className="text-white hover:text-gray-400 transition-colors duration-200 text-lg">
                  Create Recipe
                </Link>
              )}

              {!isAuthenticated && (
                <>
                  <Link href="/login" className="text-white hover:text-gray-400 transition-colors duration-200 text-lg">
                    Login
                  </Link>
                  <Link href="/register" className="text-white hover:text-gray-400 transition-colors duration-200 text-lg">
                    Register
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  <Link href="/profile" className="text-white hover:text-gray-400 transition-colors duration-200">
                    <FaUserCircle className="text-3xl" />
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <div className="md:hidden flex items-center">
          {authLoading ? (
             <div className="w-16 h-6 bg-gray-700 rounded animate-pulse mr-4"></div>
          ) : (
            <>
              {isAuthenticated && (
                <>
                  <Link href="/profile" className="text-white hover:text-gray-400 transition-colors duration-200 mr-4">
                    <FaUserCircle className="text-3xl" />
                  </Link>
                </>
              )}
            </>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none focus:ring-2 focus:ring-gray-400 p-2 rounded-md"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div className="md:hidden bg-gray-800 py-4 px-2 mt-2 rounded-lg shadow-lg">
          <Link
            href="/"
            className="block text-white hover:bg-gray-700 py-2 px-3 rounded-md transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/about"
            className="block text-white hover:bg-gray-700 py-2 px-3 rounded-md transition-colors duration-200"
            onClick={() => setIsOpen(false)}
          >
            About Us
          </Link>
          {authLoading ? (
            <div className="w-full h-8 bg-gray-700 rounded animate-pulse my-2"></div>
          ) : (
            <>
              {isAuthenticated && (
                <Link
                  href="/create-recipe"
                  className="block text-white hover:bg-gray-700 py-2 px-3 rounded-md transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Create Recipe
                </Link>
              )}

              {!isAuthenticated && (
                <>
                  <Link
                    href="/login"
                    className="block text-white hover:bg-gray-700 py-2 px-3 rounded-md transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block text-white hover:bg-gray-700 py-2 px-3 rounded-md transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
              
            </>
          )}
        </div>
      )}
    </header>
  );
}
