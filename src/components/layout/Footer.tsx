import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary-900">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <div className="flex flex-col items-center">
          <Link to="/" className="mb-8">
            <img 
              src="/logo.svg" 
              alt="GSDT Logo" 
              className="h-10 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }} // Make logo white
            />
          </Link>
          <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
            <div className="pb-6">
              <Link to="/about" className="text-sm leading-6 text-gray-300 hover:text-white">
                About
              </Link>
            </div>
            <div className="pb-6">
              <Link to="/terms" className="text-sm leading-6 text-gray-300 hover:text-white">
                Terms
              </Link>
            </div>
            <div className="pb-6">
              <Link to="/privacy" className="text-sm leading-6 text-gray-300 hover:text-white">
                Privacy
              </Link>
            </div>
            <div className="pb-6">
              <Link to="/contact" className="text-sm leading-6 text-gray-300 hover:text-white">
                Contact
              </Link>
            </div>
          </nav>
        </div>
        <p className="mt-10 text-center text-xs leading-5 text-gray-300">
          &copy; {new Date().getFullYear()} Global South Digital Token. All rights reserved.
        </p>
      </div>
    </footer>
  );
}