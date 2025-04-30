import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoutes } from './components';
import { ROUTES } from './constants';
import { Layout } from './components/Layout';
import './tailwind/styles.css';
import CircularProgress from '@mui/material/CircularProgress';
import Dashboard from './pages/Dashboard';
import { useAuth } from './hooks';

// pages
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Activity = React.lazy(() => import('./pages/Activity'));
const ActivityDetails = React.lazy(() => import('./pages/ActivityDetails'));
const Cards = React.lazy(() => import('./pages/Cards'));
const SendMoney = React.lazy(() => import('./pages/SendMoney'));
const LoadMoney = React.lazy(() => import('./pages/LoadMoney'));
const Profile = React.lazy(() => import('./pages/Profile'));
const PageNotFound = React.lazy(() => import('./pages/PageNotFound'));

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Layout isAuthenticated={isAuthenticated}>
        <Suspense
          fallback={
            <div className="tw-w-full tw-h-full tw-flex tw-flex-col tw-items-center tw-justify-center">
              <CircularProgress />
            </div>
          }
        >
          <Routes>
            <Route path={ROUTES.HOME} element={<PrivateRoutes />}>
              <Route index element={<Dashboard />} />
              <Route path={ROUTES.ACTIVITY} element={<Activity />} />
              <Route path={ROUTES.CARDS} element={<Cards />} />
              <Route path={ROUTES.SEND_MONEY} element={<SendMoney />} />
              <Route path={ROUTES.LOAD_MONEY} element={<LoadMoney />} />
              <Route path={ROUTES.PROFILE} element={<Profile />} />
              <Route path={ROUTES.ACTIVITY_DETAILS} element={<ActivityDetails />} />
            </Route>

            <Route
              path={ROUTES.LOGIN}
              element={
                isAuthenticated ? <Navigate to={ROUTES.HOME} replace /> : <Login />
              }
            />
            <Route
              path={ROUTES.REGISTER}
              element={
                isAuthenticated ? <Navigate to={ROUTES.HOME} replace /> : <Register />
              }
            />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;

