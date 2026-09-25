import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSchemes } from '../services/api';
import MainLayout from '../layouts/MainLayout';

const SchemeList = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchSchemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (stateFilter.trim()) params.state = stateFilter.trim();
      if (categoryFilter.trim()) params.category = categoryFilter.trim();

      const data = await getSchemes(params);
      setSchemes(data);
    } catch (err) {
      setError(err.message || 'Failed to load health schemes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [stateFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Hero Header */}
        <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Government Health Insurance Schemes
          </h1>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl">
            Explore and filter central and state health insurance coverage options verified by SwasthyaSetu.
          </p>

          {/* Search Bar & Filters */}
          <form onSubmit={handleSearchSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <input
                type="text"
                placeholder="Search scheme name, code, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder="Filter by state / region..."
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Categories</option>
                <option value="central">Central</option>
                <option value="state">State</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex space-x-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Status Error / Info */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Scheme Grid */}
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 text-sm font-medium">Fetching scheme catalog...</p>
          </div>
        ) : schemes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <p className="text-slate-600 font-medium">No matching health schemes found.</p>
            <p className="text-slate-400 text-xs mt-1">Try broadening your search query or clear filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {schemes.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 rounded border border-emerald-100">
                      {scheme.category || 'Scheme'}
                    </span>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {scheme.state_or_region || 'All India'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {scheme.scheme_name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3">
                    {scheme.description || 'Government health scheme providing financial protection and medical coverage.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    ID: {scheme.scheme_code}
                  </span>
                  <Link
                    to={`/schemes/${scheme.id}`}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SchemeList;
