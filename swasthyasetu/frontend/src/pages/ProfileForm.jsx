import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import MainLayout from '../layouts/MainLayout';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Delhi', 'Jammu & Kashmir', 'Puducherry'
];

const ProfileForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    state: '',
    district: '',
    age: '',
    gender: 'male',
    occupation: '',
    annual_income: '',
    family_size: '1',
    existing_coverage: 'none'
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadProfileData = async () => {
      setLoading(true);
      try {
        const data = await getProfile();
        if (data) {
          setFormData({
            state: data.state || '',
            district: data.district || '',
            age: data.age !== null && data.age !== undefined ? String(data.age) : '',
            gender: data.gender || 'male',
            occupation: data.occupation || '',
            annual_income: data.annual_income !== null && data.annual_income !== undefined ? String(data.annual_income) : '',
            family_size: data.family_size ? String(data.family_size) : '1',
            existing_coverage: data.existing_coverage || 'none'
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        state: formData.state.trim() || null,
        district: formData.district.trim() || null,
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender || null,
        occupation: formData.occupation.trim() || null,
        annual_income: formData.annual_income ? parseFloat(formData.annual_income) : null,
        family_size: formData.family_size ? parseInt(formData.family_size, 10) : 1,
        existing_coverage: formData.existing_coverage || null
      };

      await updateProfile(payload);
      navigate('/results');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-medium">Loading citizen profile...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto my-6 space-y-6">
        {/* Wizard Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Citizen Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete your profile steps to check government scheme eligibility.
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 mt-6">
            {[
              { num: 1, label: 'Location' },
              { num: 2, label: 'Demographics' },
              { num: 3, label: 'Income & Work' },
              { num: 4, label: 'Coverage & Family' },
            ].map((s) => (
              <div key={s.num} className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setStep(s.num)}
                  className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition ${
                    step === s.num
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : step > s.num
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {s.num}
                </button>
                <span className={`text-xs hidden sm:inline ${step === s.num ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Wizard Form Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={step === 4 ? handleSubmit : handleNext} className="space-y-6">
            {/* Step 1: State + District */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 1: State & District
                </h2>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    State / Union Territory *
                  </label>
                  <select
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">-- Select State --</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    District Name
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Chennai, Madurai, Salem"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Age + Gender */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 2: Age & Gender
                </h2>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="0"
                    max="120"
                    required
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 45"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="transgender">Transgender / Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Occupation + Income */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 3: Occupation & Annual Income
                </h2>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Primary Occupation
                  </label>
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">-- Select Occupation --</option>
                    <option value="farmer">Farmer / Agricultural Worker</option>
                    <option value="worker">Daily Wage / Construction Worker</option>
                    <option value="artisan">Artisan / Handloom Worker</option>
                    <option value="vendor">Street Vendor / Small Business</option>
                    <option value="salaried">Salaried Employee (Private)</option>
                    <option value="government">Government Servant</option>
                    <option value="unemployed">Unemployed / Homemaker</option>
                    <option value="retired">Senior Citizen / Retired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Annual Family Income (₹ INR) *
                  </label>
                  <input
                    type="number"
                    name="annual_income"
                    min="0"
                    step="1000"
                    value={formData.annual_income}
                    onChange={handleChange}
                    placeholder="e.g. 120000"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Enter gross annual household income in Rupees.
                  </span>
                </div>
              </div>
            )}

            {/* Step 4: Family Size + Existing Coverage */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Step 4: Family Size & Existing Coverage
                </h2>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Total Family Members
                  </label>
                  <input
                    type="number"
                    name="family_size"
                    min="1"
                    max="20"
                    value={formData.family_size}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">
                    Existing Health Insurance Coverage
                  </label>
                  <select
                    name="existing_coverage"
                    value={formData.existing_coverage}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="none">No Existing Health Insurance</option>
                    <option value="state_scheme">Existing State Health Scheme Card</option>
                    <option value="esis">ESIS (Employee State Insurance Scheme)</option>
                    <option value="private">Private Health Insurance Policy</option>
                  </select>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  ← Previous
                </button>
              ) : (
                <div></div>
              )}

              {step < 4 ? (
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition shadow-sm"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition shadow-sm disabled:opacity-50 flex items-center space-x-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Profile & Checking...</span>
                    </>
                  ) : (
                    <span>Save Profile & Check Eligibility →</span>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfileForm;
