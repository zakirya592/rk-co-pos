
import React, { useState } from 'react';
import { Card, CardBody, Input, Button, Divider } from '@nextui-org/react';
import { FaUser, FaLock, FaStore } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full">
                <FaStore className="text-white text-3xl" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">RK & Co</h1>
            <p className="text-gray-600">Point of Sales System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              startContent={<FaUser className="text-gray-400" />}
              variant="bordered"
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<FaLock className="text-gray-400" />}
              variant="bordered"
              required
            />

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3"
              size="lg"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          <Divider className="my-6" />

          <div className="text-center text-sm text-gray-600">
            Demo credentials: admin / password
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;
