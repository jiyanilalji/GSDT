import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { getContactSubmissions, updateContactStatus, deleteContactSubmission, ContactSubmission } from '../../services/contact';
import { format } from 'date-fns';
import { useWallet } from '../../hooks/useWallet';
import { 
  EyeIcon, 
  ArchiveBoxIcon, 
  ArchiveBoxXMarkIcon, 
  TrashIcon 
} from '@heroicons/react/24/outline';

export default function ContactSubmissions() {
  const { isConnected } = useWallet();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = localStorage.getItem('adminAuth') === 'true';

  useEffect(() => {
    // Redirect if not admin
    if (!isConnected || !isAdmin) {
      //navigate('/admin/login');
      return;
    }

    const loadSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getContactSubmissions();
        setSubmissions(data);
      } catch (err: any) {
        console.error('Error loading contact submissions:', err);
        setError(err.message || 'Error loading contact submissions');
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [isAdmin, isConnected, navigate]);

  const handleStatusChange = async (id: string, status: 'new' | 'read' | 'replied' | 'archived') => {
    try {
      setActionLoading(true);
      const success = await updateContactStatus(id, status);
      
      if (success) {
        // Update UI optimistically
        setSubmissions(prev => 
          prev.map(s => 
            s.id === id 
              ? {...s, status} 
              : s
          )
        );
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError(err.message || 'Error updating status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(true);
      const success = await deleteContactSubmission(id);
      
      if (success) {
        // Remove from UI
        setSubmissions(prev => prev.filter(s => s.id !== id));
        setShowDeleteConfirm(null);
      } else {
        setError('Failed to delete message');
      }
    } catch (err: any) {
      console.error('Error deleting message:', err);
      setError(err.message || 'Error deleting message');
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage contact form submissions</p>
        </div>

        {/* Admin Navigation */}
        <div className="mb-8 bg-white shadow rounded-lg p-4">
          <nav className="flex space-x-4">
            <Link 
              to="/admin/dashboard" 
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              KYC Requests
            </Link>
            <Link 
              to="/admin/contacts" 
              className="px-3 py-2 rounded-md text-sm font-medium bg-primary-100 text-primary-700"
            >
              Contact Messages
            </Link>
          </nav>
        </div>

        {/* Contact Submissions Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Contact Messages</h3>
                <p className="mt-1 text-sm text-gray-500">
                  View and respond to messages from users
                </p>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
                >
                  Refresh
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg word-break">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading contact submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No contact submissions found</p>
              </div>
            ) : (
              <div className="mt-8 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <motion.tr
                        key={submission.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {submission.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(submission.status)}`}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(submission.submitted_at), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex justify-center space-x-3">
                            <Link
                              to={`/admin/contacts/${submission.id}`}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                              title="View Message"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                            
                            {submission.status === 'archived' ? (
                              <button
                                onClick={() => handleStatusChange(submission.id, 'read')}
                                disabled={actionLoading}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50 flex items-center"
                                title="Unarchive Message"
                              >
                                <ArchiveBoxXMarkIcon className="h-5 w-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(submission.id, 'archived')}
                                disabled={actionLoading}
                                className="text-gray-600 hover:text-gray-900 disabled:opacity-50 flex items-center"
                                title="Archive Message"
                              >
                                <ArchiveBoxIcon className="h-5 w-5" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => setShowDeleteConfirm(submission.id)}
                              disabled={actionLoading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center"
                              title="Delete Message"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
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
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
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