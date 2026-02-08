import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  User, 
  Calendar, 
  CheckCircle,
  Clock,
  Plus,
  Loader2
} from 'lucide-react';
import { getApiUrl } from '../../config/api';

const AssignmentCard = ({ officer, location, claimId, date, status, deadline }) => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-between h-full">
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400 font-bold">
            {officer.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">{officer}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Field Officer</p>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-bold rounded-full border
            ${status === 'Completed' 
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' 
                : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30'}`}>
            {status}
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span>{location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>Assigned: {date}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
           <Clock className="w-4 h-4 mr-2 text-red-400" />
           <span className="text-red-500 font-medium">Due: {deadline}</span>
        </div>
      </div>
    </div>
    
    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
        <div className="text-xs text-gray-400 mb-2">Claim ID: <span className="text-gray-700 dark:text-gray-300 font-mono">{claimId}</span></div>
        <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg transition-colors">
            View Report
        </button>
    </div>
  </div>
);

const FieldAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                // In a real scenario, this would be an API call
                // const res = await axios.get(getApiUrl('api/admin/field-assignments'));
                // setAssignments(res.data);
                
                // Simulating API delay and response for now as we haven't built the detailed assignment tables yet
                await new Promise(r => setTimeout(r, 1000));
                setAssignments([
                    {
                      id: 1,
                      officer: 'Amit Verma',
                      location: 'Nasik, Maharashtra',
                      claimId: 'CLM-2024-001',
                      date: '2024-10-25',
                      status: 'In Progress',
                      deadline: '2024-10-28'
                    },
                    {
                      id: 2,
                      officer: 'Priya Sharma',
                      location: 'Nagpur, Maharashtra',
                      claimId: 'CLM-2024-004',
                      date: '2024-10-24',
                      status: 'Completed',
                      deadline: '2024-10-26'
                    },
                    {
                      id: 3,
                      officer: 'Rahul Singh',
                      location: 'Pune, Maharashtra',
                      claimId: 'CLM-2024-008',
                      date: '2024-10-26',
                      status: 'In Progress',
                      deadline: '2024-10-29'
                    },
                     {
                      id: 4,
                      officer: 'Sanjay Gupta',
                      location: 'Aurangabad, Maharashtra',
                      claimId: 'CLM-2024-012',
                      date: '2024-10-22',
                      status: 'Completed',
                      deadline: '2024-10-25'
                    }
                  ]);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching field assignments:", error);
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    return (
        <div className="p-6 space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Field Assignments</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage field officers and verification tasks</p>
                </div>
                <button className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-600/20">
                    <Plus className="w-4 h-4" />
                    <span>New Assignment</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                     <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {assignments.map((assignment) => (
                        <AssignmentCard key={assignment.id} {...assignment} />
                    ))}
                </div>
            )}
        </div>
    );
};
export default FieldAssignments;
