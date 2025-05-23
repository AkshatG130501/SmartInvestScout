import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserProfile, 
  createUserProfile, 
  updateUserProfile,
  RiskAppetite,
  InvestmentGoal,
  UserProfileInput
} from '../lib/api';

interface ProfileSetupProps {
  onComplete?: () => void;
  minimal?: boolean;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete, minimal = false }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [formData, setFormData] = useState<UserProfileInput>({
    risk_appetite: RiskAppetite.MODERATE,
    investment_goals: [InvestmentGoal.LONG_TERM_GROWTH],
    watchlist: [],
    holdings: []
  });
  const [newWatchlistItem, setNewWatchlistItem] = useState('');
  const [newHolding, setNewHolding] = useState({ symbol: '', name: '', quantity: '' });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.id);
        if (profile) {
          setFormData({
            risk_appetite: profile.risk_appetite,
            investment_goals: profile.investment_goals,
            watchlist: profile.watchlist,
            holdings: profile.holdings
          });
          setHasProfile(true);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load your investment profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const goal = value as InvestmentGoal;
    
    setFormData(prev => {
      if (checked) {
        return { ...prev, investment_goals: [...prev.investment_goals, goal] };
      } else {
        return { ...prev, investment_goals: prev.investment_goals.filter(g => g !== goal) };
      }
    });
  };

  const addWatchlistItem = () => {
    if (!newWatchlistItem.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      watchlist: [...prev.watchlist, newWatchlistItem.trim()]
    }));
    setNewWatchlistItem('');
  };

  const removeWatchlistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      watchlist: prev.watchlist.filter((_, i) => i !== index)
    }));
  };

  const addHolding = () => {
    if (!newHolding.symbol.trim() || !newHolding.name.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      holdings: [
        ...prev.holdings, 
        { 
          symbol: newHolding.symbol.trim().toUpperCase(), 
          name: newHolding.name.trim(),
          quantity: newHolding.quantity ? parseInt(newHolding.quantity) : undefined
        }
      ]
    }));
    setNewHolding({ symbol: '', name: '', quantity: '' });
  };

  const removeHolding = (index: number) => {
    setFormData(prev => ({
      ...prev,
      holdings: prev.holdings.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);

    try {
      if (hasProfile) {
        await updateUserProfile(user.id, formData);
      } else {
        await createUserProfile(user.id, formData);
        setHasProfile(true);
      }
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save your investment profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">Please sign in to set up your investment profile.</p>
      </div>
    );
  }

  return (
    <div className={`${minimal ? '' : 'max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm'}`}>
      <form onSubmit={handleSubmit}>
        {!minimal && (
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {hasProfile ? 'Update Your Investment Profile' : 'Set Up Your Investment Profile'}
          </h2>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Risk Appetite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Risk Appetite
            </label>
            <select
              name="risk_appetite"
              value={formData.risk_appetite}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={RiskAppetite.CONSERVATIVE}>Conservative</option>
              <option value={RiskAppetite.MODERATE}>Moderate</option>
              <option value={RiskAppetite.AGGRESSIVE}>Aggressive</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              This helps tailor investment advice to your risk tolerance
            </p>
          </div>

          {/* Investment Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Investment Goals (Select all that apply)
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="goal-long-term"
                  value={InvestmentGoal.LONG_TERM_GROWTH}
                  checked={formData.investment_goals.includes(InvestmentGoal.LONG_TERM_GROWTH)}
                  onChange={handleGoalChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="goal-long-term" className="ml-2 text-sm text-gray-700">
                  Long-term capital growth
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="goal-passive"
                  value={InvestmentGoal.PASSIVE_INCOME}
                  checked={formData.investment_goals.includes(InvestmentGoal.PASSIVE_INCOME)}
                  onChange={handleGoalChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="goal-passive" className="ml-2 text-sm text-gray-700">
                  Passive income (dividends)
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="goal-retirement"
                  value={InvestmentGoal.RETIREMENT}
                  checked={formData.investment_goals.includes(InvestmentGoal.RETIREMENT)}
                  onChange={handleGoalChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="goal-retirement" className="ml-2 text-sm text-gray-700">
                  Retirement planning
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="goal-short-term"
                  value={InvestmentGoal.SHORT_TERM_GAINS}
                  checked={formData.investment_goals.includes(InvestmentGoal.SHORT_TERM_GAINS)}
                  onChange={handleGoalChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="goal-short-term" className="ml-2 text-sm text-gray-700">
                  Short-term gains
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="goal-preservation"
                  value={InvestmentGoal.WEALTH_PRESERVATION}
                  checked={formData.investment_goals.includes(InvestmentGoal.WEALTH_PRESERVATION)}
                  onChange={handleGoalChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="goal-preservation" className="ml-2 text-sm text-gray-700">
                  Wealth preservation
                </label>
              </div>
            </div>
          </div>

          {/* Watchlist / Interests */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Watchlist / Interests
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newWatchlistItem}
                onChange={(e) => setNewWatchlistItem(e.target.value)}
                placeholder="e.g., Green Energy, EVs, Banking"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addWatchlistItem}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add
              </button>
            </div>
            {formData.watchlist.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.watchlist.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-indigo-50 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm text-indigo-800">{item}</span>
                    <button
                      type="button"
                      onClick={() => removeWatchlistItem(index)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Add sectors, themes, or investment areas you're interested in
            </p>
          </div>

          {/* Holdings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Holdings (Optional)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <input
                type="text"
                value={newHolding.symbol}
                onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value })}
                placeholder="Symbol (e.g., AAPL)"
                className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="text"
                value={newHolding.name}
                onChange={(e) => setNewHolding({ ...newHolding, name: e.target.value })}
                placeholder="Name (e.g., Apple Inc)"
                className="p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={newHolding.quantity}
                  onChange={(e) => setNewHolding({ ...newHolding, quantity: e.target.value })}
                  placeholder="Qty (optional)"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={addHolding}
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add
                </button>
              </div>
            </div>
            {formData.holdings.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-md overflow-hidden">
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
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.holdings.map((holding, index) => (
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
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          <button
                            type="button"
                            onClick={() => removeHolding(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Add stocks or other investments you currently own
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={`px-4 py-2 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                saving
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {saving ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : hasProfile ? (
                'Update Profile'
              ) : (
                'Save Profile'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileSetup;
