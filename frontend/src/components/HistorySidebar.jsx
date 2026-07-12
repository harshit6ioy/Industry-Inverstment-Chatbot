import React from 'react';
import { Clock, Trash2, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';

export default function HistorySidebar({ history, onSelect, onClear, currentCompany }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">
          <Clock size={20} />
          Search History
        </h3>
        {history.length > 0 && (
          <button 
            className="clear-history-btn" 
            onClick={onClear} 
            title="Clear History"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-history">
          <p>Your previous analyses will appear here.</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const isInvest = item.report.decision.toLowerCase() === 'invest';
            const isActive = currentCompany === item.companyName;
            
            return (
              <button
                key={item.id}
                className={`history-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelect(item.companyName, item.report)}
              >
                <div className="history-item-content">
                  <span className="history-company">{item.companyName}</span>
                  <div className={`history-decision ${isInvest ? 'invest' : 'pass'}`}>
                    {isInvest ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {item.report.decision}
                  </div>
                </div>
                <ChevronRight size={16} className="history-arrow" />
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
