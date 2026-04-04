'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OnboardingModal from './onboarding/OnboardingModal';
import { LoadingProvider } from '@/context/LoadingContext';
import LoadingOverlay from './ui/LoadingOverlay';

export default function Providers({ children }: { children: any }) {
    return (
        <Auth0Provider>
            <LoadingProvider>
                {children}
                <OnboardingModal />
                <LoadingOverlay />
                <ToastContainer position="bottom-right" theme="colored" />
            </LoadingProvider>
        </Auth0Provider>
    );
}
