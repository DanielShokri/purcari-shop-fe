import React from 'react';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Card,
} from '@chakra-ui/react';

export default function FeaturedImageCard() {
  return (
    <Card.Root>
      <Card.Header
        px="5"
        py="4"
        borderBottomWidth="1px"
        borderColor="border"
      >
        <Flex justify="space-between" alignItems="center">
          <Heading size="md" color="fg">
            תמונה ראשית
          </Heading>
          <Text as="span" className="material-symbols-outlined" fontSize="lg" color="fg.muted">
            image
          </Text>
        </Flex>
      </Card.Header>
      <Card.Body p="5">
        <Box
          w="full"
          aspectRatio="16/9"
          bg="bg.subtle"
          rounded="lg"
          borderWidth="2px"
          borderStyle="dashed"
          borderColor="border"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          _hover={{ bg: 'bg.muted' }}
          transition="colors"
        >
          <VStack gap="2" p="4" textAlign="center">
            <Text as="span" className="material-symbols-outlined" fontSize="4xl" color="fg.muted" mb="2">
              cloud_upload
            </Text>
            <Text fontSize="sm" fontWeight="medium" color="fg.muted">
              לחץ להעלאת תמונה
            </Text>
            <Text fontSize="xs" color="fg.subtle" mt="1">
              PNG, JPG עד 10MB
            </Text>
          </VStack>
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
