import { Facebook, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="border-t border-gray-100 h-[30vh] dark:border-gray-800 py-12 transition-colors">
      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
        <div className="flex gap-8 mb-8 text-sm text-gray-500 dark:text-gray-400">
          <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">About Us</Link>
          <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Contact</Link>
          <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</Link>
        </div>
        
        <div className="flex gap-6 mb-8">
          <Link href="#" className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            <Facebook className="w-5 h-5" />
          </Link>
          <Link href="#" className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            <Twitter className="w-5 h-5" />
          </Link>
          <Link href="#" className="text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            <Linkedin className="w-5 h-5" />
          </Link>
        </div>
        
        <p className="text-gray-500 dark:text-gray-600 text-sm">
          © 2024 Stocker. All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer