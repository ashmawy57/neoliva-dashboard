'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Edit2, Copy, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { updateSmsTemplate, deleteSmsTemplate, duplicateSmsTemplate } from '@/app/actions/smsTemplates';
import { TemplateEditorModal } from './TemplateEditorModal';
import { formatDistanceToNow } from 'date-fns';

export function TemplateList({ category, templates, canEdit }: { category: string, templates: any[], canEdit: boolean }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    if (!canEdit) return toast.error("You don't have permission to edit templates");
    const res = await updateSmsTemplate(id, { isActive: !currentStatus });
    if (res.success) toast.success(`Template ${!currentStatus ? 'activated' : 'deactivated'}`);
    else toast.error("Failed to update status: " + res.error);
  };

  const handleDuplicate = async (id: string) => {
    if (!canEdit) return toast.error("You don't have permission to edit templates");
    const res = await duplicateSmsTemplate(id);
    if (res.success) toast.success("Template duplicated successfully");
    else toast.error("Failed to duplicate template: " + res.error);
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return toast.error("You don't have permission to edit templates");
    if (!confirm("Are you sure you want to delete this template?")) return;
    const res = await deleteSmsTemplate(id);
    if (res.success) toast.success("Template deleted");
    else toast.error("Failed to delete template: " + res.error);
  };

  const renderMessageWithHighlights = (msg: string) => {
    const parts = msg.split(/(\{\{.*?\}\})/g);
    return parts.map((part, i) => {
      if (part.startsWith('{{') && part.endsWith('}}')) {
        return <span key={i} className="text-purple-600 font-medium">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{category} Templates</h2>
        {canEdit && (
          <Button onClick={() => { setEditingTemplate(null); setEditorOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        )}
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-10 bg-muted/20 border border-dashed rounded-lg text-muted-foreground">
          No templates found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {templates.map(t => {
            const smsSegments = Math.ceil(t.message.length / 160) || 1;
            return (
              <Card key={t.id} className={!t.isActive ? 'opacity-75' : ''}>
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {t.name}
                      {!t.isActive && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Updated {t.updatedAt ? formatDistanceToNow(new Date(t.updatedAt), { addSuffix: true }) : 'N/A'}
                    </CardDescription>
                  </div>
                  {canEdit && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`status-${t.id}`} className="sr-only">Toggle Status</Label>
                      <Switch 
                        id={`status-${t.id}`}
                        checked={t.isActive}
                        onCheckedChange={() => toggleStatus(t.id, t.isActive)}
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="bg-muted/50 p-3 rounded-md text-sm whitespace-pre-wrap min-h-[80px]">
                    {renderMessageWithHighlights(t.message)}
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                    <span>{t.message.length} chars</span>
                    <span>{smsSegments} SMS {smsSegments > 1 ? 'segments' : 'segment'}</span>
                  </div>
                </CardContent>
                {canEdit && (
                  <CardFooter className="pt-0 flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDuplicate(t.id)} title="Duplicate">
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingTemplate(t); setEditorOpen(true); }} title="Edit">
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)} title="Delete" className="hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {editorOpen && (
        <TemplateEditorModal 
          open={editorOpen} 
          onOpenChange={setEditorOpen} 
          template={editingTemplate} 
          category={category as any}
        />
      )}
    </div>
  );
}
