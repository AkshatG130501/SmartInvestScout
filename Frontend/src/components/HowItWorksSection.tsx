import React from "react";
import { motion } from "framer-motion";
import {
  Search,
  AlertCircle,
  BarChart,
  MessageSquare,
  Upload,
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  delay,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true, margin: "-100px" }}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6"
    >
      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const HowItWorksSection: React.FC = () => {
  const features = [
    {
      icon: <Search className="h-6 w-6 text-indigo-600" />,
      title: "Search Any Stock or Topic",
      description:
        "Simply type in a ticker symbol, company name, or investment topic to get started.",
    },
    {
      icon: <BarChart className="h-6 w-6 text-indigo-600" />,
      title: "Get AI-Powered Insights",
      description:
        "Our AI analyzes thousands of sources to deliver relevant, contextualized information.",
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-indigo-600" />,
      title: "Understand Key Risks",
      description:
        "Identify potential risks and market concerns that could impact your investment decisions.",
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-indigo-600" />,
      title: "Ask Follow-Up Questions",
      description:
        "Engage in a natural conversation to dive deeper into specific aspects of your research.",
    },
    {
      icon: <Upload className="h-6 w-6 text-indigo-600" />,
      title: "Upload Financial Documents",
      description:
        "Get instant summaries and analysis from earnings reports, 10-Ks, and other financial documents.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-16 md:py-24 bg-gradient-to-b from-slate-100 to-white"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            SmartInvest Scout simplifies investment research by leveraging AI to
            deliver actionable insights, helping you make better investment
            decisions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
