import React from 'react';
import { 
  MapPin, 
  User, 
  Calendar, 
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';

const AssignmentCard = ({ officer, location, claimId, date, status, deadline }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
    <div>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
            {officer.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">{officer}</h4>
            <p className="text-xs text-gray-500">Field Inspector</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium 
          ${status === 'Completed' ? 'bg-green-100 text-green-700' : 
            status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
          {status}
        </span>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          {location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Claim ID:</span> {claimId}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          Assign: {date}
        </div>
         <div className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          <Clock className="w-4 h-4 mr-2" />
          Deadline: {deadline}
        </div>
      </div>
    </div>

    <div className="flex space-x-2 mt-auto">
      <button className="flex-1 py-2 px-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
        View Report
      </button>
      <button className="flex-1 py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
        Track
      </button>
    </div>
  </div>
);

const FieldAssignments = () => {
    const assignments = [
        { officer: 'Amit Verma', location: 'Nashik, District 4', claimId: 'CLM-001', date: 'Oct 24', deadline: 'Oct 28', status: 'Pending' },
        { officer: 'Priya Sharma', location: 'Pune, Rural', claimId: 'CLM-009', date: 'Oct 22', deadline: 'Oct 25', status: 'Completed' },
        { officer: 'Rohan Gil', location: 'Nagpur, Zone A', claimId: 'CLM-012', date: 'Oct 25', deadline: 'Oct 30', status: 'Assigned' },
        { officer: 'Sneha Patil', location: 'Aurangabad, East', claimId: 'CLM-045', date: 'Oct 24', deadline: 'Oct 29', status: 'Pending' },
    ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Field Officer Assignments</h2>
        <button className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Assign New</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {assignments.map((item, idx) => (
            <AssignmentCard key={idx} {...item} />
        ))}
      </div>
    </div>
  );
};

export default FieldAssignments;
