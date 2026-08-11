const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

const files = {
  'context/AuthContext.jsx': `import React, { createContext, useState, useEffect, useContext } from 'react';
import { httpClient, setAuthToken } from '../services/httpClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await httpClient.get('/users/me');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to fetch user', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await httpClient.post('/auth/login', { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    setTokenState(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTokenState(null);
    setUser(null);
    setAuthToken(null);
  };

  const updateProfile = async (data) => {
    const response = await httpClient.put('/users/me', data);
    setUser(response.data);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
`,
  'components/SkeletonLoader.jsx': `import React from 'react';

export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    if (type === 'card') {
      return (
        <div className="skeleton-box h-32 w-full rounded-xl mb-4 glass-card"></div>
      );
    } else if (type === 'table') {
      return (
        <div className="w-full">
          <div className="skeleton-box h-10 w-full mb-2 rounded"></div>
          <div className="skeleton-box h-10 w-full mb-2 rounded"></div>
          <div className="skeleton-box h-10 w-full mb-2 rounded"></div>
        </div>
      );
    }
    return <div className="skeleton-box h-4 w-full mb-2 rounded"></div>;
  };

  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
      ))}
    </>
  );
};
`,
  'components/StatsCard.jsx': `import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

export const StatsCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <div className="glass-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-text-secondary text-sm font-medium">{title}</h3>
        <div className="p-2 bg-bg-app rounded-lg">
          <Icon className="w-5 h-5 text-color-primary" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <h2 className="text-3xl font-bold text-text-primary">{value}</h2>
        {trend && (
          <div className={\`flex items-center text-sm \${trend > 0 ? 'text-color-success' : 'text-color-danger'}\`}>
            {trend > 0 ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};
`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(srcDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
  console.log('Created:', filePath);
});
