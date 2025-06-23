import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Decode or fetch user from backend using token if needed
      const base64Payload = token.split('.')[1];
      const user = JSON.parse(atob(base64Payload));
      login(token, user);
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  }, []);

  return <div>Logging you in...</div>;
}
