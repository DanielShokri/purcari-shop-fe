// @ts-nocheck
// Type instantiation depth issues with Convex useQuery API
import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/api';
import { VStack, Box, Flex, HStack, Text, Button, Card, Menu, Portal } from '@chakra-ui/react';
import { LoadingState, PageHeader, DeleteConfirmationDialog, SearchInput } from '../components/shared';
import { AnnouncementsTable } from '../components/systemAnnouncements';
import { AnnouncementEditor } from '../components/systemAnnouncements';
import { useEntityList } from '../hooks/useEntityList';
import { SystemAnnouncement, SystemAnnouncementStatus } from '@shared/types';

// Status options for filter
const statusOptions = [
  { value: 'all', label: 'כל הסטטוסים' },
  { value: SystemAnnouncementStatus.ACTIVE, label: 'פעיל' },
  { value: SystemAnnouncementStatus.SCHEDULED, label: 'מתוזמן' },
  { value: SystemAnnouncementStatus.EXPIRED, label: 'פג תוקף' },
  { value: SystemAnnouncementStatus.DRAFT, label: 'טיוטה' },
];

// Filter toolbar component
function AnnouncementsFilterToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}) {
  const getStatusLabel = (status: string) => {
    const found = statusOptions.find(opt => opt.value === status);
    return found?.label || 'כל הסטטוסים';
  };

  return (
    <Box pb="6" flexShrink={0}>
      <Card.Root>
        <Card.Body p="4">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="space-between"
            gap="4"
          >
            {/* Search */}
            <SearchInput
              placeholder="חיפוש הודעות..."
              value={searchTerm}
              onChange={onSearchChange}
              width={{ base: 'full', md: '80' }}
            />

            {/* Filter Buttons */}
            <HStack gap="3" flexWrap="wrap" w={{ base: 'full', md: 'auto' }}>
              {/* Status Filter */}
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="ghost" size="sm" bg="bg.subtle" px="3" py="2.5">
                    <Text as="span">
                      סטטוס: {getStatusLabel(statusFilter)}
                    </Text>
                    <Text as="span" className="material-symbols-outlined" fontSize="18px" color="fg.muted">
                      keyboard_arrow_down
                    </Text>
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      {statusOptions.map((option) => (
                        <Menu.Item
                          key={option.value}
                          value={option.value}
                          onClick={() => onStatusFilterChange(option.value)}
                        >
                          {option.label}
                        </Menu.Item>
                      ))}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </HStack>
          </Flex>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}

export default function SystemAnnouncements() {
  const createMutation = useMutation(api.systemAnnouncements.create);
  const updateMutation = useMutation(api.systemAnnouncements.update);
  const deleteMutation = useMutation(api.systemAnnouncements.remove);

  // Editor dialog state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<SystemAnnouncement | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Use entity list hook for list management
  const { items: announcements, isLoading, hasEverLoaded, state, handlers } = useEntityList<SystemAnnouncement>({
    query: api.systemAnnouncements.list,
    filters: [
      { key: 'search', type: 'search' },
      { key: 'status', type: 'select', field: 'status', defaultValue: 'all' },
    ],
    itemsPerPage: 10,
    enableSelection: true,
  });

  const { paginatedItems, totalPages, currentPage, itemsPerPage, filters, selectedItems, deleteDialog } = state;
  const { setFilter, setPage, toggleSelection, selectAll, clearSelection, openDeleteDialog, closeDeleteDialog, confirmDelete } = handlers;

  // Open editor for new announcement
  const handleCreate = () => {
    setEditingAnnouncement(null);
    setEditorOpen(true);
  };

  // Open editor for existing announcement
  const handleEdit = (id: string) => {
    const announcement = announcements?.find((a) => a._id === id);
    if (announcement) {
      setEditingAnnouncement(announcement);
      setEditorOpen(true);
    }
  };

  // Close editor
  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditingAnnouncement(null);
  };

  // Save announcement (create or update)
  const handleSave = async (data: any) => {
    setIsSaving(true);
    try {
      if (editingAnnouncement) {
        // Update existing
        await updateMutation({
          id: editingAnnouncement._id,
          ...data,
        });
      } else {
        // Create new
        await createMutation(data);
      }
      handleCloseEditor();
    } catch (error) {
      console.error('Failed to save announcement:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Only show spinner on first load (cold cache), not on return visits
  if (isLoading && !hasEverLoaded) return <LoadingState message="טוען הודעות מערכת..." />;

  return (
    <VStack gap="0" align="stretch" h="full">
      <PageHeader
        title="הודעות מערכת"
        subtitle="ניהול והפצה של התראות והודעות לכלל משתמשי המערכת"
        actionLabel="הודעה חדשה"
        actionIcon="add"
        onAction={handleCreate}
      />
      <AnnouncementsFilterToolbar
        searchTerm={filters.search}
        onSearchChange={(value) => setFilter('search', value)}
        statusFilter={filters.status}
        onStatusFilterChange={(value) => setFilter('status', value)}
      />
      <AnnouncementsTable
        announcements={paginatedItems}
        selectedAnnouncements={selectedItems}
        onSelectAll={(checked) => checked ? selectAll() : clearSelection()}
        onSelectAnnouncement={(id, checked) => toggleSelection(id)}
        onEdit={handleEdit}
        onDelete={(id) => {
          const announcement = announcements?.find((a) => a._id === id);
          if (announcement) openDeleteDialog(announcement);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={state.filteredItems.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setPage}
      />
      
      {/* Editor Dialog */}
      <AnnouncementEditor
        isOpen={editorOpen}
        onClose={handleCloseEditor}
        announcement={editingAnnouncement}
        onSave={handleSave}
        isLoading={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={() => confirmDelete(deleteMutation)}
        isLoading={deleteDialog.isDeleting}
        title="מחיקת הודעת מערכת"
        message="האם אתה בטוח שברצונך למחוק הודעה זו? פעולה זו לא ניתנת לביטול."
      />
    </VStack>
  );
}
