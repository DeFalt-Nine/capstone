import React from 'react';
import AnimatedElement from '../components/AnimatedElement';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <section id="privacy-policy" className="py-20 md:py-32 bg-white overflow-hidden">
      <AnimatedElement>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto prose lg:prose-lg text-slate-700">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Privacy Policy for Visit La Trinidad</h1>
            <p className="lead text-slate-500">Last Updated: October 26, 2025</p>

            <h2>1. Introduction</h2>
            <p>
              Welcome to Visit La Trinidad. This website is a conceptual project designed to provide tourism information. We are committed to transparency regarding our data practices. This Privacy Policy explains how we collect, use, and handle your information.
            </p>

            <h2>2. What Data We Collect</h2>
            <p>
              When you interact with our AI-powered travel assistant ("La Trinidad Guide"), we may collect the following types of data if you provide consent:
            </p>
            <ul>
              <li><strong>Chat Interactions:</strong> Anonymized transcripts of your conversations with the chatbot. This includes your questions and the AI's responses. We do not collect personal identifiers like your name, IP address, or email unless you voluntarily provide them in the chat.</li>
              <li><strong>Interaction Patterns:</strong> We analyze which tourist spots, activities, or topics are most frequently discussed to understand user interests and popular trends.</li>
            </ul>

            <h2>3. How We Use Your Data</h2>
            <p>The data we collect is used for the following purposes:</p>
            <ul>
              <li><strong>To Improve Our Services:</strong> By analyzing what users ask, we can improve the knowledge base and helpfulness of our AI assistant.</li>
              <li><strong>To Identify Trends:</strong> Understanding which locations are most popular helps us feature relevant content and improve the website for future visitors.</li>
              <li><strong>For Commercial Purposes:</strong> Anonymized and aggregated data about popular trends (e.g., "most asked-about restaurants" or "top hiking spots") may be compiled into reports. These reports may be shared with or sold to local tourism stakeholders, businesses, or market research firms to help them improve their offerings and understand tourist needs.</li>
            </ul>
            
            <h2>4. Data Sharing and Selling</h2>
            <p>
              We are transparent about our business model. The insights derived from aggregated, anonymized user interaction data are a potential asset. We may sell reports based on this data to third parties. <strong>We will never sell data that personally identifies you.</strong> All shared data is stripped of personal information and presented in an aggregated format.
            </p>

            <h2>5. Your Choices and Consent</h2>
            <p>
              Data collection is contingent on your consent. When you first visit our site, you will be presented with a consent banner. You have the choice to accept or decline our data collection practices. If you decline, no data from your chat sessions will be stored or analyzed. You can continue to use the website and chatbot fully, regardless of your choice.
            </p>

            <h2>6. Data Security</h2>
            <p>
              We take reasonable measures to protect the information we collect from loss, misuse, and unauthorized access or disclosure.
            </p>
            
            <h2>7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@visitlatrinidad.ph" className="text-lt-orange hover:text-lt-red hover:underline font-semibold transition-colors">privacy@visitlatrinidad.ph</a>.
            </p>
          </div>
        </div>
      </AnimatedElement>
    </section>
  );
};

export default PrivacyPolicyPage;