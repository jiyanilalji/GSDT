import { ContactSubmission } from '../../../services/contact';
import { 
  ArchiveBoxIcon, 
  ArchiveBoxXMarkIcon, 
  TrashIcon, 
  PaperAirplaneIcon 
} from '@heroicons/react/24/outline';

interface ContactActionsProps {
  submission: ContactSubmission;
  replyText: string;
  actionLoading: boolean;
  onReply: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
}

export default function ContactActions({
  submission,
  replyText,
  actionLoading,
  onReply,
  onArchive,
  onUnarchive,
  onDelete
}: ContactActionsProps) {
  return (
    <div className="p-6 border-t border-gray-200">
      <div className="flex justify-between">
        <div className="flex space-x-3">
          <button
            onClick={onDelete}
            disabled={actionLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete
          </button>
          
          {submission.status === 'archived' ? (
            <button
              onClick={onUnarchive}
              disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <ArchiveBoxXMarkIcon className="h-5 w-5 mr-2" />
              Unarchive
            </button>
          ) : (
            <button
              onClick={onArchive}
              disabled={actionLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <ArchiveBoxIcon className="h-5 w-5 mr-2" />
              Archive
            </button>
          )}
        </div>
        
        {submission.status !== 'archived' && (
          <button
            onClick={onReply}
            disabled={actionLoading || !replyText}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {actionLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                Send Reply
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}