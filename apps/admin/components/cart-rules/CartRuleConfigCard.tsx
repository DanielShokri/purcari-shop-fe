import React from 'react';
import {
  Card,
  HStack,
  Heading,
  Text,
  Input,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { CartRule, CartRuleType } from '@shared/types';

interface CartRuleConfigCardProps {
  register: UseFormRegister<Partial<CartRule>>;
  errors: FieldErrors<Partial<CartRule>>;
  ruleType: CartRuleType | undefined;
  getValueLabel: (type: CartRuleType | undefined) => string;
}

export default function CartRuleConfigCard({
  register,
  errors,
  ruleType,
  getValueLabel,
}: CartRuleConfigCardProps) {
  return (
    <Card.Root>
      <Card.Header
        px="6"
        py="4"
        borderBottomWidth="1px"
        borderColor="border"
        bg="bg.subtle"
      >
        <HStack gap="2">
          <Text as="span" className="material-symbols-outlined" fontSize="lg" color="blue.500">
            tune
          </Text>
          <Heading size="md" color="fg">
            הגדרות
          </Heading>
        </HStack>
      </Card.Header>
      <Card.Body p="6">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="5">
          <VStack align="start" gap="1.5">
            <Text fontSize="sm" fontWeight="semibold" color="fg">
              עדיפות
            </Text>
            <Input
              {...register('priority', {
                required: 'שדה חובה',
                valueAsNumber: true,
                min: { value: 1, message: 'ערך מינימלי: 1' },
                max: { value: 99, message: 'ערך מקסימלי: 99' }
              })}
              type="number"
              placeholder="10"
              bg="bg.subtle"
              borderColor="border"
              _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
            />
            <Text fontSize="xs" color="fg.muted">
              מספר נמוך יותר = עדיפות גבוהה יותר
            </Text>
            {errors.priority && (
              <Text fontSize="xs" color="red.500">{errors.priority.message}</Text>
            )}
          </VStack>
          <VStack align="start" gap="1.5">
            <Text fontSize="sm" fontWeight="semibold" color="fg">
              {getValueLabel(ruleType)}
            </Text>
            <Input
              {...register('value', {
                valueAsNumber: true,
                min: { value: 0, message: 'ערך חיובי בלבד' },
                max: ruleType === CartRuleType.DISCOUNT
                  ? { value: 100, message: 'אחוז הנחה מקסימלי: 100' }
                  : undefined,
                validate: (value) => {
                  if (value !== undefined && value !== null && isNaN(value)) {
                    return 'ערך לא תקין';
                  }
                  return true;
                }
              })}
              type="number"
              step="0.01"
              placeholder="0"
              bg="bg.subtle"
              borderColor="border"
              _focus={{ ring: 2, ringColor: 'blue.500/20', borderColor: 'blue.500' }}
            />
            {errors.value && (
              <Text fontSize="xs" color="red.500">{errors.value.message}</Text>
            )}
          </VStack>
        </SimpleGrid>
      </Card.Body>
    </Card.Root>
  );
}
