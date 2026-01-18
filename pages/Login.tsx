import React from 'react';
import { useForm } from 'react-hook-form';
import { useLoginMutation } from '../services/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  Card,
  Field,
  Alert,
} from '@chakra-ui/react';
import { ColorModeButton } from '../components/ui/color-mode';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials({ user: result }));
      navigate('/');
    } catch (err) {
      console.error('Login failed', err);
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
                    שגיאה בהתחברות. נסה: admin@demo.com / Demo123456!
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
                    defaultValue="admin@demo.com"
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
                    defaultValue="Demo123456!"
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
                  loadingText="מתחבר..."
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
              גרסת הדגמה - השתמש בפרטים המופיעים בשדה
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Flex>
  );
}
