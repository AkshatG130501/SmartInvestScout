import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { ArrowLeft, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileSetup from '../components/ProfileSetup';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const navigate = useNavigate();
  const [editingProfile, setEditingProfile] = useState(false);

  const handleProfileUpdateComplete = async () => {
    setEditingProfile(false);
    await refreshProfile();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={
                user?.user_metadata?.avatar_url ||
                'https://via.placeholder.com/96'
              }
              alt="Profile"
              className="w-24 h-24 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.user_metadata?.full_name || 'Guest User'}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account Created
                </label>
                <p className="mt-1 text-gray-900">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Sign In
                </label>
                <p className="mt-1 text-gray-900">
                  {user?.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Profile Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Investment Profile
            </h2>
            {profile && !editingProfile && (
              <button
                onClick={() => setEditingProfile(true)}
                className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
              >
                <Edit className="h-4 w-4 mr-1" />
                <span>Edit</span>
              </button>
            )}
          </div>

          {editingProfile ? (
            <ProfileSetup onComplete={handleProfileUpdateComplete} />
          ) : profile ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Risk Appetite</h3>
                <p className="text-gray-900 capitalize">{profile.risk_appetite}</p>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Investment Goals</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.investment_goals.map((goal, index) => (
                    <span 
                      key={index} 
                      className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                    >
                      {goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Watchlist / Interests</h3>
                {profile.watchlist.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.watchlist.map((item, index) => (
                      <span 
                        key={index} 
                        className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No items in watchlist</p>
                )}
              </div>
              
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Holdings</h3>
                {profile.holdings.length > 0 ? (
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Symbol
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {profile.holdings.map((holding, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {holding.symbol}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {holding.name}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              {holding.quantity || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No holdings added</p>
                )}
              </div>
            </div>
          ) : (
            <ProfileSetup onComplete={handleProfileUpdateComplete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
