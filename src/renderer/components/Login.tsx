import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
  IconButton,
} from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../context/AuthContext';

interface LoginProps {
  onBack?: () => void;
}

function Login({ onBack }: LoginProps) {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.error) {
          setError(result.error);
        }
      } else {
        const result = await signup(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          setSuccessMessage('Account created! Please check your email to verify.');
          setIsLogin(true);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMessage('');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8fafc',
      }}
    >
      {/* Back button */}
      {onBack && (
        <Box sx={{ p: 2 }}>
          <IconButton onClick={onBack} sx={{ color: 'text.secondary' }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
      )}
      
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Card
          sx={{
            maxWidth: 420,
            width: '100%',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 72,
                height: 72,
                bgcolor: 'primary.light',
                borderRadius: 3,
                mb: 2,
              }}
            >
              <SmartToyIcon sx={{ fontSize: 36, color: 'primary.dark' }} />
            </Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              ByChat
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {isLogin
                ? 'Welcome back! Sign in to continue.'
                : 'Create an account to get started.'}
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                {successMessage}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              autoComplete="email"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8fafc',
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8fafc',
                },
              }}
            />

            {!isLogin && (
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                autoComplete="new-password"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                  },
                }}
              />
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={toggleMode}
                  sx={{ cursor: 'pointer', fontWeight: 600 }}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      </Box>
    </Box>
  );
}

export default Login;
