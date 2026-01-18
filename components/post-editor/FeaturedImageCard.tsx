import React from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  Input,
  IconButton,
  Image,
} from '@chakra-ui/react';

interface FeaturedImageCardProps {
  imageUrl?: string;
  onImageUrlChange?: (url: string) => void;
}

export default function FeaturedImageCard({ imageUrl, onImageUrlChange }: FeaturedImageCardProps) {
  const hasImage = imageUrl && imageUrl.trim() !== '';

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
        <VStack gap="4" align="stretch">
          {/* Image Preview */}
          <Box
            w="full"
            aspectRatio="16/9"
            bg="bg.subtle"
            rounded="lg"
            borderWidth="2px"
            borderStyle={hasImage ? "solid" : "dashed"}
            borderColor="border"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
            position="relative"
          >
            {hasImage ? (
              <>
                <Image
                  src={imageUrl}
                  alt="תמונת מוצר"
                  objectFit="cover"
                  w="full"
                  h="full"
                />
                <IconButton
                  aria-label="הסר תמונה"
                  size="sm"
                  variant="solid"
                  colorPalette="red"
                  position="absolute"
                  top="2"
                  left="2"
                  onClick={() => onImageUrlChange?.('')}
                >
                  <Text as="span" className="material-symbols-outlined" fontSize="18px">
                    close
                  </Text>
                </IconButton>
              </>
            ) : (
              <VStack gap="2" p="4" textAlign="center">
                <Text as="span" className="material-symbols-outlined" fontSize="4xl" color="fg.muted" mb="2">
                  image
                </Text>
                <Text fontSize="sm" fontWeight="medium" color="fg.muted">
                  הזן כתובת URL לתמונה
                </Text>
              </VStack>
            )}
          </Box>

          {/* URL Input */}
          <HStack gap="2">
            <Input
              size="sm"
              dir="ltr"
              textAlign="left"
              value={imageUrl || ''}
              onChange={(e) => onImageUrlChange?.(e.target.value)}
              placeholder="https://example.com/image.jpg"
              bg="bg.subtle"
              borderColor="border"
              _focus={{ ringColor: 'blue.500', borderColor: 'blue.500' }}
            />
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
