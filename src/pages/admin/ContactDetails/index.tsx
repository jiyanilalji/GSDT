import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWallet } from '../../../hooks/useWallet';
import { useAdmin } from '../../../hooks/useAdmin';
import { useContactDetails } from '../../../hooks/useContactDetails';
import AdminLayout from '../layout/AdminLayout';
import ContactHeader from './ContactHeader';
import ContactContent from './ContactContent';
import ContactActions from './ContactActions';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function ContactDetails() {
  const { id } = useParams<{ id: string }>();
  const { isConnected } = useWallet();
  const { isSuperAdmin } = useAdmin();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    submission,
    loading,
    error,
    actionLoading,
    success,
    replyText,
    setReplyText,
    handleReply,
    handleArchive,
    handleUnarchive,
    handleDelete
  } = useContactDetails(id);

  useEffect(() => {
    // Redirect if not connected
    if (!isConnected) {
      navigate('/', { replace: true });
      return;
    }
  }, [isConnected, navigate]);

  if (loading) {
    return (
      <AdminLayout activeTab="contacts">
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading message...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout activeTab="contacts">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!submission) {
    return (
      <AdminLayout activeTab="contacts">
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Message not found</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="contacts">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ContactHeader />
        
        <ContactContent
          submission={submission}
          replyText={replyText}
          setReplyText={setReplyText}
          success={success}
          error={error}
        />

        {isSuperAdmin && (
          <ContactActions
            submission={submission}
            replyText={replyText}
            actionLoading={actionLoading}
            onReply={handleReply}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
            onDelete={() => setShowDeleteConfirm(true)}
          />
        )}
      </div>

      {isSuperAdmin && (
        <DeleteConfirmModal
          show={showDeleteConfirm}
          loading={actionLoading}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
        />
      )}
    </AdminLayout>
  );
}