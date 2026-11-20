import { useState, useEffect } from 'react';
import { Edit, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button, Card, Spinner, Input, EmptyState, Alert } from '@/components/ui';
import { adminApiService } from '@/services/adminService';
import type { CourseAdmin, ServiceAdmin } from '@/types';

export default function DashboardPricing() {
  const [courses, setCourses] = useState<CourseAdmin[]>([]);
  const [services, setServices] = useState<ServiceAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      adminApiService.getCoursesForPricing(),
      adminApiService.getServicesForPricing(),
    ])
      .then(([c, s]) => {
        setCourses(c);
        setServices(s);
        setError(null);
      })
      .catch(() => setError('Failed to load pricing data.'))
      .finally(() => setLoading(false));
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleSaveCoursePrice = async (id: string) => {
    const price = Number(editPrice);
    if (isNaN(price) || price < 0) {
      setError('Price must be a non-negative number.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await adminApiService.updateCoursePrice(id, price);
      setCourses((prev) => prev.map((c) => (c._id === id ? updated : c)));
      setEditingId(null);
      setSuccessMsg(`Course price updated to $${price}`);
    } catch {
      setError('Failed to update course price.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveServicePrice = async (id: string) => {
    if (!editPrice.trim()) {
      setError('Price cannot be empty.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await adminApiService.updateServicePrice(id, editPrice.trim());
      setServices((prev) => prev.map((s) => (s._id === id ? updated : s)));
      setEditingId(null);
      setSuccessMsg('Service price updated successfully.');
    } catch {
      setError('Failed to update service price.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12" data-icod-id="dashboard_pricing_loading">
        <Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardpricing_tsx_e27c" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" data-icod-id="dashboard_pricing_root">
      {/* Success / Error feedback */}
      {successMsg && (
        <div
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-success"
          data-icod-id="dashboard_pricing_success">
          <CheckCircle2
            className="h-4 w-4 shrink-0"
            data-icod-id="src_pages_dashboard_dashboardpricing_tsx_0653" />
          {successMsg}
        </div>
      )}
      {error && (
        <Alert variant="error" data-icod-id="dashboard_pricing_error">
          <div
            className="flex items-center gap-2"
            data-icod-id="src_pages_dashboard_dashboardpricing_tsx_90a0">
            <AlertTriangle
              className="h-4 w-4 shrink-0"
              data-icod-id="src_pages_dashboard_dashboardpricing_tsx_ad44" />
            {error}
          </div>
        </Alert>
      )}
      {/* Course Prices */}
      <div className="flex flex-col gap-4" data-icod-id="dashboard_pricing_courses_section">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="dashboard_pricing_courses_heading">
          Course Prices ({courses.length})
        </h3>
        {courses.length === 0 ? (
          <EmptyState
            title="No courses"
            description="No courses found for pricing."
            data-icod-id="dashboard_pricing_courses_empty" />
        ) : (
          <Card className="overflow-hidden" data-icod-id="dashboard_pricing_courses_card">
            <div className="overflow-x-auto" data-icod-id="dashboard_pricing_courses_table_wrap">
              <table className="w-full text-left text-sm" data-icod-id="dashboard_pricing_courses_table">
                <thead data-icod-id="src_pages_dashboard_dashboardpricing_tsx_cf3d">
                  <tr
                    className="border-b border-border bg-muted/30"
                    data-icod-id="src_pages_dashboard_dashboardpricing_tsx_e95d">
                    <th
                      className="px-4 py-3 font-semibold text-foreground"
                      data-icod-id="src_pages_dashboard_dashboardpricing_tsx_1801">Title</th>
                    <th
                      className="px-4 py-3 font-semibold text-foreground"
                      data-icod-id="src_pages_dashboard_dashboardpricing_tsx_107d">Category</th>
                    <th
                      className="px-4 py-3 font-semibold text-foreground"
                      data-icod-id="src_pages_dashboard_dashboardpricing_tsx_6141">Level</th>
                    <th
                      className="px-4 py-3 font-semibold text-foreground"
                      data-icod-id="src_pages_dashboard_dashboardpricing_tsx_2fe2">Price</th>
                    <th
                      className="px-4 py-3 font-semibold text-foreground text-right"
                      data-icod-id="src_pages_dashboard_dashboardpricing_tsx_ed0b">Actions</th>
                  </tr>
                </thead>
                <tbody data-icod-id="src_pages_dashboard_dashboardpricing_tsx_781c">
                  {courses.map((course) => (
                    <tr
                      key={course._id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_20bb_${course._id}`}>
                      <td
                        className="px-4 py-3 font-medium text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_c43c_${course._id}`}>{course.title}</td>
                      <td
                        className="px-4 py-3 text-muted-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_263e_${course._id}`}>{course.category}</td>
                      <td
                        className="px-4 py-3 text-muted-foreground capitalize"
                        data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_7161_${course._id}`}>{course.level}</td>
                      <td
                        className="px-4 py-3 text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_0c7d_${course._id}`}>
                        {editingId === course._id ? (
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24"
                            min={0}
                            step={0.01}
                            data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_abbf_${course._id}`} />
                        ) : (`$${course.price}`)}
                      </td>
                      <td
                        className="px-4 py-3 text-right"
                        data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_f8c2_${course._id}`}>
                        {editingId === course._id ? (
                          <div
                            className="flex items-center justify-end gap-1"
                            data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_dd76_${course._id}`}>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSaveCoursePrice(course._id)}
                              loading={saving}
                              data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_3f65_${course._id}`}>
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setEditingId(null); setError(null); }}
                              disabled={saving}
                              data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_407e_${course._id}`}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingId(course._id);
                              setEditPrice(String(course.price));
                              setError(null);
                              setSuccessMsg(null);
                            }}
                            data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_a6ee_${course._id}`}>
                            <Edit
                              className="h-4 w-4"
                              data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_398d_${course._id}`} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
      {/* Service Prices */}
      <div className="flex flex-col gap-4" data-icod-id="dashboard_pricing_services_section">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="dashboard_pricing_services_heading">
          Service Prices ({services.length})
        </h3>
        {services.length === 0 ? (
          <EmptyState
            title="No services"
            description="No services found for pricing."
            data-icod-id="dashboard_pricing_services_empty" />
        ) : (
          <Card className="overflow-hidden" data-icod-id="dashboard_pricing_services_card">
            <div className="overflow-x-auto" data-icod-id="dashboard_pricing_services_table_wrap">
              <table className="w-full text-left text-sm" data-icod-id="dashboard_pricing_services_table">
                <thead data-icod-id="src_pages_dashboard_dashboardpricing_tsx_696e">
                  <tr
                    className="border-b border-border bg-muted/30"
                    data-icod-id="src_pages_dashboard_dashboardpricing_tsx_24cc">
                    <th
                      className="px-4 py-3 font-semibold text-foreground"
                      data-icod-id="src_pages_dashboard_dashboardpricing_tsx_487f">Title</th>
                    <th
                      className="px-4 py-3 font-semibold text-foreground"
                      data-icod-id="src_pages_dashboard_dashboardpricing_tsx_affd">Price</th>
                    <th
                      className="px-4 py-3 font-semibold text-foreground text-right"
                      data-icod-id="src_pages_dashboard_dashboardpricing_tsx_812a">Actions</th>
                  </tr>
                </thead>
                <tbody data-icod-id="src_pages_dashboard_dashboardpricing_tsx_57b1">
                  {services.map((svc) => (
                    <tr
                      key={svc._id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                      data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_6cc4_${svc._id}`}>
                      <td
                        className="px-4 py-3 font-medium text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_8d11_${svc._id}`}>{svc.title}</td>
                      <td
                        className="px-4 py-3 text-foreground"
                        data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_4df6_${svc._id}`}>
                        {editingId === svc._id ? (
                          <Input
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-32"
                            data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_9774_${svc._id}`} />
                        ) : (svc.price)}
                      </td>
                      <td
                        className="px-4 py-3 text-right"
                        data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_7c12_${svc._id}`}>
                        {editingId === svc._id ? (
                          <div
                            className="flex items-center justify-end gap-1"
                            data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_4dd0_${svc._id}`}>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSaveServicePrice(svc._id)}
                              loading={saving}
                              data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_fc47_${svc._id}`}>
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setEditingId(null); setError(null); }}
                              disabled={saving}
                              data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_2c0a_${svc._id}`}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingId(svc._id);
                              setEditPrice(svc.price);
                              setError(null);
                              setSuccessMsg(null);
                            }}
                            data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_8479_${svc._id}`}>
                            <Edit
                              className="h-4 w-4"
                              data-icod-id={`src_pages_dashboard_dashboardpricing_tsx_4b63_${svc._id}`} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
