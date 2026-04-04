'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OnboardingModal from './onboarding/OnboardingModal';
import { LoadingProvider } from '@/context/LoadingContext';
import LoadingOverlay from './ui/LoadingOverlay';
import { Suspense } from 'react';
import { NavigationLoader } from './ui/NavigationLoader';

export default function Providers({ children }: { children: any }) {
    return (
        <Auth0Provider>
            <LoadingProvider>
                {/* NavigationLoader auto-hides the overlay on route settle. Must be wrapped in Suspense. */}
                <Suspense fallback={null}>
                    <NavigationLoader />
                </Suspense>
                {children}
                <OnboardingModal />
                <LoadingOverlay />
                <ToastContainer position="bottom-right" theme="colored" />
            </LoadingProvider>
        </Auth0Provider>
    );
}
