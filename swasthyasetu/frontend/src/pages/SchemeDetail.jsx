import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSchemeDetail } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
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
  Calendar
} from 'lucide-react';

const SchemeDetail = () => {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSchemeDetail(id);
        setScheme(data);
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
        <div className="max-w-5xl mx-auto space-y-6 py-6">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-36 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-4">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !scheme) {
    return (
      <MainLayout>
        <div className="max-w-md mx-auto my-12 p-8 bg-white border border-slate-200/90 rounded-2xl text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Scheme Not Found</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'The requested government health scheme record could not be located.'}
          </p>
          <Link to="/schemes">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Back to Scheme Catalog
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const categoryVariant = (scheme.category || '').toLowerCase() === 'central' ? 'central' : 'state';

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/schemes"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-teal-800 hover:text-teal-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Schemes Directory</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* MAIN CONTENT AREA (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Card */}
            <Card className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={categoryVariant} size="sm">
                  {scheme.category || 'Central / State'}
                </Badge>
                <Badge variant="neutral" size="sm">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{scheme.state_or_region || 'All India'}</span>
                </Badge>
                <Badge variant="verified" size="sm" showDot>
                  {scheme.verification_status || 'Verified'}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {scheme.scheme_name}
              </h1>

              <p className="text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                {scheme.description}
              </p>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div className="flex items-center space-x-1 font-mono">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>Code: <strong className="text-slate-800">{scheme.scheme_code}</strong></span>
                </div>
                {scheme.last_verified_at && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Last Verified: <strong className="text-slate-800">{new Date(scheme.last_verified_at).toLocaleDateString()}</strong></span>
                  </div>
                )}
              </div>
            </Card>

            {/* Benefits & Details */}
            {scheme.benefits && (
              <Card className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Benefits & Coverage Summary</span>
                </h2>

                <div className="space-y-3 text-xs text-slate-700">
                  {scheme.benefits.notes && (
                    <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-900 leading-relaxed">
                      <strong className="font-semibold block mb-0.5">Source Guidance Note:</strong>
                      {scheme.benefits.notes}
                    </div>
                  )}

                  {scheme.benefits.keywords && scheme.benefits.keywords.length > 0 && (
                    <div>
                      <span className="font-semibold text-slate-700 block mb-1.5 uppercase tracking-wider text-[10px]">
                        Related Medical Keywords:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {scheme.benefits.keywords.map((kw, i) => (
                          <span key={i} className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Eligibility Rules */}
            <Card className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  <span>Eligibility Criteria</span>
                </div>
                <span className="text-xs font-normal text-slate-500 font-mono">
                  {scheme.rules?.length || 0} Rule Constraints
                </span>
              </h2>

              {!scheme.rules || scheme.rules.length === 0 ? (
                <p className="text-xs text-slate-500">Standard government eligibility criteria apply.</p>
              ) : (
                <div className="space-y-3">
                  {scheme.rules.map((rule) => (
                    <div key={rule.id} className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-xs space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-800 uppercase tracking-wider bg-slate-200/80 px-2 py-0.5 rounded text-[10px]">
                          {rule.field_name}
                        </span>
                        <span className="font-mono text-[#0F4C5C] font-bold bg-[#0F4C5C]/10 px-1.5 py-0.5 rounded text-[11px]">
                          {rule.operator}
                        </span>
                        <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {rule.expected_value}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="text-slate-600 text-xs mt-1 leading-relaxed">{rule.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Required Verification Documents */}
            <Card className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Required Verification Documents</span>
              </h2>

              {!scheme.documents || scheme.documents.length === 0 ? (
                <p className="text-xs text-slate-500">Standard identity and residence proof required.</p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {scheme.documents.map((doc) => (
                    <li key={doc.id} className="p-3 border border-slate-200/80 rounded-xl flex items-start space-x-3 bg-white shadow-2xs">
                      <div className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                        ✓
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">
                          {doc.document_name}
                          {doc.mandatory && (
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 ml-1.5 rounded">
                              Mandatory
                            </span>
                          )}
                        </span>
                        {doc.description && (
                          <span className="text-[11px] text-slate-500 block mt-0.5 leading-normal">
                            {doc.description}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

          </div>

          {/* STICKY SUMMARY SIDEBAR (Right 4 Cols) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 uppercase tracking-wider text-[11px]">
                Quick Scheme Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">State / Region:</span>
                  <strong className="text-slate-900 font-semibold">{scheme.state_or_region || 'All India'}</strong>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Category:</span>
                  <strong className="text-slate-900 font-semibold capitalize">{scheme.category || 'Central'}</strong>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Verification:</span>
                  <Badge variant="verified" size="sm" showDot>
                    {scheme.verification_status || 'Verified'}
                  </Badge>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Scheme Code:</span>
                  <span className="font-mono text-slate-800 font-semibold">{scheme.scheme_code}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Link to="/profile">
                  <Button variant="primary" size="sm" className="w-full">
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
                    <Button variant="outline" size="sm" className="w-full" icon={ExternalLink} iconPosition="right">
                      Official Source Link
                    </Button>
                  </a>
                )}
              </div>
            </Card>

            {/* Need Help Box */}
            <div className="bg-[#0B2545] text-white p-5 rounded-xl border border-slate-800 text-xs space-y-3 shadow-2xs">
              <div className="font-bold flex items-center space-x-2 text-teal-300">
                <HelpCircle className="w-4 h-4 text-teal-300" />
                <span>Have Questions?</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Our KAAPAN AI Assistant can answer specific questions about application guidelines or required documents for this scheme.
              </p>
              <Link to="/chat" className="inline-block text-teal-300 font-bold hover:underline text-[11px]">
                Ask AI Assistant →
              </Link>
            </div>

          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default SchemeDetail;
