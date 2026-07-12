import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import ResearchReport from './components/ResearchReport';
import HistorySidebar from './components/HistorySidebar';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [searchedCompany, setSearchedCompany] = useState('');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('ai_investment_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ai_investment_history', JSON.stringify(history));
  }, [history]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const companyToSearch = query.trim();

    // Optionally load from history instantly without refetching if desired
    // const existing = history.find(h => h.companyName.toLowerCase() === companyToSearch.toLowerCase());
    // if (existing) {
    //   loadFromHistory(existing.companyName, existing.report);
    //   return;
    // }

    setLoading(true);
    setError(null);
    setReport(null);
    setSearchedCompany(companyToSearch);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyName: companyToSearch }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch research');
      }

      setReport(data);
      
      // Update history, keeping only unique companies (remove old version if it exists)
      setHistory(prev => {
        const filtered = prev.filter(h => h.companyName.toLowerCase() !== companyToSearch.toLowerCase());
        return [{ id: Date.now().toString(), companyName: companyToSearch, report: data }, ...filtered];
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (companyName, reportData) => {
    setQuery(companyName);
    setSearchedCompany(companyName);
    setReport(reportData);
    setError(null);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your search history?')) {
      setHistory([]);
      setReport(null);
      setQuery('');
      setSearchedCompany('');
    }
  };

  return (
    <>
      <div className="bg-orb-1"></div>
      <div className="bg-orb-2"></div>
      <div className="app-layout">
        <HistorySidebar 
          history={history} 
          onSelect={loadFromHistory} 
          onClear={clearHistory}
          currentCompany={searchedCompany}
        />
        
        <main className="container">
          <header className="header">
            <h1 className="title">AI Investment Agent</h1>
            <p className="subtitle">Enter a company name to get real-time AI investment analysis.</p>
          </header>

          <form className="search-container" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="e.g. Nvidia, Apple, Tesla..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="search-button" disabled={loading || !query.trim()}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              Analyze
            </button>
          </form>

          {loading && (
            <div className="loading-container">
              <div className="spinner-ring"></div>
              <p className="loading-text">Researching market data and latest news...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p><strong>Error:</strong> {error}</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                Please make sure the backend is running and you have set your API key in the .env file.
              </p>
            </div>
          )}

          {!loading && !error && report && (
            <ResearchReport report={report} companyName={searchedCompany} />
          )}
        </main>
      </div>
    </>
  );
}

export default App;
