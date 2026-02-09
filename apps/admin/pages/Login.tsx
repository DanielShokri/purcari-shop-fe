import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Flex,
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  Card,
  Alert,
  Field,
} from '@chakra-ui/react';
import { ColorModeButton } from '../components/ui/color-mode';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const { signIn, signOut } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for access denied message from ProtectedRoute redirect
  useEffect(() => {
    const state = location.state as { accessDenied?: boolean } | null;
    if (state?.accessDenied) {
      setError('גישה נדחתה - מערכת ניהול למנהלים בלבד');
      // Sign out non-admin user
      signOut();
      // Clear the state so error doesn't persist on refresh
      navigate('/login', { replace: true, state: {} });
    }
  }, [location, navigate, signOut]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Sign in with Convex Auth - let the Authenticated section handle the redirect
      await signIn("password", { 
        email: data.email, 
        password: data.password, 
        flow: "signIn" 
      });
      // Sign in succeeded! The app will switch to <Authenticated> section
      // and redirect to / from there
    } catch (err: any) {
      const message = err?.message || '';
      if (message.includes('User does not exist') || message.includes('Invalid credentials')) {
        setError('לא קיים משתמש עם כתובת אימייל זו');
      } else if (message.includes('Incorrect password')) {
        setError('הסיסמה שהוזנה אינה נכונה');
      } else {
        setError('שם משתמש או סיסמה שגויים');
      }
      setIsLoading(false);
    }
  };

  return (
    <Flex
      minH="100vh"
      bg="bg.subtle"
      alignItems="center"
      justifyContent="center"
      p="4"
      position="relative"
    >
      {/* Dark Mode Toggle */}
      <Box position="absolute" top="4" left="4">
        <ColorModeButton />
      </Box>

      <Card.Root
        w="full"
        maxW="md"
        shadow="xl"
        borderWidth="1px"
        borderColor="border.muted"
      >
        <Card.Body p="8">
          <VStack gap="8" align="stretch">
            {/* Header */}
            <VStack gap="2" textAlign="center">
              <Heading size="2xl" color="fg">
                כניסה למערכת
              </Heading>
              <Text color="fg.muted">
                הזן את פרטי ההתחברות שלך
              </Text>
            </VStack>

            {/* Error Alert */}
            {error && (
              <Alert.Root status="error" variant="subtle" rounded="lg">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description fontSize="sm" textAlign="center">
                    {typeof error === 'string' ? error : 'שם משתמש או סיסמה שגויים'}
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack gap="5" align="stretch">
                <Field.Root invalid={!!errors.email}>
                  <Field.Label fontSize="sm" fontWeight="medium" color="fg.muted">
                    אימייל
                  </Field.Label>
                  <Input
                    {...register('email', { required: 'שדה חובה' })}
                    type="email"
                    placeholder="your@email.com"
                    dir="ltr"
                    size="lg"
                  />
                  {errors.email && (
                    <Field.ErrorText>{errors.email.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
                  <Field.Label fontSize="sm" fontWeight="medium" color="fg.muted">
                    סיסמה
                  </Field.Label>
                  <Input
                    {...register('password', { required: 'שדה חובה' })}
                    type="password"
                    placeholder="********"
                    dir="ltr"
                    size="lg"
                  />
                  {errors.password && (
                    <Field.ErrorText>{errors.password.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Button
                  type="submit"
                  loading={isLoading}
                  loadingText="מאמת הרשאות..."
                  colorPalette="blue"
                  size="lg"
                  w="full"
                  fontWeight="bold"
                  shadow="lg"
                  css={{ boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3)' }}
                >
                  התחבר
                </Button>
              </VStack>
            </form>

            {/* Footer */}
            <Text fontSize="xs" color="fg.subtle" textAlign="center">
              מערכת ניהול - גישה למנהלים בלבד
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Flex>
  );
}
