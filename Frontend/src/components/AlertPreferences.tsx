import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Save, 
  Plus,
  X,
  Clock,
  Mail,
  Smartphone,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAlertPreferences, updateAlertPreferences } from '../lib/api/alerts';
import { AlertPreferences as AlertPreferencesType } from '../lib/types/alerts';

interface AlertPreferencesProps {
  onSaved?: () => void;
  className?: string;
}

const AlertPreferences: React.FC<AlertPreferencesProps> = ({ 
  onSaved,
  className = ''
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [preferences, setPreferences] = useState<AlertPreferencesType>({
    userId: user?.id || '',
    companies: [],
    sectors: [],
    frequency: 'daily',
    notificationChannels: ['app'],
    minImpactLevel: 'medium'
  });
  
  // New item inputs
  const [newCompany, setNewCompany] = useState('');
  const [newSector, setNewSector] = useState('');

  // Suggested companies and sectors
  const suggestedCompanies = [
    'Reliance Industries', 'TCS', 'HDFC Bank', 'Infosys', 'ICICI Bank',
    'HUL', 'Bharti Airtel', 'SBI', 'Bajaj Finance', 'Kotak Mahindra Bank'
  ];
  
  const suggestedSectors = [
    'Banking', 'IT', 'Pharma', 'Auto', 'FMCG', 
    'Energy', 'Telecom', 'Infrastructure', 'PSU Banks', 'Green Energy'
  ];

  useEffect(() => {
    if (user?.id) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const fetchedPreferences = await getAlertPreferences(user?.id || '');
      setPreferences(fetchedPreferences);
      setError(null);
    } catch (err) {
      setError('Failed to load preferences. Please try again later.');
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Make sure userId is set
      const prefsToSave = {
        ...preferences,
        userId: user?.id || ''
      };
      
      const success = await updateAlertPreferences(prefsToSave);
      
      if (success) {
        setSuccess('Alert preferences saved successfully');
        if (onSaved) onSaved();
      } else {
        setError('Failed to save preferences');
      }
    } catch (err) {
      setError('An error occurred while saving preferences');
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
      
      // Clear success message after 3 seconds
      if (success) {
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    }
  };

  const addCompany = () => {
    if (!newCompany.trim()) return;
    
    // Check if company already exists
    if (preferences.companies.includes(newCompany.trim())) {
      setError('This company is already in your list');
      return;
    }
    
    setPreferences(prev => ({
      ...prev,
      companies: [...prev.companies, newCompany.trim()]
    }));
    
    setNewCompany('');
    setError(null);
  };

  const removeCompany = (company: string) => {
    setPreferences(prev => ({
      ...prev,
      companies: prev.companies.filter(c => c !== company)
    }));
  };

  const addSector = () => {
    if (!newSector.trim()) return;
    
    // Check if sector already exists
    if (preferences.sectors.includes(newSector.trim())) {
      setError('This sector is already in your list');
      return;
    }
    
    setPreferences(prev => ({
      ...prev,
      sectors: [...prev.sectors, newSector.trim()]
    }));
    
    setNewSector('');
    setError(null);
  };

  const removeSector = (sector: string) => {
    setPreferences(prev => ({
      ...prev,
      sectors: prev.sectors.filter(s => s !== sector)
    }));
  };

  const handleFrequencyChange = (frequency: 'hourly' | 'daily' | 'weekly') => {
    setPreferences(prev => ({
      ...prev,
      frequency
    }));
  };

  const toggleNotificationChannel = (channel: 'app' | 'email' | 'push') => {
    setPreferences(prev => {
      const channels = [...prev.notificationChannels];
      
      if (channels.includes(channel)) {
        // Remove channel if it exists
        return {
          ...prev,
          notificationChannels: channels.filter(c => c !== channel)
        };
      } else {
        // Add channel if it doesn't exist
        return {
          ...prev,
          notificationChannels: [...channels, channel]
        };
      }
    });
  };

  const handleImpactLevelChange = (level: 'low' | 'medium' | 'high') => {
    setPreferences(prev => ({
      ...prev,
      minImpactLevel: level
    }));
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className} transition-colors duration-300`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 transition-colors duration-300"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 transition-colors duration-300"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-300"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-300"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-300"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className} transition-colors duration-300`}>
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center transition-colors duration-300">
          <Bell className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400 transition-colors duration-300" />
          Alert Preferences
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md flex items-center transition-colors duration-300"
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-md flex items-center transition-colors duration-300"
          >
            <Save className="h-5 w-5 mr-2" />
            {success}
          </motion.div>
        )}

        {/* Companies Section */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-300">Companies to Track</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
            Get alerts for specific companies in your watchlist or portfolio.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {preferences.companies.map(company => (
              <div 
                key={company}
                className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm flex items-center transition-colors duration-300"
              >
                {company}
                <button 
                  onClick={() => removeCompany(company)}
                  className="ml-2 text-indigo-400 dark:text-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-200 transition-colors duration-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {preferences.companies.length === 0 && (
              <p className="text-gray-400 dark:text-gray-500 text-sm italic transition-colors duration-300">No companies added yet</p>
            )}
          </div>
          
          <div className="flex">
            <input
              type="text"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              placeholder="Add a company"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={addCompany}
              className="bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 dark:hover:bg-indigo-800 flex items-center transition-colors duration-300"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {/* Suggested Companies */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedCompanies.filter(company => !preferences.companies.includes(company)).slice(0, 5).map(company => (
                <button
                  key={company}
                  onClick={() => {
                    setPreferences(prev => ({
                      ...prev,
                      companies: [...prev.companies, company]
                    }));
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs flex items-center"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {company}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sectors Section */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-300">Sectors to Track</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
            Get alerts for industry sectors you're interested in.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {preferences.sectors.map(sector => (
              <div 
                key={sector}
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm flex items-center transition-colors duration-300"
              >
                {sector}
                <button 
                  onClick={() => removeSector(sector)}
                  className="ml-2 text-blue-400 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-200 transition-colors duration-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {preferences.sectors.length === 0 && (
              <p className="text-gray-400 dark:text-gray-500 text-sm italic transition-colors duration-300">No sectors added yet</p>
            )}
          </div>
          
          <div className="flex">
            <input
              type="text"
              value={newSector}
              onChange={(e) => setNewSector(e.target.value)}
              placeholder="Add a sector"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={addSector}
              className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center transition-colors duration-300"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {/* Suggested Sectors */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedSectors.filter(sector => !preferences.sectors.includes(sector)).slice(0, 5).map(sector => (
                <button
                  key={sector}
                  onClick={() => {
                    setPreferences(prev => ({
                      ...prev,
                      sectors: [...prev.sectors, sector]
                    }));
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs flex items-center"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {sector}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Alert Frequency */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-300">Alert Frequency</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
            How often would you like to receive alerts?
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleFrequencyChange('hourly')}
              className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-300 ${
                preferences.frequency === 'hourly'
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Hourly
            </button>
            
            <button
              onClick={() => handleFrequencyChange('daily')}
              className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-300 ${
                preferences.frequency === 'daily'
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Daily
            </button>
            
            <button
              onClick={() => handleFrequencyChange('weekly')}
              className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-300 ${
                preferences.frequency === 'weekly'
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              Weekly
            </button>
          </div>
        </div>
        
        {/* Notification Channels */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-300">Notification Channels</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
            How would you like to receive notifications?
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => toggleNotificationChannel('app')}
              className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-300 ${
                preferences.notificationChannels.includes('app')
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Bell className="h-4 w-4 mr-2" />
              In-App
            </button>
            
            <button
              onClick={() => toggleNotificationChannel('email')}
              className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-300 ${
                preferences.notificationChannels.includes('email')
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </button>
            
            <button
              onClick={() => toggleNotificationChannel('push')}
              className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-300 ${
                preferences.notificationChannels.includes('push')
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Push
            </button>
          </div>
        </div>
        
        {/* Impact Level */}
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-300">Minimum Impact Level</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
            Filter alerts based on their potential impact on your investments.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleImpactLevelChange('low')}
              className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-300 ${
                preferences.minImpactLevel === 'low'
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Low
            </button>
            
            <button
              onClick={() => handleImpactLevelChange('medium')}
              className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-300 ${
                preferences.minImpactLevel === 'medium'
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Medium
            </button>
            
            <button
              onClick={() => handleImpactLevelChange('high')}
              className={`px-4 py-2 rounded-md text-sm flex items-center transition-colors duration-300 ${
                preferences.minImpactLevel === 'high'
                  ? 'bg-indigo-600 dark:bg-indigo-700 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              High
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end transition-colors duration-300">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-300 ${
            saving
              ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-700 dark:hover:bg-indigo-800'
          }`}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
};

export default AlertPreferences;
