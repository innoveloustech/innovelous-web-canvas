import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supbaseClient';
import { TabsContent } from '@radix-ui/react-tabs';
import MyUploads from './MyUploads';

export default function DownloadsForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [category, setCategory] = useState('');
    const [isUploading, setIsUploading] = useState(false);



    const handleUpload = async () => {
        if (!title || !description || !file || !category) {
            toast({ title: 'Error', description: 'All fields are required.', variant: 'destructive' });
            return;
        }

        setIsUploading(true);

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        const fileType = fileExt.toUpperCase();

        const { data: storageData, error: storageError } = await supabase.storage
            .from('downloads')
            .upload(`projects/${fileName}`, file);

        if (storageError) {
            toast({ title: 'Upload Failed', description: storageError.message, variant: 'destructive' });
            setIsUploading(false);
            return;
        }

        const fileUrl = supabase.storage.from('downloads').getPublicUrl(`projects/${fileName}`).data.publicUrl;

        const { error: dbError } = await supabase
            .from('downloads')
            .insert([{
            title,
            description,
            category,
            file_size: fileSizeInMB,
            file_type: fileType,
            file_url: fileUrl,
            }]);

        if (dbError) {
            toast({ title: 'Database Error', description: dbError.message, variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'File uploaded successfully.' });
            setTitle('');
            setDescription('');
            setCategory('');
            setFile(null);
        }

        setIsUploading(false);
        };

    return (
        <div className="space-y-4 max-w-xl">
            <Input placeholder="Project Title" value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea placeholder="Project Description" value={description} onChange={e => setDescription(e.target.value)} />
            <Input type="file" accept=".zip,.apk" onChange={e => setFile(e.target.files[0])} />
            <Input placeholder="Category (e.g., Mobile App, Software, Web Template)" value={category} onChange={e => setCategory(e.target.value)} />
            <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Project'}
            </Button>
            <TabsContent value="downloads">
                <div className="mt-10">
                    <MyUploads />
                </div>
            </TabsContent>
        </div>
    );
}