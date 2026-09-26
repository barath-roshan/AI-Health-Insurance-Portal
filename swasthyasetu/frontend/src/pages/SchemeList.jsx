import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSchemes } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { SchemeCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { Search, MapPin, Tag, ArrowRight, ShieldCheck, Filter, RefreshCw } from 'lucide-react';

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
      setError(err.message || 'Failed to load health schemes catalog.');
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

  const clearFilters = () => {
    setSearch('');
    setStateFilter('');
    setCategoryFilter('');
    fetchSchemes();
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        
        {/* HERO EXPLORER HEADER */}
        <div className="bg-[#0B2545] text-white rounded-2xl p-6 sm:p-10 shadow-md border border-slate-800 space-y-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-teal-950/80 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-semibold text-teal-300">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>Verified Scheme Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Explore Government Health Schemes
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Find health schemes based on your state, category, and health coverage needs across India.
            </p>
          </div>

          {/* Search Bar & Filters Form */}
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            
            {/* Search Input */}
            <div className="sm:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search scheme name, code, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/90 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:border-teal-500 transition-colors"
              />
            </div>

            {/* State Filter */}
            <div className="sm:col-span-3 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Filter by state / region..."
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/90 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <div className="sm:col-span-2 relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/90 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:border-teal-500 transition-colors cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="central">Central</option>
                <option value="state">State</option>
              </select>
            </div>

            {/* Submit CTA */}
            <div className="sm:col-span-2">
              <Button type="submit" variant="secondary" size="md" className="w-full" icon={Filter}>
                Filter
              </Button>
            </div>
          </form>
        </div>

        {/* Status Notification */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={fetchSchemes} icon={RefreshCw}>
              Retry
            </Button>
          </div>
        )}

        {/* Scheme Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SchemeCardSkeleton key={i} />
            ))}
          </div>
        ) : schemes.length === 0 ? (
          <EmptyState
            title="No matching health schemes found"
            description="We couldn't find any schemes matching your search or filters. Try clearing your state or category selection."
            onAction={clearFilters}
            actionLabel="Reset Search Filters"
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Showing <strong className="text-slate-800 font-semibold">{schemes.length}</strong> verified health schemes</span>
              {(search || stateFilter || categoryFilter) && (
                <button
                  onClick={clearFilters}
                  className="text-teal-700 hover:text-teal-900 font-medium underline cursor-pointer"
                >
                  Clear Active Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.map((scheme) => {
                const categoryVariant = (scheme.category || '').toLowerCase() === 'central' ? 'central' : 'state';

                return (
                  <Card
                    key={scheme.id}
                    hoverEffect
                    className="flex flex-col justify-between space-y-4 relative group"
                  >
                    <div className="space-y-3">
                      {/* Badge bar */}
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={categoryVariant} size="sm">
                          {scheme.category || 'Scheme'}
                        </Badge>

                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{scheme.state_or_region || 'All India'}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#0F4C5C] transition-colors">
                        {scheme.scheme_name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {scheme.description || 'Government health scheme providing financial protection and medical coverage for eligible beneficiaries.'}
                      </p>
                    </div>

                    {/* Footer bar */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-500">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>{scheme.scheme_code}</span>
                      </div>

                      <Link to={`/schemes/${scheme.id}`}>
                        <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SchemeList;
