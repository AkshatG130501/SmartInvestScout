import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  LineChart,
  FileText,
  ListChecks,
  Bell,
  Globe,
} from "lucide-react";
import Header from "../components/Header";

const Features: React.FC = () => {
  useEffect(() => {
    document.title = "Features - SmartInvest Scout";
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

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

  // Feature data
  const features = [
    {
      icon: <Brain className="h-10 w-10 text-indigo-600" />,
      title: "Ask Anything (Smart Chat Interface)",
      description:
        'Chat with Scout like you would with a real investment advisor. Ask anything — from "What\'s the outlook for IT stocks?" to "Summarize Reliance\'s FY24 report."',
    },
    {
      icon: <LineChart className="h-10 w-10 text-indigo-600" />,
      title: "Portfolio Insights with Context",
      description:
        "Connect your portfolio to Scout. Get personalized breakdowns, performance alerts, and actionable explanations — not just numbers.",
      comingSoon: true,
    },
    {
      icon: <FileText className="h-10 w-10 text-indigo-600" />,
      title: "Document Upload & Summary",
      description:
        "Upload PDFs like annual reports, brokerage statements, or ESG disclosures. Scout reads and explains them in plain English.",
    },
    {
      icon: <ListChecks className="h-10 w-10 text-indigo-600" />,
      title: "Personalized Recommendations",
      description:
        "Based on your risk profile, past behavior, and goals, Scout suggests investment opportunities and strategies tailored just for you.",
    },
    {
      icon: <Bell className="h-10 w-10 text-indigo-600" />,
      title: "Proactive Market Alerts",
      description:
        "Scout watches the market for you. Get notified when something relevant to your portfolio or interests happens — with context.",
    },
    {
      icon: <Globe className="h-10 w-10 text-indigo-600" />,
      title: "Topic-Based Research Assistant",
      description:
        "Whether you're curious about green energy, electric vehicles, or midcap growth, Scout pulls insights from multiple sources and gives you a consolidated view.",
    },
  ];

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
              Key Features of SmartInvest Scout
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how SmartInvest Scout transforms your investment
              experience with these powerful features.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 flex flex-col h-full relative"
              >
                {feature.comingSoon && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    Coming Soon
                  </span>
                )}
                <div className="bg-indigo-50 rounded-lg p-4 inline-flex mb-5 self-start">
                  {feature.icon}
                </div>
                <div className="mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 flex-grow">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Feature Highlight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="md:flex items-center">
              <div className="p-8 md:p-12 md:w-3/5">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Experience the power of AI in your investment decisions
                </h2>
                <p className="text-indigo-100 text-lg mb-6">
                  SmartInvest Scout combines advanced AI with financial
                  expertise to give you insights that were previously available
                  only to professional investors.
                </p>
                <a
                  href="/dashboard"
                  className="inline-block bg-white text-indigo-600 hover:bg-indigo-50 font-medium px-6 py-3 rounded-lg transition-colors duration-300"
                >
                  Try it Now
                </a>
              </div>
              <div className="md:w-2/5 bg-indigo-900 p-8 md:p-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-4">🚀</div>
                  <div className="text-white font-semibold text-xl">
                    Launching Soon
                  </div>
                  <div className="text-indigo-200 text-sm">
                    More exciting features on the way
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 text-center"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Ready to transform your investment experience?
            </h2>
            <a
              href="/dashboard"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-300"
            >
              Get Started Now
            </a>
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
            <div className="flex space-x-6">
              <a
                href="/about"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                About
              </a>
              <a
                href="/terms"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                Terms of Use
              </a>
              <a
                href="/privacy"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Features;
