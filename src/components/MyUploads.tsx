import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supbaseClient';


export default function MyUploads() {
  const [projects, setProjects] = useState([]);
  const [editProjectId, setEditProjectId] = useState(null);
  const [editFields, setEditFields] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from('downloads').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error fetching', description: error.message, variant: 'destructive' });
    } else {
      setProjects(data);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('downloads').delete().eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: 'Project deleted successfully.' });
      fetchProjects();
    }
  };

  const handleEditStart = (project) => {
    setEditProjectId(project.id);
    setEditFields({ title: project.title, description: project.description });
  };

  const handleEditSave = async (id) => {
    const { error } = await supabase
      .from('downloads')
      .update({ title: editFields.title, description: editFields.description })
      .eq('id', id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Updated', description: 'Project updated successfully.' });
      setEditProjectId(null);
      fetchProjects();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">My Uploaded Projects</h2>
      {projects.length === 0 ? (
        <p className="text-gray-400">You haven&aps;t uploaded any projects yet.</p>
      ) : (
        projects.map((project) => (
          <div key={project.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
            {editProjectId === project.id ? (
              <>
                <Input
                  value={editFields.title}
                  onChange={(e) => setEditFields({ ...editFields, title: e.target.value })}
                  placeholder="Project Title"
                />
                <Textarea
                  value={editFields.description}
                  onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
                  placeholder="Project Description"
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleEditSave(project.id)}>Save</Button>
                  <Button variant="outline" onClick={() => setEditProjectId(null)}>Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                <p className="text-sm text-gray-400">{project.description}</p>
                <p className="text-xs text-gray-500">Type: {project.file_type} | Size: {project.file_size}</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" onClick={() => handleEditStart(project)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDelete(project.id)}>Delete</Button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
