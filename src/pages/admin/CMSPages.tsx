import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import {
  CMSPage,
  createPage,
  updatePage,
  deletePage,
  getPages
} from '../../services/cms';
import AdminLayout from './layout/AdminLayout';
import PageList from '../../components/admin/cms/PageList';
import PageForm from '../../components/admin/cms/PageForm';
import Menu from '../../components/admin/cms/Menu';

export default function CMSPages() {
  const { isConnected } = useWallet();
  const { isSuperAdmin, isAdmin } = useAdmin();
  const navigate = useNavigate();

  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedPage, setSelectedPage] = useState<CMSPage | null>(null);
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await getPages();
      setPages(data);
    } catch (err: any) {
      console.error('Error loading pages:', err);
      setError(err.message || 'Error loading pages');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Omit<CMSPage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      await createPage(data);
      await loadPages();
      setSuccess('Page created successfully');
      setView('list');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error creating page:', err);
      setError(err.message || 'Error creating page');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, data: Partial<CMSPage>) => {
    try {
      setLoading(true);
      setError(null);
      await updatePage(id, data);
      await loadPages();
      setSuccess('Page updated successfully');
      setView('list');
      setSelectedPage(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating page:', err);
      setError(err.message || 'Error updating page');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (page: CMSPage) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    try {
      setLoading(true);
      setError(null);
      await deletePage(page.id);
      await loadPages();
      setSuccess('Page deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting page:', err);
      setError(err.message || 'Error deleting page');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (page: CMSPage, status: 'active' | 'inactive') => {
    try {
      setLoading(true);
      setError(null);
      await updatePage(page.id, { status });
      await loadPages();
      setSuccess('Page status updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating page status:', err);
      setError(err.message || 'Error updating page status');
    } finally {
      setLoading(false);
    }
  };

  // 🔐 Block non-admins
  if (!isSuperAdmin) {
    return (
      <AdminLayout activeTab="cms">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">Only Admins can manage CMS pages.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeTab="cms">
      <div className="space-y-6">
        <Menu 
          view={view}
          onViewChange={(newView) => {
            setView(newView);
            if (newView === 'list') {
              setSelectedPage(null);
            }
          }}
          onRefresh={loadPages}
        />

        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {view === 'form' ? (
              <div>
                <p className="mb-2 text-xs text-gray-500">[Debug] Form View Active</p>
                <h3 className="text-lg font-medium text-gray-900 mb-6">
                  {selectedPage ? 'Edit Page' : 'Create New Page'}
                </h3>
                <PageForm
                  initialData={selectedPage || undefined}
                  onSubmit={selectedPage ? 
                    (data) => handleUpdate(selectedPage.id, data) : 
                    handleCreate
                  }
                  onCancel={() => {
                    setView('list');
                    setSelectedPage(null);
                  }}
                  loading={loading}
                />
              </div>
            ) : (
              <div>
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h3 className="text-lg font-medium text-gray-900">CMS Pages</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage your website's content pages
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button
                      onClick={() => setView('form')}
                      className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
                    >
                      Create Page
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <PageList
                    pages={pages}
                    onEdit={(page) => {
                      setSelectedPage(page);
                      setView('form');
                    }}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}