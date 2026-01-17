import React from 'react';
import { UseFormRegister } from 'react-hook-form';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  Card,
  NativeSelect,
} from '@chakra-ui/react';
import { Product, ProductStatus } from '../../types';

interface PublishCardProps {
  register: UseFormRegister<Partial<Product>>;
  isEditMode: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onDelete: () => void;
}

export default function PublishCard({
  register,
  isEditMode,
  isCreating,
  isUpdating,
  isDeleting,
  onDelete
}: PublishCardProps) {
  return (
    <Card.Root>
      <Card.Header
        px="5"
        py="4"
        borderBottomWidth="1px"
        borderColor="border"
        bg="bg.subtle"
      >
        <Flex justify="space-between" alignItems="center">
          <Heading size="md" color="fg">
            פרסום
          </Heading>
          <Text as="span" className="material-symbols-outlined" fontSize="lg" color="fg.muted">
            public
          </Text>
        </Flex>
      </Card.Header>
      <Card.Body p="5">
        <VStack gap="4" align="stretch">
          {/* Status */}
          <VStack align="start" gap="2">
            <Text fontSize="xs" fontWeight="bold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
              סטטוס
            </Text>
            <NativeSelect.Root
              size="sm"
              bg="bg.subtle"
              borderColor="border"
              _focus={{ ringColor: 'blue.500', borderColor: 'blue.500' }}
            >
              <NativeSelect.Field {...register('status')}>
                <option value={ProductStatus.PUBLISHED}>פורסם</option>
                <option value={ProductStatus.DRAFT}>טיוטה</option>
                <option value={ProductStatus.ARCHIVED}>ממתין לאישור</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator>
                <Text as="span" className="material-symbols-outlined" fontSize="xl" color="fg.muted">
                  expand_more
                </Text>
              </NativeSelect.Indicator>
            </NativeSelect.Root>
          </VStack>

          {/* Publish Date */}
          <VStack align="start" gap="2">
            <Text fontSize="xs" fontWeight="bold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
              תאריך פרסום
            </Text>
            <Box position="relative" w="full">
              <Text as="span" className="material-symbols-outlined" position="absolute" top="50%" right="3" transform="translateY(-50%)" color="fg.muted" fontSize="lg" pointerEvents="none">
                calendar_today
              </Text>
              <Input
                type="text"
                size="sm"
                pr="10"
                defaultValue={new Date().toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                bg="bg.subtle"
                borderColor="border"
                _focus={{ ringColor: 'blue.500', borderColor: 'blue.500' }}
              />
            </Box>
          </VStack>

          {/* Author */}
          <VStack align="start" gap="2">
            <Text fontSize="xs" fontWeight="bold" color="fg.muted" textTransform="uppercase" letterSpacing="wider">
              מחבר
            </Text>
            <HStack gap="2" p="2" rounded="lg" bg="bg.subtle" borderWidth="1px" borderColor="border" w="full">
              <Box
                w="6"
                h="6"
                rounded="full"
                backgroundSize="cover"
                backgroundPosition="center"
                style={{
                  backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBAW1dBrko_2fxGEhdmwPtPN2bDMbEyyW9-4YrsVD5CuFoHoKR_N4R7TQKmIsj68jjEvXzAlZUEHqOpbJuV5iooCa165XCZnQeyEks8p0amtfgsXB12Hb74noPtI3yjBPn1j61dHYnV4tu9cHYlc9avy8yIHW7EtaihqJnpCdzfk1WMCsa-7RAeP4igG6zeS0umMnK9a0Np_y52pfZSFugOjvnqC9WCavHxTU-8oIdqqK9KGGL5o1ynR7F5QdeeDGqtyemQmMlK3g")',
                }}
              />
              <Text fontSize="sm" fontWeight="medium" color="fg">
                ישראל ישראלי
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </Card.Body>
      <Card.Footer
        px="5"
        py="4"
        borderTopWidth="1px"
        borderColor="border"
        bg="bg.subtle"
      >
        {isEditMode && (
          <Button
            variant="ghost"
            colorPalette="red"
            size="sm"
            onClick={onDelete}
            loading={isDeleting}
          >
            <Text as="span" className="material-symbols-outlined" fontSize="base">
              delete
            </Text>
            מחק
          </Button>
        )}
        <Button
          type="submit"
          colorPalette="blue"
          size="sm"
          loading={isCreating || isUpdating}
          loadingText={isEditMode ? 'מעדכן...' : 'שומר...'}
        >
          {isEditMode ? 'עדכן' : 'שמור'}
        </Button>
      </Card.Footer>
    </Card.Root>
  );
}
