import React from 'react';
import ReactMarkdown from 'react-markdown';
import { TrendingUp, TrendingDown, ExternalLink, Link as LinkIcon, Building2, Activity, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ResearchReport({ report, companyName }) {
  if (!report) return null;

  const isInvest = report.decision.toLowerCase() === 'invest';
  const md = report.marketData;
  const isPositive = md ? md.change >= 0 : false;

  return (
    <div className="report-card">
      <div className="report-header">
        <h2 className="company-name">
          <Building2 size={32} />
          {companyName} {md && <span className="ticker-badge">{md.ticker}</span>}
        </h2>
        <div className={`decision-badge ${isInvest ? 'decision-invest' : 'decision-pass'}`}>
          {isInvest ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
          {report.decision}
        </div>
      </div>

      {md && md.history && md.history.length > 0 && (
        <div className="dashboard-grid">
          <div className="metrics-row">
            <div className="metric-card">
              <div className="metric-icon"><DollarSign size={20} /></div>
              <div className="metric-info">
                <span className="metric-label">Current Price</span>
                <span className="metric-value">${md.currentPrice}</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><Activity size={20} /></div>
              <div className="metric-info">
                <span className="metric-label">1-Day Change</span>
                <span className={`metric-value ${isPositive ? 'text-green' : 'text-red'}`}>
                  {isPositive ? '+' : ''}{md.change} ({isPositive ? '+' : ''}{md.changePercent}%)
                </span>
              </div>
            </div>
          </div>
          
          <div className="chart-container">
            <h3 className="chart-title">1-Month Price Trend</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={md.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,15,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="price" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      <div className="markdown-content">
        <ReactMarkdown>{report.reasoning}</ReactMarkdown>
      </div>

      {report.sources && report.sources.length > 0 && (
        <div className="sources-section">
          <h3 className="sources-title">
            <LinkIcon size={18} />
            Sources & References
          </h3>
          <div className="sources-list">
            {report.sources.map((source, idx) => (
              <a 
                key={idx} 
                href={source.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="source-item"
              >
                <ExternalLink size={14} />
                {source.title || source.url}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
