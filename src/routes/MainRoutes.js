import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import { element } from 'prop-types';
import { Typography } from '@mui/material';
import { Children } from 'react';



const PrivacyPolicy = Loadable(lazy(() => import('views/pages/policy.js')));
const TermsAndConditions = Loadable(lazy(() => import('views/pages/terms.js')));



 

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path : '/',
  children : [
    {
      path: '/privacy_policy',
      element: <PrivacyPolicy />,
    },
    {
      path: '/terms',
      element: <TermsAndConditions />,
    }
  ]
};

export default MainRoutes;
