import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ContactSubmission, 
  getContactSubmission, 
  updateContactStatus, 
  deleteContactSubmission, 
  sendContactReply 
} from '../services/contact';

export const useContactDetails = (id: string | undefined) => {
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<ContactSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
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
  }, [id]);

  const handleReply = async () => {
    if (!submission || !replyText) return;
    
    try {
      setActionLoading(true);
      
      // Send reply
      const result = await sendContactReply(submission, replyText);
      
      if (result) {
        // Update status to replied
        await updateContactStatus(submission.id, 'replied');
        
        setSubmission({
          ...submission,
          status: 'replied'
        });
        
        setSuccess('Reply sent successfully!');
        setReplyText('');
      } else {
        setError('Failed to send reply');
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
      const result = await updateContactStatus(submission.id, 'archived');
      
      if (result) {
        setSubmission({
          ...submission,
          status: 'archived'
        });
        
        setSuccess('Message archived successfully!');
      } else {
        setError('Failed to archive message');
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
      const result = await updateContactStatus(submission.id, 'read');
      
      if (result) {
        setSubmission({
          ...submission,
          status: 'read'
        });
        
        setSuccess('Message unarchived successfully!');
      } else {
        setError('Failed to unarchive message');
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
      const result = await deleteContactSubmission(id);
      
      if (result) {
        setSuccess('Message deleted successfully!');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/admin/contacts');
        }, 1500);
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

  return {
    submission,
    loading,
    error,
    replyText,
    setReplyText,
    actionLoading,
    success,
    handleReply,
    handleArchive,
    handleUnarchive,
    handleDelete
  };
};