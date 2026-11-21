import { useState, useEffect, useCallback } from 'react';
import { Mail, Trash2, X, Calendar, User, AtSign, FileText, Eye } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button, Card, Spinner, Modal, EmptyState } from '@/components/ui';
import { adminApiService } from '@/services/adminService';
import type { ContactMessageAdmin } from '@/types';

export default function DashboardContact() {
  const [messages, setMessages] = useState<ContactMessageAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      const data = await adminApiService.getContactMessages();
      setMessages(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApiService.deleteContactMessage(deleteTarget);
      setMessages((prev) => prev.filter((m) => m._id !== deleteTarget));
      if (selectedMessage?._id === deleteTarget) {
        setSelectedMessage(null);
      }
    } catch {
      /* ignore */
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const formatDate = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  const formatDateTime = (dateStr: string): string => {
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '—' : d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center py-12"
        data-icod-id="src_pages_dashboard_dashboardcontact_tsx_246d">
        <Spinner size="lg" data-icod-id="src_pages_dashboard_dashboardcontact_tsx_7779" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4"
      data-icod-id="src_pages_dashboard_dashboardcontact_tsx_dfd1">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_dashboard_dashboardcontact_tsx_9f7c">
        <h3
          className="font-heading text-lg font-semibold text-foreground"
          data-icod-id="src_pages_dashboard_dashboardcontact_tsx_55dc">
          Contact Messages ({messages.length})
        </h3>
      </div>
      {/* Content */}
      {messages.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No messages"
          description="No contact messages have been received yet."
          data-icod-id="src_pages_dashboard_dashboardcontact_tsx_f231" />
      ) : (
        <Card
          className="overflow-hidden"
          data-icod-id="src_pages_dashboard_dashboardcontact_tsx_a9e4">
          <div
            className="overflow-x-auto"
            data-icod-id="src_pages_dashboard_dashboardcontact_tsx_210d">
            <table
              className="w-full text-left text-sm"
              data-icod-id="src_pages_dashboard_dashboardcontact_tsx_c49c">
              <thead data-icod-id="src_pages_dashboard_dashboardcontact_tsx_60ae">
                <tr
                  className="border-b border-border bg-muted/30"
                  data-icod-id="src_pages_dashboard_dashboardcontact_tsx_b4fd">
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardcontact_tsx_7b56">From</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardcontact_tsx_75cb">Email</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardcontact_tsx_bf31">Subject</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground"
                    data-icod-id="src_pages_dashboard_dashboardcontact_tsx_a4ba">Date</th>
                  <th
                    className="px-4 py-3 font-semibold text-foreground text-right"
                    data-icod-id="src_pages_dashboard_dashboardcontact_tsx_dba9">Actions</th>
                </tr>
              </thead>
              <tbody data-icod-id="src_pages_dashboard_dashboardcontact_tsx_fa12">
                {messages.map((msg) => (
                  <tr
                    key={msg._id}
                    onClick={() => setSelectedMessage(msg)}
                    className="cursor-pointer border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-icod-id={`src_pages_dashboard_dashboardcontact_tsx_f6aa_${msg._id}`}>
                    <td
                      className="px-4 py-3 font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardcontact_tsx_f599_${msg._id}`}>{msg.name}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardcontact_tsx_2125_${msg._id}`}>{msg.email}</td>
                    <td
                      className="px-4 py-3 text-foreground"
                      data-icod-id={`src_pages_dashboard_dashboardcontact_tsx_3692_${msg._id}`}>{msg.subject}</td>
                    <td
                      className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap"
                      data-icod-id={`src_pages_dashboard_dashboardcontact_tsx_354b_${msg._id}`}>
                      {formatDate(msg.createdAt)}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      data-icod-id={`src_pages_dashboard_dashboardcontact_tsx_314c_${msg._id}`}>
                      <div
                        className="flex items-center justify-end gap-1"
                        data-icod-id={`src_pages_dashboard_dashboardcontact_tsx_6c5d_${msg._id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMessage(msg);
                          }}
                          aria-label="View message"
                          data-icod-id={`src_pages_dashboard_dashboardcontact_tsx_a822_${msg._id}`}>
                          <Eye
                            className="h-4 w-4"
                            data-icod-id={`src_pages_dashboard_dashboardcontact_tsx_44cb_${msg._id}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(msg._id);
                          }}
                          className="text-destructive hover:text-destructive"
                          data-icod-id={`src_pages_dashboard_dashboardcontact_tsx_5c93_${msg._id}`}>
                          <Trash2
                            className="h-4 w-4"
                            data-icod-id={`src_pages_dashboard_dashboardcontact_tsx_61a2_${msg._id}`} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {/* Message Detail Modal */}
      <Modal
        open={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title="Message Details"
        footer={
          <div
            className="flex gap-2 justify-end"
            data-icod-id="src_pages_dashboard_dashboardcontact_tsx_851b">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => selectedMessage && setDeleteTarget(selectedMessage._id)}
              data-icod-id="src_pages_dashboard_dashboardcontact_tsx_788a">
              <Trash2
                className="mr-2 h-4 w-4"
                data-icod-id="src_pages_dashboard_dashboardcontact_tsx_01a5" />
              Delete
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSelectedMessage(null)}
              data-icod-id="src_pages_dashboard_dashboardcontact_tsx_6a45">
              Close
            </Button>
          </div>
        }
        data-icod-id="src_pages_dashboard_dashboardcontact_tsx_19db">
        {selectedMessage && (
          <div
            className="flex flex-col gap-4"
            data-icod-id="src_pages_dashboard_dashboardcontact_tsx_4be4">
            {/* Sender Info */}
            <div
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              data-icod-id="src_pages_dashboard_dashboardcontact_tsx_46bd">
              <div
                className="flex items-center gap-2 text-sm"
                data-icod-id="src_pages_dashboard_dashboardcontact_tsx_7ffe">
                <User
                  className="h-4 w-4 text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontact_tsx_f36a" />
                <span
                  className="text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontact_tsx_882b">Name:</span>
                <span
                  className="font-medium text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontact_tsx_c55e">{selectedMessage.name}</span>
              </div>
              <div
                className="flex items-center gap-2 text-sm"
                data-icod-id="src_pages_dashboard_dashboardcontact_tsx_83f6">
                <AtSign
                  className="h-4 w-4 text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontact_tsx_f71f" />
                <span
                  className="text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontact_tsx_d675">Email:</span>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="font-medium text-primary hover:underline"
                  data-icod-id="src_pages_dashboard_dashboardcontact_tsx_0a7a">
                  {selectedMessage.email}
                </a>
              </div>
              <div
                className="flex items-center gap-2 text-sm"
                data-icod-id="src_pages_dashboard_dashboardcontact_tsx_f781">
                <FileText
                  className="h-4 w-4 text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontact_tsx_55fe" />
                <span
                  className="text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontact_tsx_4842">Subject:</span>
                <span
                  className="font-medium text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontact_tsx_5906">{selectedMessage.subject}</span>
              </div>
              <div
                className="flex items-center gap-2 text-sm"
                data-icod-id="src_pages_dashboard_dashboardcontact_tsx_4f2d">
                <Calendar
                  className="h-4 w-4 text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontact_tsx_e0b1" />
                <span
                  className="text-muted-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontact_tsx_2919">Received:</span>
                <span
                  className="font-medium text-foreground"
                  data-icod-id="src_pages_dashboard_dashboardcontact_tsx_9024">{formatDateTime(selectedMessage.createdAt)}</span>
              </div>
            </div>

            {/* Divider */}
            <div
              className="border-t border-border"
              data-icod-id="src_pages_dashboard_dashboardcontact_tsx_94a2" />

            {/* Message Body */}
            <div
              className="flex flex-col gap-2"
              data-icod-id="src_pages_dashboard_dashboardcontact_tsx_3c94">
              <span
                className="text-sm font-medium text-muted-foreground"
                data-icod-id="src_pages_dashboard_dashboardcontact_tsx_d882">Message</span>
              <div
                className="rounded-lg border border-border bg-muted/20 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap"
                data-icod-id="src_pages_dashboard_dashboardcontact_tsx_dc59">
                {selectedMessage.message}
              </div>
            </div>
          </div>
        )}
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Message"
        footer={
          <div
            className="flex gap-2 justify-end"
            data-icod-id="src_pages_dashboard_dashboardcontact_tsx_aec1">
            <Button
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
              data-icod-id="src_pages_dashboard_dashboardcontact_tsx_81a9">Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleting}
              data-icod-id="src_pages_dashboard_dashboardcontact_tsx_0e44">
              Delete
            </Button>
          </div>
        }
        data-icod-id="src_pages_dashboard_dashboardcontact_tsx_82e9">
        <p
          className="text-muted-foreground"
          data-icod-id="src_pages_dashboard_dashboardcontact_tsx_7345">
          Are you sure you want to delete this contact message? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
