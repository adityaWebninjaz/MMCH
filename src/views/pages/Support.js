'use client';
import React from 'react';
import styles from './Support.module.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Support = () => {
  return (
    <>
      {' '}
      <section className={styles.page}>
        <Navbar />
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Support</h1>
            <p className={styles.subtitle}>Fill out the form below and we&apos;ll get back to you as soon as possible.</p>
          </div>
          <div className={styles.hr} />
          {/* Card */}
          <div className={styles.card}>
            <form className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" placeholder="Enter your name" />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" placeholder="Enter your email" />
              </div>

              <div className={styles.field}>
                <label htmlFor="subject">Subject</label>
                <input id="subject" name="subject" type="text" placeholder="Enter your subject" />
              </div>

              <div className={styles.field}>
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={6} placeholder="Please describe your issue in detail" />
              </div>

              <button type="submit" className={styles.submitBtn}>
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Support;
