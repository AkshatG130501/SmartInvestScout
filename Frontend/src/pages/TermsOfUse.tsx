import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfUse: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Terms of Use - SmartInvest Scout";
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
              Terms of Use
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
              Welcome to SmartInvest Scout ("we", "our", or "us"). These Terms
              of Use ("Terms") govern your access to and use of our application,
              website, and related services (collectively, the "Service"). By
              accessing or using the Service, you agree to be bound by these
              Terms.
            </p>

            <p className="mb-6">
              If you do not agree to these Terms, please do not use the Service.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              1. Eligibility
            </h2>
            <p className="mb-6">
              You must be at least 18 years old and capable of entering into a
              legally binding agreement under applicable law to use SmartInvest
              Scout. By using the Service, you represent and warrant that you
              meet these requirements.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              2. Our Services
            </h2>
            <p className="mb-4">
              SmartInvest Scout provides tools and insights to help users make
              informed financial decisions. These include:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">
                AI-powered responses to investment-related questions
              </li>
              <li className="mb-2">
                Portfolio tracking and integration via third-party brokers
              </li>
              <li className="mb-2">
                Document uploads (e.g., annual reports) for analysis
              </li>
              <li className="mb-2">
                Personalized financial insights based on user data
              </li>
            </ul>
            <p className="mb-6 font-medium dark:text-gray-300 transition-colors duration-300">
              Note: We are not a SEBI-registered investment advisor or broker.
              Nothing in the app constitutes financial advice or a
              recommendation to buy/sell any securities.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              3. User Responsibilities
            </h2>
            <p className="mb-4">You agree to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">
                Provide accurate and up-to-date information
              </li>
              <li className="mb-2">Keep your login credentials secure</li>
              <li className="mb-2">Use the Service for lawful purposes only</li>
              <li className="mb-2">
                Not upload malicious, misleading, or unauthorized content
              </li>
            </ul>
            <p className="mb-6">
              You are solely responsible for any activity under your account.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              4. Third-Party Integrations
            </h2>
            <p className="mb-6">
              SmartInvest Scout may allow you to connect accounts from
              third-party platforms (e.g., brokers like Alpaca, Zerodha, Upstox,
              etc.) to import your portfolio data. By using this feature:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">
                You authorize us to access and process your data
              </li>
              <li className="mb-2">
                You acknowledge that third-party services are governed by their
                own terms and privacy policies
              </li>
              <li className="mb-2">
                We are not responsible for the accuracy, reliability, or
                availability of third-party data
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              5. Document Uploads
            </h2>
            <p className="mb-6">
              Users may upload financial documents (e.g., PDFs of annual
              reports) to receive insights. By uploading:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">
                You confirm you have the right to use and share the content
              </li>
              <li className="mb-2">
                You grant us permission to analyze and temporarily store the
                content
              </li>
              <li className="mb-2">
                We do not share your documents with any third party without
                consent
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              6. Acceptable Use
            </h2>
            <p className="mb-6">You may not:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">
                Use bots or scrapers to access the service
              </li>
              <li className="mb-2">Interfere with or disrupt the Service</li>
              <li className="mb-2">
                Use the Service to engage in illegal or fraudulent activity
              </li>
              <li className="mb-2">
                Attempt to reverse-engineer or modify the Service
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              7. Disclaimer of Warranties
            </h2>
            <p className="mb-6">
              The Service is provided "as is" and "as available" without
              warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">Accuracy or completeness of insights</li>
              <li className="mb-2">
                Future performance of any financial asset
              </li>
              <li className="mb-2">
                That the Service will be error-free or uninterrupted
              </li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              8. Limitation of Liability
            </h2>
            <p className="mb-6">
              To the maximum extent permitted by law, we will not be liable for
              any direct, indirect, incidental, or consequential damages arising
              from your use of the Service, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 dark:text-gray-300 transition-colors duration-300">
              <li className="mb-2">Loss of profits or investment</li>
              <li className="mb-2">Loss of data</li>
              <li className="mb-2">Unauthorized access to your account</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              9. Privacy
            </h2>
            <p className="mb-6">
              Our use of your data is governed by our Privacy Policy. By using
              the Service, you consent to our data practices as outlined in that
              policy.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              10. Modifications
            </h2>
            <p className="mb-6">
              We may modify these Terms at any time. We will notify you of
              changes via email or app notification. Continued use of the
              Service constitutes acceptance of the updated Terms.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              11. Termination
            </h2>
            <p className="mb-6">
              We may suspend or terminate your access to the Service at any time
              for violation of these Terms. You may also terminate your account
              at any time.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4 transition-colors duration-300">
              12. Governing Law
            </h2>
            <p className="mb-6">
              These Terms are governed by the laws of India. All disputes shall
              be subject to the exclusive jurisdiction of the courts in
              Bangalore, India.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfUse;
