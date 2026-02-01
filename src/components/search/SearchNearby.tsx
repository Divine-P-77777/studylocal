'use client';

import { MapPin, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function SearchNearby() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSearchNearby = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    // Use OpenStreetMap Nominatim for reverse geocoding
                    // Note: In production, consider a paid service or ensuring compliance with usage policy.
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
                        {
                            headers: {
                                'User-Agent': 'StudyLocal-App/1.0'
                            }
                        }
                    );

                    const data = await response.json();

                    // Extract city/area/suburb
                    const address = data.address;
                    const area = address.suburb || address.city_district || address.city || address.town || address.village;

                    if (area) {
                        toast.success(`Locating tutors in ${area}`);
                        router.push(`/tutors?area=${encodeURIComponent(area)}`);
                    } else {
                        toast.error("Could not determine your area from location");
                    }
                } catch (error) {
                    console.error("Geocoding error:", error);
                    toast.error("Failed to get location details");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                let msg = "Error getting location";
                if (error.code === error.PERMISSION_DENIED) msg = "Location permission denied";
                toast.error(msg);
                setLoading(false);
            }
        );
    };

    return (
        <button
            onClick={handleSearchNearby}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-green-500 hover:text-green-600 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Search based on your current location"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <MapPin className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">Use My Location</span>
        </button>
    );
}
