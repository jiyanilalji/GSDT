'use client';

import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';
import { AdminRole } from '../../services/admin';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const { address, isConnected, connect, disconnect } = useWallet();
  const { isAdmin, adminRole, isSuperAdmin, isRegularAdmin, isModerator } = useAdmin();
  const location = useLocation();
  const isAdminPage = location.pathname.includes("/admin/");

  const handleLogout = async () => {
    try {
      // Clear admin auth from localStorage
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminRole');
      localStorage.removeItem('adminAddress');
      
      await disconnect();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Function to check if a link is active
  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };
  
  return (
    <Disclosure as="nav" className="bg-primary-900 text-white">
      {({ open: isOpen }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/">
                    <span className="text-2xl font-bold text-secondary-400">GSDT</span>
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                        isActive(item.href)
                          ? 'border-secondary-400 text-white'
                          : 'border-transparent text-primary-100 hover:border-secondary-400 hover:text-white'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  {isAdmin && (
                    <Link
                      to="/admin/kyc-requests"
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                        isAdminPage 
                          ? 'border-secondary-400 text-white' 
                          : 'border-transparent text-primary-100 hover:border-secondary-400 hover:text-white'
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {isConnected ? (
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="rounded-md bg-secondary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-secondary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-600">
                      {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                      {adminRole && (
                        <span className="ml-2 text-xs bg-white text-secondary-700 px-1 py-0.5 rounded">
                          {adminRole}
                        </span>
                      )}
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/transactions"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Transactions
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/token-minting"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block px-4 py-2 text-sm text-gray-700`}
                            >
                              Mint Tokens
                            </Link>
                          )}
                        </Menu.Item>
                        
                        {isAdmin && (
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/admin/kyc-requests"
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } block px-4 py-2 text-sm text-gray-700`}
                              >
                                Admin Dashboard
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                        
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                            >
                              Logout
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <button
                    onClick={() => connect()}
                    className="rounded-md bg-secondary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-secondary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-600"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-primary-100 hover:bg-primary-800 hover:text-white">
                  <span className="sr-only">Open main menu</span>
                  {isOpen ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                    isActive(item.href)
                      ? 'border-secondary-400 bg-primary-800 text-white'
                      : 'border-transparent text-primary-100 hover:border-secondary-400 hover:bg-primary-800 hover:text-white'
                  }`}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              
              {isAdmin && (
                <Disclosure.Button
                  as={Link}
                  to="/admin/kyc-requests"
                  className={`block py-2 pl-3 pr-4 text-base font-medium border-l-4 ${
                    isAdminPage 
                      ? 'border-secondary-400 bg-primary-800 text-white' 
                      : 'border-transparent text-primary-100 hover:border-secondary-400 hover:bg-primary-800 hover:text-white'
                  }`}
                >
                  Admin
                </Disclosure.Button>
              )}
            </div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                {isConnected ? (
                  <div className="space-y-1">
                    <Link
                      to="/transactions"
                      className={`block px-4 py-2 text-base font-medium ${
                        isActive('/transactions')
                          ? 'bg-primary-800 text-white'
                          : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                      }`}
                    >
                      Transactions
                    </Link>
                    <Link
                      to="/token-minting"
                      className={`block px-4 py-2 text-base font-medium ${
                        isActive('/token-minting')
                          ? 'bg-primary-800 text-white'
                          : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                      }`}
                    >
                      Mint Tokens
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/kyc-requests"
                        className={`block px-4 py-2 text-base font-medium ${
                          isAdminPage
                            ? 'bg-primary-800 text-white'
                            : 'text-primary-100 hover:bg-primary-800 hover:text-white'
                        }`}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-primary-100 hover:bg-primary-800 hover:text-white"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => connect()}
                    className="w-full rounded-md bg-secondary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-secondary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-600"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}