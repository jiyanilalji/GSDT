import { 
  ListBulletIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface MenuProps {
  view: 'list' | 'form';
  onViewChange: (view: 'list' | 'form') => void;
  onRefresh?: () => void;
}

export default function Menu({ view, onViewChange, onRefresh }: MenuProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <nav className="flex space-x-4">
        <button
          onClick={() => onViewChange('list')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            view === 'list'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <ListBulletIcon className="h-5 w-5 mr-2" />
          Page List
        </button>
        <button
          onClick={() => onViewChange('form')}
          className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
            view === 'form'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <PencilSquareIcon className="h-5 w-5 mr-2" />
          {view === 'form' ? 'Edit Page' : 'Create Page'}
        </button>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 ml-auto"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
        )}
      </nav>
    </div>
  );
}