'use client';

// @ts-ignore
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
// @ts-ignore
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function AdminStats({
    totalTutors,
    approvedTutors,
    pendingTutors,
    complaints
}: {
    totalTutors: number;
    approvedTutors: number;
    pendingTutors: number;
    complaints: number;
}) {
    const tutorData = {
        labels: ['Approved', 'Pending', 'Rejected'],
        datasets: [
            {
                label: '# of Tutors',
                data: [approvedTutors, pendingTutors, totalTutors - approvedTutors - pendingTutors],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tutor Definitions</h3>
                <div className="h-64 flex justify-center">
                    <Doughnut data={tutorData} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col justify-center items-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Total Open Complaints</h3>
                <p className="text-5xl font-bold text-red-500">{complaints}</p>
                <p className="text-sm text-gray-500 mt-2">Requires attention</p>
            </div>
        </div>
    );
}
