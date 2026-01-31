import React from 'react';
import { Flex, VStack, Spinner, Text } from '@chakra-ui/react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'טוען נתונים...' }: LoadingStateProps) {
  return (
    <Flex p="10" justifyContent="center" alignItems="center" minH="400px">
      <VStack gap="4">
        <Spinner size="lg" color="blue.500" />
        <Text color="fg.muted">{message}</Text>
      </VStack>
    </Flex>
  );
}
