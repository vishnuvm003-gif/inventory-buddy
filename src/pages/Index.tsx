import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/manager');
      }
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, role, navigate]);

  return null;
};

export default Index;
