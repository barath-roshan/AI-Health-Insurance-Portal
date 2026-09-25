import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSchemeDetail } from '../services/api';
import MainLayout from '../layouts/MainLayout';

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
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 text-sm font-medium">Loading scheme details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !scheme) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-xl text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900">Scheme Not Found</h2>
          <p className="text-sm text-slate-600">{error || 'The requested scheme could not be located.'}</p>
          <Link
            to="/schemes"
            className="inline-block px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition"
          >
            ← Back to All Schemes
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/schemes"
            className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            ← Back to Schemes Catalog
          </Link>
        </div>

        {/* Scheme Header Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 rounded border border-emerald-200">
              {scheme.category || 'Central / State'}
            </span>
            <span className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded">
              Region: {scheme.state_or_region || 'All India'}
            </span>
            <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded border border-blue-100">
              Status: {scheme.verification_status || 'Verified'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {scheme.scheme_name}
          </h1>

          <p className="text-sm text-slate-700 leading-relaxed">
            {scheme.description}
          </p>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              Scheme Code: <strong className="font-mono text-slate-800">{scheme.scheme_code}</strong>
            </span>
            <span>
              Last Verified:{' '}
              <strong className="text-slate-800">
                {scheme.last_verified_at
                  ? new Date(scheme.last_verified_at).toLocaleDateString()
                  : 'Recent'}
              </strong>
            </span>
            {scheme.source_url && (
              <a
                href={scheme.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 hover:underline font-medium"
              >
                Official Source Link ↗
              </a>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        {scheme.benefits && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Benefits & Details
            </h2>
            <div className="space-y-2 text-xs text-slate-700">
              {scheme.benefits.notes && (
                <p className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                  <strong>Source Note:</strong> {scheme.benefits.notes}
                </p>
              )}
              {scheme.benefits.keywords && scheme.benefits.keywords.length > 0 && (
                <div>
                  <span className="font-semibold block mb-1">Keywords:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {scheme.benefits.keywords.map((kw, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Eligibility Rules */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Eligibility Criteria</span>
            <span className="text-xs font-normal text-slate-500">
              {scheme.rules?.length || 0} Criteria Defined
            </span>
          </h2>

          {!scheme.rules || scheme.rules.length === 0 ? (
            <p className="text-xs text-slate-500">Standard government eligibility criteria apply.</p>
          ) : (
            <div className="space-y-3">
              {scheme.rules.map((rule) => (
                <div key={rule.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800 uppercase tracking-wide bg-slate-200 px-1.5 py-0.5 rounded">
                      {rule.field_name}
                    </span>
                    <span className="font-mono text-emerald-700 font-bold">{rule.operator}</span>
                    <span className="font-semibold text-slate-900">{rule.expected_value}</span>
                  </div>
                  {rule.description && (
                    <p className="text-slate-600 text-xs mt-1">{rule.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Required Documents */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Required Verification Documents
          </h2>

          {!scheme.documents || scheme.documents.length === 0 ? (
            <p className="text-xs text-slate-500">Standard ID and residence proof required.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scheme.documents.map((doc) => (
                <li key={doc.id} className="p-3 border border-slate-200 rounded-lg flex items-start space-x-3 bg-white">
                  <div className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {doc.document_name}
                      {doc.mandatory && (
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 ml-2 rounded">
                          Mandatory
                        </span>
                      )}
                    </span>
                    {doc.description && (
                      <span className="text-[11px] text-slate-500 block mt-0.5">{doc.description}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SchemeDetail;
