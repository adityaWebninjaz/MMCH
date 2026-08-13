import React from 'react';
import styles from './Navbar.module.css';
import LogoSection from '@/layout/MainLayout/LogoSection';
import { useNavigate } from 'react-router';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        {/* <div className={styles.logo}>
          
        </div> */}

        <LogoSection />

        {/* Nav Links */}
        {/* <nav className={styles.navLinks}>
          <a href="/deals">Deals</a>
          <a href="/community">Community</a>
        </nav> */}

        {/* CTA */}
        <button onClick={() => navigate('/login')} className={styles.signInBtn}>
          SIGN IN
        </button>
      </div>
    </header>
  );
};

export default Navbar;
