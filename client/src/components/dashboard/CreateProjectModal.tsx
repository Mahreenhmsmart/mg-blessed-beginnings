import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Input, Modal } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { createNewProject } from '@/store/slices/projectsSlice';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Shared modal form for creating a new project.
 * Reusable from DashboardProjects, DashboardLayout project selector,
 * and DashboardOverview empty-state.
 */
export default function CreateProjectModal({ open, onClose }: CreateProjectModalProps) {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((s) => s.projects);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [competitors, setCompetitors] = useState('');

  const resetForm = () => {
    setName('');
    setUrl('');
    setCompetitors('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!url.trim() || !name.trim()) {
      dispatch(addToast({ message: 'Project name and website URL are required.', variant: 'error' }));
      return;
    }

    const competitorList = competitors
      .split(/[\n,]+/)
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      await dispatch(
        createNewProject({ url: url.trim(), name: name.trim(), competitors: competitorList }),
      ).unwrap();
      dispatch(addToast({ message: 'Project created successfully!', variant: 'success' }));
      handleClose();
    } catch {
      dispatch(addToast({ message: 'Failed to create project', variant: 'error' }));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create New Project"
      footer={
        <div
          className="flex justify-end gap-2"
          data-icod-id="src_components_dashboard_createprojectmodal_tsx_1214">
          <Button
            variant="outline"
            onClick={handleClose}
            data-icod-id="src_components_dashboard_createprojectmodal_tsx_e2c9">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={status === 'loading'}
            data-icod-id="src_components_dashboard_createprojectmodal_tsx_4d1c">
            <Plus
              className="mr-2 h-4 w-4"
              data-icod-id="src_components_dashboard_createprojectmodal_tsx_562f" />
            Create Project
          </Button>
        </div>
      }
      data-icod-id="src_components_dashboard_createprojectmodal_tsx_6722">
      <div
        className="space-y-4"
        data-icod-id="src_components_dashboard_createprojectmodal_tsx_2f5f">
        <div data-icod-id="src_components_dashboard_createprojectmodal_tsx_7fc0">
          <label
            htmlFor="create-project-name"
            className="mb-1.5 block text-sm font-medium text-foreground"
            data-icod-id="src_components_dashboard_createprojectmodal_tsx_454f">
            Project Name
          </label>
          <Input
            id="create-project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Website"
            data-icod-id="src_components_dashboard_createprojectmodal_tsx_db3e" />
        </div>
        <div data-icod-id="src_components_dashboard_createprojectmodal_tsx_1f5e">
          <label
            htmlFor="create-project-url"
            className="mb-1.5 block text-sm font-medium text-foreground"
            data-icod-id="src_components_dashboard_createprojectmodal_tsx_73ae">
            Website URL
          </label>
          <Input
            id="create-project-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            data-icod-id="src_components_dashboard_createprojectmodal_tsx_d908" />
        </div>
        <div data-icod-id="src_components_dashboard_createprojectmodal_tsx_c6c8">
          <label
            htmlFor="create-project-competitors"
            className="mb-1.5 block text-sm font-medium text-foreground"
            data-icod-id="src_components_dashboard_createprojectmodal_tsx_2ce6">
            Competitor URLs (optional, comma-separated)
          </label>
          <Input
            id="create-project-competitors"
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            placeholder="https://comp1.com, https://comp2.com"
            data-icod-id="src_components_dashboard_createprojectmodal_tsx_91a9" />
        </div>
      </div>
    </Modal>
  );
}
