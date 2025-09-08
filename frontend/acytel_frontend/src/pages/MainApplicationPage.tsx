// File: src/pages/MainApplicationPage.tsx (Corrected)
import { Component } from 'solid-js';
import Layout from '../shared/ui/Layout';
import { HomePage } from './HomePage'; // Import the new HomePage component

// This component now serves as the main entry point for the logged-in experience.
// It sets up the Layout and renders the primary content, which is our new HomePage.
const MainApplicationPage: Component = () => {
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
};

export default MainApplicationPage;