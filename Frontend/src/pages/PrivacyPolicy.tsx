import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Privacy Policy - SmartInvest Scout";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-white dark:bg-gray-800 shadow-sm z-10 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">
              Privacy Policy
            </h1>
            <div className="w-16"></div> {/* Empty div for balanced spacing */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 md:p-8 transition-colors duration-300">
          <div className="prose prose-slate dark:prose-invert max-w-none transition-colors duration-300">
            <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">Effective Date: May 24, 2025</p>

            <p className="mb-6">
              SmartInvest Scout ("we", "our", or "us") is committed to
              protecting your privacy. This Privacy Policy outlines how we
              collect, use, and protect your information when you use our
              application and services (the "Service").
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              1. Information We Collect
            </h2>
            <p className="mb-4">
              We may collect the following types of information:
            </p>

            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-6 mb-3 transition-colors duration-300">
              a) Personal Information
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">Name, email address, contact number</li>
              <li className="mb-2">
                Authentication credentials (if using social or broker logins)
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-6 mb-3 transition-colors duration-300">
              b) Financial Information
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">
                Portfolio data imported via APIs (e.g., holdings, transactions,
                P&L)
              </li>
              <li className="mb-2">
                Uploaded documents like annual reports or statements
              </li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-6 mb-3 transition-colors duration-300">
              c) Technical Information
            </h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">Device and browser type</li>
              <li className="mb-2">
                IP address, app usage logs, and crash data
              </li>
              <li className="mb-2">
                Cookies and tracking data (for analytics and session continuity)
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              2. How We Use Your Data
            </h2>
            <p className="mb-4">We use your data to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">
                Provide financial insights based on your queries and portfolio
              </li>
              <li className="mb-2">
                Summarize and interpret uploaded documents
              </li>
              <li className="mb-2">
                Improve app performance and personalize your experience
              </li>
              <li className="mb-2">
                Communicate updates and relevant content (if opted in)
              </li>
            </ul>
            <p className="mb-6 font-medium">
              We do not sell or share your data with third-party advertisers.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              3. Document Uploads
            </h2>
            <p className="mb-4">
              When you upload financial documents (e.g., PDFs):
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">
                We temporarily store and process them to generate insights
              </li>
              <li className="mb-2">
                Documents are not shared with third parties
              </li>
              <li className="mb-2">
                You can delete uploaded documents from your dashboard at any
                time
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              4. Third-Party Integrations
            </h2>
            <p className="mb-6">
              We may integrate with brokers (e.g., Alpaca, Zerodha, Upstox) or
              AI providers (e.g., Perplexity's Sonar) to deliver insights. These
              services may collect and use your data according to their
              respective privacy policies.
            </p>
            <p className="mb-6">
              You authorize us to access your data from these providers only
              with your explicit consent (e.g., OAuth login).
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              5. Data Retention
            </h2>
            <p className="mb-4">We retain your personal and financial data:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">As long as your account remains active</li>
              <li className="mb-2">
                Or until you request deletion under "Your Rights"
              </li>
            </ul>
            <p className="mb-6">
              Some data may be retained for compliance or legal obligations.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              6. Your Rights
            </h2>
            <p className="mb-4">As a user, you have the right to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">Access and review your personal data</li>
              <li className="mb-2">
                Request correction or deletion of your data
              </li>
              <li className="mb-2">Withdraw consent and close your account</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              7. Security Practices
            </h2>
            <p className="mb-4">
              We implement best-practice security measures:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">Encrypted storage of sensitive data</li>
              <li className="mb-2">OAuth 2.0 and secure API access</li>
              <li className="mb-2">Access control and activity monitoring</li>
            </ul>
            <p className="mb-6">
              However, no method of transmission over the internet is 100%
              secure. Use the Service at your own discretion.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              8. Children's Privacy
            </h2>
            <p className="mb-6">
              Our Service is not intended for children under 18. We do not
              knowingly collect data from minors.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              9. Changes to This Policy
            </h2>
            <p className="mb-6">
              We may update this Privacy Policy from time to time. Any changes
              will be communicated via app notifications or email.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
