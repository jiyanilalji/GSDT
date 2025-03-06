import { motion } from 'framer-motion';
import { ArrowPathIcon, CloudArrowUpIcon, LockClosedIcon, ChartBarIcon, CurrencyDollarIcon, ShieldCheckIcon, GlobeAltIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const features = [
  {
    name: 'Secure Transactions',
    description: 'Every transaction is protected by advanced cryptography and smart contract security.',
    icon: LockClosedIcon,
  },
  {
    name: 'Real-time Exchange Rates',
    description: 'Get up-to-date exchange rates for GSDT currencies against USDC.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Backed by Real Assets',
    description: 'GSDT is backed by a diversified basket of GSDT government bonds and securities.',
    icon: CloudArrowUpIcon,
  },
];

const benefits = [
  {
    title: 'Global Accessibility',
    description: 'Access GSDT markets from anywhere in the world with minimal barriers to entry.',
    icon: GlobeAltIcon,
  },
  {
    title: 'Cost-Effective',
    description: 'Reduce transaction costs and eliminate traditional banking fees.',
    icon: BanknotesIcon,
  },
  {
    title: 'Instant Settlement',
    description: 'Experience near-instantaneous cross-border settlements.',
    icon: ChartBarIcon,
  },
  {
    title: 'Regulatory Compliance',
    description: 'Built with compliance at its core, following all relevant regulations.',
    icon: ShieldCheckIcon,
  },
];

const currencies = [
  { code: 'CNH', name: 'Chinese Yuan', weight: '30%', color: 'bg-red-500' },
  { code: 'RUB', name: 'Russian Ruble', weight: '20%', color: 'bg-blue-500' },
  { code: 'INR', name: 'Indian Rupee', weight: '20%', color: 'bg-orange-500' },
  { code: 'BRL', name: 'Brazilian Real', weight: '15%', color: 'bg-green-500' },
  { code: 'ZAR', name: 'South African Rand', weight: '10%', color: 'bg-yellow-500' },
  { code: 'IDR', name: 'Indonesian Rupiah', weight: '5%', color: 'bg-purple-500' },
];

const metrics = [
  { id: 1, stat: '10M+', emphasis: 'GSDT', rest: 'in circulation' },
  { id: 2, stat: '50+', emphasis: 'Countries', rest: 'supported' },
  { id: 3, stat: '99.9%', emphasis: 'Uptime', rest: 'guaranteed' },
  { id: 4, stat: '24/7', emphasis: 'Support', rest: 'available' },
];

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div 
        className="relative isolate text-white min-h-[80vh] flex items-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=2000")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-7xl w-full px-6 lg:px-8 py-24 lg:py-32"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5.5xl mb-6">
                Global South Digital Token
              </h1>
              <p className="text-lg leading-8 text-gray-300 mb-10">
                A revolutionary stablecoin backed by GSDT currencies and real-world assets, bringing stability and accessibility to digital finance.
              </p>
              <div className="flex items-center gap-x-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-md bg-secondary-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-secondary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
                >
                  <Link to="/dashboard">Get started</Link>
                </motion.button>
                <motion.button
                  whileHover={{ x: 5 }}
                  className="text-sm font-semibold leading-6 text-white"
                >
                  <Link to="/about">Learn more <span aria-hidden="true">→</span></Link>
                </motion.button>
              </div>
            </div>

            {/* Currency Rates Table */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl"
            >
              <h3 className="text-xl font-semibold mb-4">Live Exchange Rates</h3>
              <div className="overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-gray-200/20">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Currency</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Rate</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">24h Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/20">
                    {[
                      { code: 'CNH', name: 'Chinese Yuan', rate: '7.2934', change: '+0.45%', positive: true },
                      { code: 'RUB', name: 'Russian Ruble', rate: '98.7623', change: '-0.32%', positive: false },
                      { code: 'INR', name: 'Indian Rupee', rate: '83.2741', change: '+0.21%', positive: true },
                      { code: 'BRL', name: 'Brazilian Real', rate: '5.0432', change: '+0.67%', positive: true },
                      { code: 'ZAR', name: 'South African Rand', rate: '19.2845', change: '-0.15%', positive: false },
                      { code: 'IDR', name: 'Indonesian Rupiah', rate: '15683.45', change: '+0.33%', positive: true }
                    ].map((currency) => (
                      <motion.tr
                        key={currency.code}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="hover:bg-white/5"
                      >
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <div className="font-medium text-white">{currency.code}</div>
                            <div className="text-gray-400 text-xs">{currency.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">${currency.rate}</td>
                        <td className={`px-4 py-3 text-sm ${currency.positive ? 'text-green-400' : 'text-red-400'}`}>
                          {currency.change}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 border-t border-gray-200/20">
                  <p className="text-xs text-gray-400">
                    Last updated: {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Currency Basket section */}
      <div className="bg-secondary-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Currency Basket</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Backed by GSDT Currencies
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              GSDT is backed by a carefully weighted basket of GSDT currencies, providing stability and diversification.
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
                  <div className={`w-12 h-12 ${currency.color} rounded-full flex items-center justify-center text-white font-bold mb-4`}>
                    {currency.code}
                  </div>
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

      {/* Benefits section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Benefits</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose GSDT?
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-y-4"
                >
                  <dt className="text-xl font-semibold leading-7 text-gray-900">
                    <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                      <benefit.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {benefit.title}
                  </dt>
                  <dd className="flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{benefit.description}</p>
                  </dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Metrics section */}
      <div className="bg-primary-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Trusted by users worldwide
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                Join the growing community of GSDT users and experience the future of digital currency
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col bg-white/5 p-8"
                >
                  <dt className="text-sm font-semibold leading-6 text-gray-300">{metric.emphasis}</dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-white">{metric.stat}</dd>
                  <dd className="text-sm text-gray-300">{metric.rest}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-primary-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Join the GSDT ecosystem today and experience the future of digital currency.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Link to="/dashboard">Get started</Link>
              </motion.button>
              <motion.button
                whileHover={{ x: 5 }}
                className="text-sm font-semibold leading-6 text-white"
              >
                <Link to="/contact">Contact us <span aria-hidden="true">→</span></Link>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}