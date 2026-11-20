import { useState, useEffect, useCallback } from 'react';
import { Mail, Trash2, X, Calendar, User, AtSign, FileText } from 'lucide-react';
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
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Contact Messages ({messages.length})
        </h3>
      </div>

      {/* Content */}
      {messages.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No messages"
          description="No contact messages have been received yet."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 font-semibold text-foreground">From</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Email</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Subject</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 font-semibold text-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg._id}
                    onClick={() => setSelectedMessage(msg)}
                    className="cursor-pointer border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{msg.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{msg.email}</td>
                    <td className="px-4 py-3 text-foreground">{msg.subject}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(msg.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(msg._id);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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
          <div className="flex gap-2 justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => selectedMessage && setDeleteTarget(selectedMessage._id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Button variant="ghost" onClick={() => setSelectedMessage(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedMessage && (
          <div className="flex flex-col gap-4">
            {/* Sender Info */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">{selectedMessage.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AtSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="font-medium text-primary hover:underline"
                >
                  {selectedMessage.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-medium text-foreground">{selectedMessage.subject}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Received:</span>
                <span className="font-medium text-foreground">{formatDateTime(selectedMessage.createdAt)}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Message Body */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">Message</span>
              <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
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
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-muted-foreground">
          Are you sure you want to delete this contact message? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
