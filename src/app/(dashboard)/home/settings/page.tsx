"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/constants';

interface UserData {
  name: string;
  username: string;
  email: string;
  mobile: string;
}

const Settings = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    username: '',
    email: '',
    mobile: '',
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setUserData({
          name: data.user.name || '',
          username: data.user.username || '',
          email: data.user.email || '',
          mobile: data.user.mobile || '',
        });
      } else {
        toast.error('Failed to load user settings');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
      if (res.ok) {
        toast.success('Logged out successfully');
        router.push('/auth');
      } else {
        toast.error('Failed to log out');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error logging out');
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!userData.name.trim()) newErrors.name = 'Name is required';
    if (!userData.username.trim()) newErrors.username = 'Username is required';
    if (!userData.email.trim()) newErrors.email = 'Email is required';
    // Basic email regex
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (password) {
      if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: password || undefined
      };

      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Settings updated successfully');
        setPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || 'Failed to update settings');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <Button variant="outline" onClick={handleLogout} type="button">
          Log Out
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Input
            label="Name"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            error={errors.name}
            placeholder="Your Name"
          />

          <Input
            label="Username"
            value={userData.username}
            onChange={(e) => setUserData({ ...userData, username: e.target.value })}
            error={errors.username}
            placeholder="Username"
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          value={userData.email}
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
          error={errors.email}
          placeholder="john@example.com"
        />

        <Input
          label="Mobile Number"
          value={userData.mobile}
          disabled
          helperText="Mobile number cannot be edited."
          className="bg-gray-100 text-gray-500 cursor-not-allowed"
        />

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <div className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="Leave blank to keep current password"
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" isLoading={submitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;