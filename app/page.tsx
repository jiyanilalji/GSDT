'use client';

import { ArrowPathIcon, CloudArrowUpIcon, LockClosedIcon, ChartBarIcon, CurrencyDollarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const features = [
  {
    name: 'Secure Transactions',
    description: 'Every transaction is protected by advanced cryptography and smart contract security.',
    icon: LockClosedIcon,
  },
  {
    name: 'Real-time Exchange Rates',
    description: 'Get up-to-date exchange rates for BRICS currencies against USDC.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Backed by Real Assets',
    description: 'GSDT is backed by a diversified basket of BRICS government bonds and securities.',
    icon: CloudArrowUpIcon,
  },
];

const stats = [
  { id: 1, name: 'Total Supply', value: '10M GSDT', icon: ChartBarIcon },
  { id: 2, name: 'Current Price', value: '$1.00 USDC', icon: CurrencyDollarIcon },
  { id: 3, name: 'Holders', value: '5,000+', icon: ShieldCheckIcon },
  { id: 4, name: 'Countries', value: '50+', icon: CloudArrowUpIcon },
];

const currencies = [
  { code: 'CNH', name: 'Chinese Yuan', weight: '30%' },
  { code: 'RUB', name: 'Russian Ruble', weight: '20%' },
  { code: 'INR', name: 'Indian Rupee', weight: '20%' },
  { code: 'BRL', name: 'Brazilian Real', weight: '15%' },
  { code: 'ZAR', name: 'South African Rand', weight: '10%' },
  { code: 'IDR', name: 'Indonesian Rupiah', weight: '5%' },
];

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate bg-primary-900 text-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40"
        >
          <div className="px-6 lg:px-0 lg:pt-4">
            <div className="mx-auto max-w-2xl">
              <div className="max-w-lg">
                <h1 className="mt-10 text-4xl font-bold tracking-tight sm:text-6xl">
                  Global South Digital Token
                </h1>
                <p className="mt-6 text-lg leading-8 text-primary-100">
                  A revolutionary stablecoin backed by BRICS currencies and real-world assets, bringing stability and accessibility to digital finance.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="#"
                    className="rounded-md bg-secondary-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
                  >
                    Get started
                  </motion.a>
                  <motion.a 
                    whileHover={{ x: 5 }}
                    href="#" 
                    className="text-sm font-semibold leading-6 text-white"
                  >
                    Learn more <span aria-hidden="true">→</span>
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Currency Basket section */}
      <div className="bg-secondary-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Currency Basket</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Backed by BRICS Currencies
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              GSDT is backed by a carefully weighted basket of BRICS currencies, providing stability and diversification.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {currencies.map((currency) => (
                <motion.div
                  key={currency.code}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm"
                >
                  <dt className="text-2xl font-semibold leading-7 text-primary-700">
                    {currency.code}
                  </dt>
                  <dd className="mt-1 text-base leading-7 text-gray-600">
                    {currency.name}
                  </dd>
                  <dd className="mt-4 text-xl font-bold text-secondary-600">
                    {currency.weight}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="bg-primary-900 text-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-secondary-400">Faster transactions</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need in a stablecoin
            </p>
            <p className="mt-6 text-lg leading-8 text-primary-100">
              GSDT combines the stability of BRICS currencies with the efficiency of blockchain technology.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col"
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                    <feature.icon className="h-5 w-5 flex-none text-secondary-400" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-primary-100">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-secondary-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Trusted by users worldwide
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                GSDT is rapidly becoming the preferred stablecoin for cross-border transactions
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col bg-white p-8"
                >
                  <dt className="text-sm font-semibold leading-6 text-gray-600">
                    <stat.icon className="mx-auto h-6 w-6 text-primary-600 mb-2" />
                    {stat.name}
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-secondary-600">
                    {stat.value}
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}