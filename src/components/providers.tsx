'use client';

import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { ReactLenis } from '@studio-freight/react-lenis';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import OnboardingModal from './onboarding/OnboardingModal';

export default function Providers({ children }: { children: any }) {
    return (
        <Auth0Provider>
            <ReactLenis root>
                {children}
                <OnboardingModal />
                <ToastContainer position="bottom-right" theme="colored" />
            </ReactLenis>
        </Auth0Provider>
    );
}
