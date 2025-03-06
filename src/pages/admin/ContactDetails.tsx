import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ContactSubmission, getContactSubmission, updateContactStatus, sendContactReply, deleteContactSubmission } from '../../services/contact';
import { useWallet } from '../../hooks/useWallet';
import { 
  ArrowLeftIcon, 
  ArchiveBoxIcon, 
  ArchiveBoxXMarkIcon, 
  TrashIcon, 
  PaperAirplaneIcon 
} from '@heroicons/react/24/outline';

export default function ContactDetails() {
  const { id } = useParams<{ id: string }>();
  const { isConnected } = useWallet();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<ContactSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if user is admin
  const isAdmin = localStorage.getItem('adminAuth') === 'true';

  useEffect(() => {
    // Redirect if not admin
    if (!isConnected || !isAdmin) {
      //navigate('/admin/login');
      return;
    }

    const loadSubmission = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await getContactSubmission(id);
        if (!data) {
          setError('Message not found');
          return;
        }
        
        setSubmission(data);
        
        // Mark as read if it's new
        if (data && data.status === 'new') {
          await updateContactStatus(id, 'read');
          setSubmission({
            ...data,
            status: 'read'
          });
        }
      } catch (err: any) {
        console.error('Error loading contact submission:', err);
        setError(err.message || 'Error loading contact submission');
      } finally {
        setLoading(false);
      }
    };

    loadSubmission();
  }, [id, isAdmin, isConnected, navigate]);

  const handleReply = async () => {
    if (!submission || !replyText) return;
    
    try {
      setActionLoading(true);
      setError(null);
      
      // Send reply email
      const result = await sendContactReply(submission, replyText);
      
      if (result) {
        setSuccess('Reply sent successfully!');
        
        // Update status to replied
        await updateContactStatus(submission.id, 'replied');
        
        // Update local state
        setSubmission({
          ...submission,
          status: 'replied'
        });
        
        // Clear reply text
        setReplyText('');
      } else {
        setError('Failed to send reply. Please try again.');
      }
    } catch (err: any) {
      console.error('Error sending reply:', err);
      setError(err.message || 'Error sending reply');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!submission) return;
    
    try {
      setActionLoading(true);
      setError(null);
      
      const result = await updateContactStatus(submission.id, 'archived');
      
      if (result) {
        // Update local state
        setSubmission({
          ...submission,
          status: 'archived'
        });
        
        setSuccess('Message archived successfully!');
      } else {
        setError('Failed to archive message. Please try again.');
      }
    } catch (err: any) {
      console.error('Error archiving message:', err);
      setError(err.message || 'Error archiving message');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnarchive = async () => {
    if (!submission) return;
    
    try {
      setActionLoading(true);
      setError(null);
      
      const result = await updateContactStatus(submission.id, 'read');
      
      if (result) {
        // Update local state
        setSubmission({
          ...submission,
          status: 'read'
        });
        
        setSuccess('Message unarchived successfully!');
      } else {
        setError('Failed to unarchive message. Please try again.');
      }
    } catch (err: any) {
      console.error('Error unarchiving message:', err);
      setError(err.message || 'Error unarchiving message');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!submission || !id) return;
    
    try {
      setActionLoading(true);
      setError(null);
      
      const result = await deleteContactSubmission(id);
      
      if (result) {
        setSuccess('Message deleted successfully!');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/admin/contacts');
        }, 1500);
      } else {
        setError('Failed to delete message. Please try again.');
        setShowDeleteConfirm(false);
      }
    } catch (err: any) {
      console.error('Error deleting message:', err);
      setError(err.message || 'Error deleting message');
      setShowDeleteConfirm(false);
    } finally {
      setActionLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading message...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
            <div className="mt-4 flex justify-center">
              <Link
                to="/admin/contacts"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Messages
              </Link>
            </div>
          </div>
        ) : !submission ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">Message not found</p>
            <div className="mt-4">
              <Link
                to="/admin/contacts"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to Messages
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                <div className="flex justify-end space-x-4">
                  <Link
                    to="/admin/contacts"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to Messages
                  </Link>
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
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg word-break">
                    {error}
                  </div>
                )}
                
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-5 w-5 mr-2" />
                    Delete Message
                  </button>
                  
                  <div className="flex space-x-4">
                    {submission.status === 'archived' ? (
                      <button
                        onClick={handleUnarchive}
                        disabled={actionLoading}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <ArchiveBoxXMarkIcon className="h-5 w-5 mr-2" />
                        Unarchive
                      </button>
                    ) : (
                      <button
                        onClick={handleArchive}
                        disabled={actionLoading}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <ArchiveBoxIcon className="h-5 w-5 mr-2" />
                        Archive
                      </button>
                    )}
                    
                    {submission.status !== 'archived' && (
                      <button
                        onClick={handleReply}
                        disabled={actionLoading || !replyText}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {actionLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </span>
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <TrashIcon className="h-6 w-6 text-red-600 mr-2" />
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this message? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {actionLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Message
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}