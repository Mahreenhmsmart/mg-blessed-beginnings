import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Globe, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToast } from '@/store/slices/uiSlice';
import { fetchProjects, updateExistingProject, deleteExistingProject } from '@/store/slices/projectsSlice';
import { Button, Input, Modal, Card, Spinner, Badge, EmptyState, Pagination } from '@/components/ui';
import DashboardCard from '@/components/dashboard/DashboardCard';
import CreateProjectModal from '@/components/dashboard/CreateProjectModal';
import type { Project } from '@/types';

const PROJECTS_PER_PAGE = 9;

export default function DashboardProjects() {
  const dispatch = useAppDispatch();
  const { items: projects, status, currentProjectId } = useAppSelector((s) => s.projects);
  
  const userRole = useAppSelector((s) => s.auth.user?.role) || 'viewer';
  const canWrite = userRole !== 'viewer';
  const isAdmin = userRole === 'admin';

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editCompetitors, setEditCompetitors] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProjects());
    }
  }, [status, dispatch]);

  // Pagination
  const totalPages = Math.ceil(projects.length / PROJECTS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    return projects.slice(start, start + PROJECTS_PER_PAGE);
  }, [projects, currentPage]);

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setEditName(project.name);
    setEditUrl(project.url);
    setEditCompetitors(project.competitors?.join(', ') || '');
    setEditModalOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setDeleteModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedProject) return;

    const competitors = editCompetitors
      .split(/[\n,]+/)
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      await dispatch(updateExistingProject({
        id: selectedProject._id,
        data: {
          name: editName,
          url: editUrl,
          competitors,
        },
      })).unwrap();
      
      dispatch(addToast({ message: 'Project updated successfully', variant: 'success' }));
      setEditModalOpen(false);
    } catch {
      dispatch(addToast({ message: 'Failed to update project', variant: 'error' }));
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProject) return;

    try {
      await dispatch(deleteExistingProject(selectedProject._id)).unwrap();
      dispatch(addToast({ message: 'Project deleted successfully', variant: 'success' }));
      setDeleteModalOpen(false);
      setSelectedProject(null);
    } catch {
      dispatch(addToast({ message: 'Failed to delete project', variant: 'error' }));
    }
  };

  if (status === 'loading' && projects.length === 0) {
    return (
      <div
        className="flex justify-center py-16"
        data-icod-id="src_pages_dashboard_dashboardprojects_tsx_0f38">
        <Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardprojects_tsx_47f4" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-8"
      data-icod-id="src_pages_dashboard_dashboardprojects_tsx_13d8">
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardprojects_tsx_aead">
        <div data-icod-id="src_pages_dashboard_dashboardprojects_tsx_03bb">
          <h1
            className="font-heading text-2xl font-bold text-foreground sm:text-3xl tracking-tight"
            data-icod-id="src_pages_dashboard_dashboardprojects_tsx_b2ba">
            Projects
          </h1>
          <p
            className="mt-2 text-sm text-muted-foreground"
            data-icod-id="src_pages_dashboard_dashboardprojects_tsx_39f4">
            Manage your website projects and competitor tracking.
          </p>
        </div>
        {canWrite && (
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="shrink-0 shadow-[var(--shadow-glow-sm)] hover:shadow-[var(--shadow-glow)]"
            data-icod-id="src_pages_dashboard_dashboardprojects_tsx_ea2c">
            <Plus
              className="mr-2 h-4 w-4"
              data-icod-id="src_pages_dashboard_dashboardprojects_tsx_fd6c" />
            Create Project
          </Button>
        )}
      </div>
      {projects.length === 0 ? (
        <DashboardCard
          heading="Your Projects"
          data-icod-id="src_pages_dashboard_dashboardprojects_tsx_8389">
          <EmptyState
            icon={Globe}
            title="No projects yet"
            description="Create a project from the Overview page to start analyzing your website."
            data-icod-id="src_pages_dashboard_dashboardprojects_tsx_d084" />
        </DashboardCard>
      ) : (
        <>
          <div
            className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
            data-icod-id="src_pages_dashboard_dashboardprojects_tsx_41ad">
            {paginatedProjects.map((project) => (
              <Card
                key={project._id}
                className={`relative overflow-hidden p-6 transition-all hover:shadow-md ${
                  currentProjectId === project._id ? 'ring-2 ring-primary' : ''
                }`}
                data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_52bb_${project._id}`}>
              {currentProjectId === project._id && (
                <Badge
                  variant="new"
                  className="absolute right-4 top-4"
                  data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_f979_${project._id}`}>
                  Active
                </Badge>
              )}
              
              <div
                className="mb-4 flex items-start gap-3"
                data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_fd50_${project._id}`}>
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                  data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_c8b9_${project._id}`}>
                  <Globe
                    className="h-6 w-6"
                    data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_2d87_${project._id}`} />
                </div>
                <div
                  className="min-w-0 flex-1"
                  data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_310b_${project._id}`}>
                  <h3
                    className="truncate font-semibold text-foreground"
                    data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_a03d_${project._id}`}>{project.name}</h3>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 truncate text-sm text-muted-foreground hover:text-primary"
                    data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_bc80_${project._id}`}>
                    {project.url}
                    <ExternalLink
                      className="h-3 w-3"
                      data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_8e98_${project._id}`} />
                  </a>
                </div>
              </div>

              <div
                className="mb-4 space-y-2"
                data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_a6f2_${project._id}`}>
                <div
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                  data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_5e1f_${project._id}`}>
                  <Users
                    className="h-4 w-4"
                    data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_c1c9_${project._id}`} />
                  <span
                    data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_a725_${project._id}`}>{project.competitors?.length || 0} competitors</span>
                </div>
                <div
                  className="text-xs text-muted-foreground"
                  data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_e91a_${project._id}`}>
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div
                className="flex gap-2 border-t border-border/50 pt-4"
                data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_7a6f_${project._id}`}>
                {canWrite && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(project)}
                    className="flex-1"
                    data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_68f7_${project._id}`}>
                    <Edit2
                      className="mr-2 h-4 w-4"
                      data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_32c9_${project._id}`} />
                    Edit
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(project)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_752b_${project._id}`}>
                    <Trash2
                      className="h-4 w-4"
                      data-icod-id={`src_pages_dashboard_dashboardprojects_tsx_60c1_${project._id}`} />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="mt-8"
            data-icod-id="src_pages_dashboard_dashboardprojects_tsx_2f5e">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              data-icod-id="src_pages_dashboard_dashboardprojects_tsx_6dcd" />
          </div>
        )}
        </>
      )}
      {/* Edit Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Project"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_dashboard_dashboardprojects_tsx_7f39">
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
              data-icod-id="src_pages_dashboard_dashboardprojects_tsx_1c39">
              Cancel
            </Button>
            {canWrite && (
              <Button
                onClick={handleSaveEdit}
                loading={status === 'loading'}
                data-icod-id="src_pages_dashboard_dashboardprojects_tsx_7e2f">
                Save Changes
              </Button>
            )}
          </div>
        }
        data-icod-id="src_pages_dashboard_dashboardprojects_tsx_3467">
        <div
          className="space-y-4"
          data-icod-id="src_pages_dashboard_dashboardprojects_tsx_fb44">
          <div data-icod-id="src_pages_dashboard_dashboardprojects_tsx_1133">
            <label
              htmlFor="edit-name"
              className="mb-1.5 block text-sm font-medium text-foreground"
              data-icod-id="src_pages_dashboard_dashboardprojects_tsx_4398">
              Project Name
            </label>
            <Input
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="My Website"
              data-icod-id="src_pages_dashboard_dashboardprojects_tsx_d092" />
          </div>
          <div data-icod-id="src_pages_dashboard_dashboardprojects_tsx_7efc">
            <label
              htmlFor="edit-url"
              className="mb-1.5 block text-sm font-medium text-foreground"
              data-icod-id="src_pages_dashboard_dashboardprojects_tsx_8472">
              Website URL
            </label>
            <Input
              id="edit-url"
              type="url"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="https://example.com"
              data-icod-id="src_pages_dashboard_dashboardprojects_tsx_8ba0" />
          </div>
          <div data-icod-id="src_pages_dashboard_dashboardprojects_tsx_d244">
            <label
              htmlFor="edit-competitors"
              className="mb-1.5 block text-sm font-medium text-foreground"
              data-icod-id="src_pages_dashboard_dashboardprojects_tsx_2672">
              Competitor URLs (comma-separated)
            </label>
            <Input
              id="edit-competitors"
              value={editCompetitors}
              onChange={(e) => setEditCompetitors(e.target.value)}
              placeholder="https://comp1.com, https://comp2.com"
              data-icod-id="src_pages_dashboard_dashboardprojects_tsx_8d15" />
          </div>
        </div>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Project"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_dashboard_dashboardprojects_tsx_6dea">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              data-icod-id="src_pages_dashboard_dashboardprojects_tsx_fd31">
              Cancel
            </Button>
            {isAdmin && (
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                loading={status === 'loading'}
                data-icod-id="src_pages_dashboard_dashboardprojects_tsx_c82c">
                Delete Project
              </Button>
            )}
          </div>
        }
        data-icod-id="src_pages_dashboard_dashboardprojects_tsx_1eba">
        <p
          className="text-foreground"
          data-icod-id="src_pages_dashboard_dashboardprojects_tsx_937c">
          Are you sure you want to delete <strong data-icod-id="src_pages_dashboard_dashboardprojects_tsx_9c8f">{selectedProject?.name}</strong>?
        </p>
        <p
          className="mt-2 text-sm text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardprojects_tsx_6bdc">
          This will permanently delete all associated audits, schedules, keyword gaps, backlink data, 
          and content analysis. This action cannot be undone.
        </p>
      </Modal>
      {/* Create Project Modal */}
      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        data-icod-id="src_pages_dashboard_dashboardprojects_tsx_b2f8" />
    </div>
  );
}
