import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ContactHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Contact Message</h1>
        <Link
          to="/admin/contacts"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Messages
        </Link>
      </div>
      <p className="mt-2 text-gray-600">View and respond to user message</p>
    </div>
  );
}