import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { 
  User, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  IndianRupee,
  Users
} from 'lucide-react';

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
        <div className="py-20 text-center space-y-3 max-w-md mx-auto">
          <div className="w-10 h-10 border-4 border-[#0F4C5C] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-medium">Loading citizen profile information...</p>
        </div>
      </MainLayout>
    );
  }

  const progressPercent = step * 25;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto my-6 space-y-6">
        
        {/* WIZARD HEADER & PROGRESS BAR */}
        <Card className="text-center space-y-4">
          <div>
            <Badge variant="brand" size="sm" className="mb-2">
              Citizen Guided Wizard
            </Badge>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Scheme Eligibility Check
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Provide state, district, income, and household details to run deterministic scheme rules.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Progress</span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
              <div
                className="bg-[#0F4C5C] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Stepper Node Indicators */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
            {[
              { num: 1, label: 'Location', icon: MapPin },
              { num: 2, label: 'Personal', icon: User },
              { num: 3, label: 'Income', icon: IndianRupee },
              { num: 4, label: 'Coverage', icon: ShieldCheck },
            ].map((s) => {
              const StepIcon = s.icon;
              const isDone = step > s.num;
              const isCurrent = step === s.num;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num)}
                  className={`p-2 rounded-xl text-center transition flex flex-col items-center gap-1 cursor-pointer border ${
                    isCurrent
                      ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-2xs'
                      : isDone
                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-1 text-xs font-bold">
                    {isDone ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <StepIcon className="w-3.5 h-3.5" />}
                    <span>Step {s.num}</span>
                  </div>
                  <span className="text-[10px] font-medium hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* WIZARD FORM CARD */}
        <Card className="p-6 sm:p-8">
          <form onSubmit={step === 4 ? handleSubmit : handleNext} className="space-y-6">
            
            {/* STEP 1: STATE & DISTRICT */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#0F4C5C]" />
                    <span>Step 1: State & District Jurisdiction</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    State government health schemes (e.g. CMCHIS in Tamil Nadu) require state residency.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    State / Union Territory *
                  </label>
                  <select
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white outline-none transition"
                  >
                    <option value="">-- Select Your Residence State --</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    District Name
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="e.g. Chennai, Madurai, Salem"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white outline-none transition"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: AGE & GENDER */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <User className="w-4 h-4 text-[#0F4C5C]" />
                    <span>Step 2: Demographics (Age & Gender)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Senior citizen or gender-specific scheme rules evaluate age boundaries.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white outline-none transition"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="transgender">Transgender / Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 3: OCCUPATION & INCOME */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <IndianRupee className="w-4 h-4 text-[#0F4C5C]" />
                    <span>Step 3: Occupation & Household Income</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Most government schemes evaluate annual household income caps (e.g. ₹1,20,000/yr).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Primary Occupation
                  </label>
                  <select
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white outline-none transition"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Annual Household Income (₹ INR) *
                  </label>
                  <input
                    type="number"
                    name="annual_income"
                    min="0"
                    step="1000"
                    value={formData.annual_income}
                    onChange={handleChange}
                    placeholder="e.g. 120000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white outline-none transition"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Enter gross total annual income of all family members combined in Rupees.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 4: FAMILY SIZE & EXISTING COVERAGE */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#0F4C5C]" />
                    <span>Step 4: Family Members & Existing Coverage</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Determine floater coverage limits and existing insurance conflict rules.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Total Household Family Members
                  </label>
                  <input
                    type="number"
                    name="family_size"
                    min="1"
                    max="20"
                    value={formData.family_size}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Existing Health Insurance Status
                  </label>
                  <select
                    name="existing_coverage"
                    value={formData.existing_coverage}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white outline-none transition"
                  >
                    <option value="none">No Existing Health Insurance</option>
                    <option value="state_scheme">Existing State Health Scheme Card</option>
                    <option value="esis">ESIS (Employee State Insurance Scheme)</option>
                    <option value="private">Private Health Insurance Policy</option>
                  </select>
                </div>
              </div>
            )}

            {/* NAV BUTTONS */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBack}
                  icon={ArrowLeft}
                >
                  Previous Step
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Continue to Step {step + 1}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  isLoading={saving}
                  icon={Check}
                  iconPosition="right"
                >
                  Save Profile & Evaluate Eligibility
                </Button>
              )}
            </div>

          </form>
        </Card>

      </div>
    </MainLayout>
  );
};

export default ProfileForm;
