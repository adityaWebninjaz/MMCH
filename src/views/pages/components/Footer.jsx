'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import LogoSection from '@/layout/MainLayout/LogoSection';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.logoContainer}>
          <LogoSection />
        </div>

        {/* Links */}
        {/* <nav className={styles.links}>
          <Link to="/community">Community</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/data-deletion-policy">Data Deletion Policy</Link>
          <Link to="/support">Support</Link>
          <Link to="/terms-and-conditions">Terms And Conditions</Link>
          <Link to="/deal-sourcing">Deal Sourcing</Link>
          <Link to="/associate-partner">Become an Associate Partner</Link>
        </nav> */}

        {/* Divider */}
        <div className={styles.divider} />

        {/* Copyright */}
        <p className={styles.copy}>© 2025 PMCH.</p>
      </div>
    </footer>
  );
};

export default Footer;
