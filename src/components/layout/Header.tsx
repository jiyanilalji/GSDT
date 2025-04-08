import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon,
  ChevronDownIcon,
  WalletIcon,
  ArrowRightOnRectangleIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useWallet } from '../../hooks/useWallet';
import { useAdmin } from '../../hooks/useAdmin';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const { address, isConnected, connect, disconnect } = useWallet();
  const { isAdmin, adminRole } = useAdmin();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminRole');
      localStorage.removeItem('adminAddress');
      await disconnect();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-primary-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo and Main Navigation */}
          <div className="flex">
            <Link to="/" className="flex flex-shrink-0 items-center">
              <img 
                src="/logo.svg" 
                alt="GSDT Logo" 
                className="h-8 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }} // Make logo white
              />
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                    isActivePath(item.href)
                      ? 'border-secondary-400 text-white'
                      : 'border-transparent text-primary-100 hover:border-secondary-400/50 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet and Actions Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isConnected ? (
              <Menu as="div" className="relative ml-3">
                <Menu.Button className="flex items-center rounded-md bg-secondary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-600">
                  <WalletIcon className="h-5 w-5 mr-2" />
                  <span className="hidden md:inline">
                    {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
                  </span>
                  <span className="md:hidden">
                    {`${address?.slice(0, 4)}...`}
                  </span>
                  {adminRole && (
                    <span className="ml-2 text-xs bg-white text-secondary-700 px-1.5 py-0.5 rounded">
                      {adminRole}
                    </span>
                  )}
                  <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" />
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
                          } flex px-4 py-2 text-sm text-gray-700 items-center`}
                        >
                          <DocumentTextIcon className="h-5 w-5 mr-2" />
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
                          } flex px-4 py-2 text-sm text-gray-700 items-center`}
                        >
                          <PlusCircleIcon className="h-5 w-5 mr-2" />
                          Mint Token
                        </Link>
                      )}
                    </Menu.Item>
                    {isAdmin && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/admin/dashboard"
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex px-4 py-2 text-sm text-gray-700 items-center`}
                          >
                            <ShieldCheckIcon className="h-5 w-5 mr-2" />
                            Admin Dashboard
                          </Link>
                        )}
                      </Menu.Item>
                    )}
                    <div className="border-t border-gray-100 my-1"></div>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex w-full px-4 py-2 text-sm text-gray-700 items-center`}
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                          Disconnect
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <button
                onClick={connect}
                className="flex items-center rounded-md bg-secondary-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-secondary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-600 transition-colors duration-200"
              >
                <WalletIcon className="h-5 w-5 mr-2" />
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Menu as="div" className="relative">
              <Menu.Button className="inline-flex items-center justify-center rounded-md p-2 text-primary-100 hover:bg-primary-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
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
                  {navigation.map((item) => (
                    <Menu.Item key={item.name}>
                      {({ active }) => (
                        <Link
                          to={item.href}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } block px-4 py-2 text-sm text-gray-700`}
                        >
                          {item.name}
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                  {isConnected ? (
                    <>
                      <div className="border-t border-gray-100 my-1"></div>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/transactions"
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex px-4 py-2 text-sm text-gray-700 items-center`}
                          >
                            <DocumentTextIcon className="h-5 w-5 mr-2" />
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
                            } flex px-4 py-2 text-sm text-gray-700 items-center`}
                          >
                            <PlusCircleIcon className="h-5 w-5 mr-2" />
                            Mint Token
                          </Link>
                        )}
                      </Menu.Item>
                      {isAdmin && (
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin/dashboard"
                              className={`${
                                active ? 'bg-gray-100' : ''
                              } flex px-4 py-2 text-sm text-gray-700 items-center`}
                            >
                              <ShieldCheckIcon className="h-5 w-5 mr-2" />
                              Admin Dashboard
                            </Link>
                          )}
                        </Menu.Item>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-gray-100' : ''
                            } flex w-full px-4 py-2 text-sm text-gray-700 items-center`}
                          >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                            Disconnect
                          </button>
                        )}
                      </Menu.Item>
                    </>
                  ) : (
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={connect}
                          className={`${
                            active ? 'bg-gray-100' : ''
                          } flex w-full px-4 py-2 text-sm text-gray-700 items-center`}
                        >
                          <WalletIcon className="h-5 w-5 mr-2" />
                          Connect Wallet
                        </button>
                      )}
                    </Menu.Item>
                  )}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}