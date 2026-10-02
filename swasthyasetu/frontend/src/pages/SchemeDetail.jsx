import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSchemeDetail } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { getSchemeImage } from '../lib/schemeImages';
import { 
  ArrowLeft, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  AlertCircle,
  HelpCircle,
  Tag,
  Calendar,
  Building2,
  ListOrdered,
  Sparkles,
  Info
} from 'lucide-react';

const SchemeDetail = () => {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSchemeDetail(id);
        setScheme(data);
        const imgObj = getSchemeImage(data.scheme_code || data.id);
        setImgSrc(imgObj.url);
      } catch (err) {
        setError(err.message || 'Unable to load scheme details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto space-y-6 py-6 px-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-36 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !scheme) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-[#102A43]">Scheme Not Found</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'The requested government health scheme record could not be located in our verified catalogue.'}
          </p>
          <Link to="/schemes" className="inline-block pt-2">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Schemes Directory
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const categoryVariant = (scheme.category || '').toLowerCase() === 'central' ? 'central' : 'state';
  const schemeImage = getSchemeImage(scheme.scheme_code || scheme.id);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6 px-4 py-4">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/schemes"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-[#0F766E] hover:text-[#0D625C] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Schemes Directory</span>
          </Link>
        </div>

        {/* HERO HEADER CARD WITH FEATURED IMAGE */}
        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* Left Content */}
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={categoryVariant} size="sm">
                    {scheme.category || 'Central / State'}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{scheme.state_or_region || 'All India'}</span>
                  </Badge>
                  <Badge variant="verified" size="sm" showDot>
                    {scheme.verification_status || 'Official Dataset'}
                  </Badge>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] leading-tight">
                  {scheme.scheme_name}
                </h1>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {scheme.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
                <div className="flex items-center space-x-1.5 font-mono">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>Scheme Code: <strong className="text-slate-800">{scheme.scheme_code}</strong></span>
                </div>
                {scheme.last_verified_at && (
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Last Verified: <strong className="text-slate-800">{new Date(scheme.last_verified_at).toLocaleDateString()}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Hero Image Column */}
            <div className="md:col-span-5 relative min-h-[220px] bg-slate-100">
              <img
                src={imgSrc || schemeImage.url}
                alt={scheme.scheme_name}
                onError={() => setImgSrc(schemeImage.fallbackUrl)}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#102A43]/40 via-transparent to-transparent md:hidden" />
            </div>

          </div>
        </div>

        {/* MAIN BODY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 8 COLUMNS: DETAILED SECTIONS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Overview & Coverage Summary */}
            {scheme.benefits && (
              <Card className="space-y-4">
                <h2 className="text-base font-bold text-[#102A43] border-b border-slate-100 pb-3 flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
                  <span>Benefits & Financial Coverage</span>
                </h2>

                <div className="space-y-4 text-xs text-slate-700">
                  {scheme.benefits.notes && (
                    <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-900 leading-relaxed space-y-1">
                      <div className="flex items-center space-x-1.5 font-bold text-amber-950">
                        <Info className="w-4 h-4 text-amber-700" />
                        <span>Official Benefit Notes</span>
                      </div>
                      <p className="text-xs text-amber-900/90">{scheme.benefits.notes}</p>
                    </div>
                  )}

                  {scheme.benefits.keywords && scheme.benefits.keywords.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-500 block mb-2 uppercase tracking-wider text-[10px]">
                        Medical Focus & Keywords
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {scheme.benefits.keywords.map((kw, i) => (
                          <span key={i} className="bg-slate-100 text-[#102A43] border border-slate-200 px-3 py-1 rounded-full text-xs font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Eligibility Requirements */}
            <Card className="space-y-4">
              <h2 className="text-base font-bold text-[#102A43] border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-[#0F766E]" />
                  <span>Deterministic Eligibility Rules</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {scheme.rules?.length || 0} Criteria Rules
                </span>
              </h2>

              {!scheme.rules || scheme.rules.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">Standard government health insurance eligibility criteria apply.</p>
              ) : (
                <div className="space-y-3">
                  {scheme.rules.map((rule) => (
                    <div key={rule.id} className="p-4 bg-slate-50/90 border border-slate-200/80 rounded-xl text-xs space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#102A43] uppercase tracking-wider bg-slate-200/80 px-2.5 py-0.5 rounded text-[10px]">
                          {rule.field_name}
                        </span>
                        <span className="font-mono text-[#0F766E] font-bold bg-[#0F766E]/10 px-2 py-0.5 rounded text-[11px]">
                          {rule.operator}
                        </span>
                        <span className="font-semibold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                          {rule.expected_value}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="text-slate-600 text-xs leading-relaxed pt-0.5">{rule.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Required Verification Documents */}
            <Card className="space-y-4">
              <h2 className="text-base font-bold text-[#102A43] border-b border-slate-100 pb-3 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Required Documentation Checklist</span>
              </h2>

              {!scheme.documents || scheme.documents.length === 0 ? (
                <p className="text-xs text-slate-500 py-2">Standard government identity, income, and residence proofs required.</p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {scheme.documents.map((doc) => (
                    <li key={doc.id} className="p-3.5 border border-slate-200/80 rounded-xl flex items-start space-x-3 bg-white shadow-2xs">
                      <div className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#102A43] block leading-tight">
                          {doc.document_name}
                          {doc.mandatory && (
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 ml-1.5 rounded">
                              Mandatory
                            </span>
                          )}
                        </span>
                        {doc.description && (
                          <span className="text-[11px] text-slate-500 block mt-1 leading-normal">
                            {doc.description}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Application Guidelines */}
            <Card className="space-y-4">
              <h2 className="text-base font-bold text-[#102A43] border-b border-slate-100 pb-3 flex items-center space-x-2">
                <ListOrdered className="w-5 h-5 text-[#0F766E]" />
                <span>How to Apply</span>
              </h2>

              <ol className="space-y-3 text-xs text-slate-700">
                <li className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-6 h-6 bg-[#102A43] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                    1
                  </span>
                  <div className="pt-0.5">
                    <strong className="font-semibold text-[#102A43] block mb-0.5">Check Eligibility</strong>
                    <span>Use the KAAPAN deterministic calculator to confirm your household criteria matches the scheme requirements.</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-6 h-6 bg-[#102A43] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                    2
                  </span>
                  <div className="pt-0.5">
                    <strong className="font-semibold text-[#102A43] block mb-0.5">Gather Documents</strong>
                    <span>Collect valid copies of mandatory documents listed above (Aadhaar, Ration Card, Income Certificate, etc.).</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-6 h-6 bg-[#102A43] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                    3
                  </span>
                  <div className="pt-0.5">
                    <strong className="font-semibold text-[#102A43] block mb-0.5">Submit Application</strong>
                    <span>Visit the official government portal via the link on the right, or approach your nearest Common Service Centre (CSC) / empaneled hospital.</span>
                  </div>
                </li>
              </ol>
            </Card>

          </div>

          {/* RIGHT 4 COLUMNS: STICKY SIDEBAR ACTION CARD */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            
            <Card className="space-y-4 border-teal-500/20 shadow-sm">
              <h3 className="text-xs font-bold text-[#102A43] border-b border-slate-100 pb-2.5 uppercase tracking-wider">
                Quick Scheme Action
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Jurisdiction:</span>
                  <strong className="text-[#102A43] font-semibold">{scheme.state_or_region || 'All India'}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Scheme Type:</span>
                  <strong className="text-[#102A43] font-semibold capitalize">{scheme.category || 'Central'}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Status:</span>
                  <Badge variant="verified" size="sm" showDot>
                    {scheme.verification_status || 'Verified'}
                  </Badge>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Scheme Code:</span>
                  <span className="font-mono text-slate-800 font-semibold">{scheme.scheme_code}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <Link to="/profile" className="block">
                  <Button variant="primary" size="md" className="w-full justify-center">
                    Check My Eligibility
                  </Button>
                </Link>

                {scheme.source_url && (
                  <a
                    href={scheme.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <Button variant="outline" size="md" className="w-full justify-center" icon={ExternalLink} iconPosition="right">
                      Official Government Portal
                    </Button>
                  </a>
                )}
              </div>
            </Card>

            {/* Need AI Assistance Card */}
            <div className="bg-[#102A43] text-white p-5 rounded-2xl border border-slate-800 text-xs space-y-3 shadow-sm">
              <div className="font-bold flex items-center space-x-2 text-teal-300 text-sm">
                <Sparkles className="w-4 h-4 text-teal-300" />
                <span>Need Specific Guidance?</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                Our vectorless RAG chatbot can cite exact rules, document requirements, and hospital empanelment steps for {scheme.scheme_name}.
              </p>
              <Link to="/chat" className="inline-flex items-center space-x-1 text-teal-300 font-bold hover:underline text-xs pt-1">
                <span>Ask KAAPAN AI Assistant</span>
                <span>→</span>
              </Link>
            </div>

            <div className="p-4 bg-slate-100/80 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">Official Source Disclaimer:</p>
              <p>Scheme information is derived from indexed official government Gazette notifications and public policy documents. Always confirm latest terms at official government portals.</p>
            </div>

          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default SchemeDetail;

