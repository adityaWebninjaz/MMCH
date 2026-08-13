import React from 'react';
import styles from './PrivacyPolicy.module.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const PrivacyPolicy = () => {
  return (
    <>
      <div className={styles.page}>
        <Navbar />
        <div className={styles.container}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <div className={styles.hr} />
          <section>
            <h2>1. Data Collection</h2>
            <p>We collect data when you sign up, explore deals, show interest, or interact with our AI chatbot. This may include:</p>
            <ul>
              <li>Name, email, phone number</li>
              <li>Investment preferences</li>
              <li>Device and usage data</li>
              <li>Communication history with our support or chatbot</li>
            </ul>
          </section>

          <section>
            <h2>2. Use of Data</h2>
            <p>Your data is used to:</p>
            <ul>
              <li>Personalize your experience</li>
              <li>Recommend relevant opportunities</li>
              <li>Enable communication with partners</li>
              <li>Improve platform performance</li>
            </ul>
            <p className={styles.note}>We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2>3. Data Sharing</h2>
            <ul>
              <li>With partners only when you express interest</li>
              <li>With regulators if required by law</li>
              <li>With trusted service providers</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Security</h2>
            <p>We use encryption, access controls, and secure storage methods. However, no system is 100% secure.</p>
          </section>

          <section>
            <h2>5. Cookie Policy</h2>
            <p>
              Cookies help us enhance performance and personalize your experience. You can manage cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2>6. Your Rights</h2>
            <ul>
              <li>Request access to your data</li>
              <li>Ask for correction or deletion</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2>7. Contact Us</h2>
            <p>
              For questions related to this Privacy Policy, contact us at: <a href="mailto:support@pmch.com">support@pmch.com</a>
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
