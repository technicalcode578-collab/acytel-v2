// File: /workspaces/acytel-v2/frontend/acytel_frontend/src/pages/MainApplicationPage.tsx
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