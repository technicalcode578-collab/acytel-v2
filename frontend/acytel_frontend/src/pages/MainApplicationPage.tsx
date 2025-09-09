// File: src/pages/MainApplicationPage.tsx (Corrected)
import { JSX } from 'solid-js';
import Layout from '../shared/ui/Layout';

// This component now correctly accepts and renders children passed to it by the router.
const MainApplicationPage = (props: { children: JSX.Element }) => {
  return (
    <Layout>
      {props.children}
    </Layout>
  );
};

export default MainApplicationPage;