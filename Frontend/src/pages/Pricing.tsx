import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Lock, Shield } from "lucide-react";
import Header from "../components/Header";

const Pricing: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Pricing plans data
  const plans = [
    {
      name: "Basic",
      price: "Free / TBD",
      features: ["Limited access", "5 queries/month", "Basic chat support", "Market insights"],
      popular: false,
      color: "bg-gray-100",
      buttonColor: "bg-gray-500 hover:bg-gray-600",
    },
    {
      name: "Pro",
      price: "TBD/month",
      features: [
        "Unlimited queries",
        "Portfolio sync",
        "Document uploads",
        "Detailed reports",
        "Priority support",
      ],
      popular: true,
      color: "bg-indigo-100",
      buttonColor: "bg-indigo-600 hover:bg-indigo-700",
    },
    {
      name: "Enterprise",
      price: "TBD/month",
      features: [
        "Team dashboard",
        "Custom insights",
        "API access",
        "Dedicated support",
        "Advanced analytics",
        "Custom integrations",
      ],
      popular: false,
      color: "bg-purple-100",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  // Comparison table data
  const comparisonFeatures = [
    { name: "Smart Chat Queries", basic: "5/month", pro: "Unlimited", enterprise: "Unlimited" },
    { name: "Portfolio Insights", basic: "Basic", pro: "Advanced", enterprise: "Custom" },
    { name: "Document Processing", basic: "3/month", pro: "20/month", enterprise: "Unlimited" },
    { name: "Market Alerts", basic: "Limited", pro: "Full Access", enterprise: "Priority" },
    { name: "Support", basic: "Email", pro: "Priority Email", enterprise: "Dedicated" },
    { name: "API Access", basic: "—", pro: "—", enterprise: "✓" },
    { name: "Team Members", basic: "1", pro: "3", enterprise: "Unlimited" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setEmail("");
      
      // Reset submitted state after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Pricing Plans — Coming Soon
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              SmartInvest Scout is currently completely free for early users.
              We're fine-tuning the experience and gathering feedback from our
              community before we roll out paid plans.
            </p>
          </motion.div>

          {/* Early Access Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md p-8 mb-16 text-white text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Early Access = Full Access</h2>
            <p className="text-lg mb-6">
              Right now, all features are available at no cost.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-indigo-200" />
                <span>Portfolio insights</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-indigo-200" />
                <span>Document uploads</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-indigo-200" />
                <span>Smart chat</span>
              </div>
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2 text-indigo-200" />
                <span>Market alerts</span>
              </div>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <motion.div
            className="mb-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Future Plans (Preview)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`rounded-xl shadow-md overflow-hidden border border-gray-200 relative ${
                    plan.popular ? "transform md:-translate-y-4" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 inset-x-0 bg-indigo-600 text-white text-xs font-medium text-center py-1">
                      Most Popular
                    </div>
                  )}
                  <div
                    className={`${plan.color} p-6 ${
                      plan.popular ? "pt-8" : "pt-6"
                    }`}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{plan.price}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 bg-white">
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      <button
                        disabled
                        className={`w-full ${plan.buttonColor} text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center opacity-70 cursor-not-allowed`}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center text-gray-500 mt-4 text-sm">
              All plans will include a free trial and flexible upgrade options.
            </div>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 relative">
              <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-10">
                <div className="bg-white bg-opacity-90 rounded-lg px-6 py-4 shadow-md flex items-center">
                  <Lock className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-gray-700 font-medium">
                    Detailed comparison coming soon
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 opacity-40">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Feature
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Basic
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Pro
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Enterprise
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {comparisonFeatures.map((feature, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {feature.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {feature.basic}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {feature.pro}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {feature.enterprise}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Email Notification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-8 mb-16 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Want early access to pricing?
            </h2>
            <p className="text-gray-600 mb-6">
              Leave your email and we'll notify you when plans launch.
            </p>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-grow px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting || isSubmitted}
                  className={`px-6 py-2 rounded-lg font-medium flex items-center justify-center transition-colors duration-200 ${
                    isSubmitted
                      ? "bg-green-500 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
                  ) : isSubmitted ? (
                    <span>Subscribed!</span>
                  ) : (
                    <>
                      <span>Notify Me</span>
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Transparent Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">
                Transparent Pricing, Always
              </h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              No hidden fees. No surprise charges. When we introduce pricing,
              you'll be the first to know — and you'll have a say in shaping it.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              © {new Date().getFullYear()} SmartInvest Scout. All rights
              reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="/"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                Home
              </a>
              <a
                href="/features"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                Features
              </a>
              <a
                href="/privacy"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="/about"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                About
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
