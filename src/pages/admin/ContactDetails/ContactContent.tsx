import { format } from 'date-fns';
import { ContactSubmission } from '../../../services/contact';

interface ContactContentProps {
  submission: ContactSubmission;
  replyText: string;
  setReplyText: (text: string) => void;
  success: string | null;
  error: string | null;
}

export default function ContactContent({
  submission,
  replyText,
  setReplyText,
  success,
  error
}: ContactContentProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-yellow-100 text-yellow-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{submission.subject}</h2>
            <p className="text-sm text-gray-500 mt-1">
              From: {submission.name} &lt;{submission.email}&gt;
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Received: {format(new Date(submission.submitted_at), 'MMMM d, yyyy HH:mm:ss')}
            </p>
          </div>
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(submission.status)}`}>
            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Message</h3>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-900 whitespace-pre-wrap">{submission.message}</p>
        </div>
      </div>

      {success ? (
        <div className="p-6">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        </div>
      ) : (
        <div className="p-6">
          {submission.status !== 'archived' && (
            <>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Reply</h3>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                rows={5}
                placeholder="Type your reply here..."
              />
            </>
          )}
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>
      )}
    </>
  );
}