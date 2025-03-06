import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-primary-900">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          <div className="pb-6">
            <Link to="/about" className="text-sm leading-6 text-white-600 hover:text-white-900">
              About
            </Link>
          </div>
          <div className="pb-6">
            <Link to="/terms" className="text-sm leading-6 text-white-600 hover:text-white-900">
              Terms
            </Link>
          </div>
          <div className="pb-6">
            <Link to="/privacy" className="text-sm leading-6 text-white-600 hover:text-white-900">
              Privacy
            </Link>
          </div>
          <div className="pb-6">
            <Link to="/contact" className="text-sm leading-6 text-white-600 hover:text-white-900">
              Contact
            </Link>
          </div>
        </nav>
        <p className="mt-10 text-center text-xs leading-5 text-white-500">
          &copy; {new Date().getFullYear()} Global South Digital Token. All rights reserved.
        </p>
      </div>
    </footer>
  );
}