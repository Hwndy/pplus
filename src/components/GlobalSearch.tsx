import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2, FileText, Users, Database, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCompanySearch } from '@/hooks/useApi';
import { apiService } from '@/services/apiService';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'company' | 'editorial' | 'user' | 'publication';
  icon: React.ReactNode;
  data: any;
}

interface GlobalSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({ onResultSelect, placeholder = "Search companies, editorials, users...", className }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Company search using the hook - only search when query has at least 2 characters
  const shouldSearchCompanies = query.length >= 2;
  const { data: companyResults, loading: companyLoading } = useCompanySearch(
    shouldSearchCompanies ? query : 'SKIP_SEARCH', // Use a special value to skip search
    10
  );

  // Search other entities
  useEffect(() => {
    const searchOtherEntities = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchPromises = [];

        // Search editorials
        searchPromises.push(
          apiService.getEditorials({ search: query, limit: 5 }).then(response => {
            const editorials = Array.isArray(response.data) ? response.data : [];
            return editorials.map((editorial: any) => ({
              id: editorial.id,
              title: editorial.title || 'Untitled Editorial',
              subtitle: `${editorial.company?.name || 'Unknown Company'} • ${editorial.publication?.name || 'Unknown Publication'}`,
              type: 'editorial' as const,
              icon: <FileText className="h-4 w-4" />,
              data: editorial,
            }));
          }).catch(() => [])
        );

        // Search users (if admin/supervisor)
        searchPromises.push(
          apiService.getUsers({ search: query, limit: 5 }).then(response => {
            const users = Array.isArray(response.data) ? response.data : [];
            return users.map((user: any) => {
              const role = typeof user.role === 'object' ? user.role?.name || 'Unknown' : user.role;
              return {
                id: user.id,
                title: user.name,
                subtitle: `${user.email} • ${role}`,
                type: 'user' as const,
                icon: <Users className="h-4 w-4" />,
                data: user,
              };
            });
          }).catch(() => [])
        );

        // Search publications
        searchPromises.push(
          apiService.getPublications({ search: query, limit: 5 }).then(response => {
            const publications = Array.isArray(response.data) ? response.data : [];
            return publications.map((publication: any) => ({
              id: publication.id,
              title: publication.name,
              subtitle: `${publication.type} • ${publication.country}`,
              type: 'publication' as const,
              icon: <Database className="h-4 w-4" />,
              data: publication,
            }));
          }).catch(() => [])
        );

        const searchResults = await Promise.all(searchPromises);
        const allResults = searchResults.flat();

        // Add company results - only if we actually searched for companies
        const companySearchResults = (shouldSearchCompanies && Array.isArray(companyResults))
          ? companyResults.map((company: any) => ({
              id: company.id,
              title: company.name,
              subtitle: `${company.industry} • ${company.website || 'No website'}`,
              type: 'company' as const,
              icon: <Building2 className="h-4 w-4" />,
              data: company,
            }))
          : [];

        setResults([...companySearchResults, ...allResults]);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchOtherEntities, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, companyResults]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    onResultSelect?.(result);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    setResults([]);
    inputRef.current?.focus();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'company':
        return 'bg-blue-100 text-blue-800';
      case 'editorial':
        return 'bg-green-100 text-green-800';
      case 'user':
        return 'bg-purple-100 text-purple-800';
      case 'publication':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isLoading = loading || companyLoading;

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {!isLoading && results.length === 0 && query.length >= 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found for "{query}"
              </div>
            )}

            {!isLoading && query.length < 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="divide-y">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-muted-foreground">
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm truncate">
                            {result.title}
                          </p>
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", getTypeColor(result.type))}
                          >
                            {result.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="p-2 border-t bg-muted/20">
                <p className="text-xs text-muted-foreground text-center">
                  Showing {results.length} results
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Hook for using global search in components
export function useGlobalSearch() {
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);

  const addToHistory = (result: SearchResult) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => 
        !(item.type === result.type && item.id === result.id)
      );
      return [result, ...filtered].slice(0, 10); // Keep last 10 searches
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  return {
    searchHistory,
    addToHistory,
    clearHistory,
  };
}
