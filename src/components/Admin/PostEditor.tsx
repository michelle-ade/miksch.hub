import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Post, Category } from '../../types';
import { supabase } from '../../supabaseClient';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { Bold, Italic, List, Heading1, Heading2, Image as ImageIcon, X, Trash2 } from 'lucide-react';

interface PostEditorProps {
  post: Post | null;
  categories: Category[];
  onSuccess: () => void;
}

export default function PostEditor({ post, categories, onSuccess }: PostEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(post?.categoryIds || []);
  const [date, setDate] = useState(
    post?.date ? new Date(post.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [mediaUrls, setMediaUrls] = useState<string[]>(post?.mediaUrls || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder: 'Write your content here...',
      }),
    ],
    content: post?.content || '',
  });

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    const urls: string[] = [];

    try {
      for (const file of acceptedFiles) {
        const filePath = `media/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = await supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        if (!publicUrlData.publicUrl) throw new Error('Failed to get media URL');

        urls.push(publicUrlData.publicUrl);
      }
      setMediaUrls((prev) => [...prev, ...urls]);
      toast.success('Media uploaded.');
    } catch (e) {
      toast.error('Upload failed.');
      console.error('Supabase storage upload error:', e);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    if (!title || !editor.getHTML()) {
      toast.error('Title and content are required');
      return;
    }
    if (selectedCategoryIds.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title,
      category_ids: selectedCategoryIds,
      content: editor.getHTML(),
      media_urls: mediaUrls,
      date: new Date(date).toISOString(),
      updated_at: new Date().toISOString(),
      ...(post ? {} : { created_at: new Date().toISOString() }),
    };

    try {
      if (post) {
        const { error } = await supabase.from('posts').update(payload).eq('id', post.id);
        if (error) throw error;
        toast.success('Post updated.');
      } else {
        const { error } = await supabase.from('posts').insert(payload);
        if (error) throw error;
        toast.success('Post created.');
      }
      onSuccess();
    } catch (error) {
      toast.error('Failed to save post.');
      console.error('Supabase posts error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!editor) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl p-3 border-4 border-black font-bold uppercase tracking-tight focus:outline-none"
              placeholder="Post Title"
              id="post-title-input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border-2 border-black font-bold focus:outline-none"
              id="post-date-input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase mb-2">Categories</label>
            <div className="grid grid-cols-2 gap-2 border-2 border-black p-4 max-h-[250px] overflow-y-auto" id="category-checkbox-list">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedCategoryIds((prev) => [...prev, cat.id]);
                      else setSelectedCategoryIds((prev) => prev.filter((id) => id !== cat.id));
                    }}
                    className="w-5 h-5 border-2 border-black appearance-none checked:bg-black transition-all cursor-pointer"
                    id={`category-checkbox-${cat.id}`}
                  />
                  <span className="font-bold text-sm group-hover:underline">{cat.name}</span>
                </label>
              ))}
              {categories.length === 0 && <p className="text-xs opacity-40">No categories defined. Please go to the categories settings.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase mb-2">Media Upload</label>
            <div
              {...getRootProps()}
              className={`border-4 border-dashed border-black p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'bg-black/5' : ''
              }`}
              id="media-uploader"
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <ImageIcon size={40} className="opacity-40" />
                <p className="font-bold uppercase tracking-widest text-sm">
                  {uploading ? 'Uploading...' : 'Drag & drop images, or click to select'}
                </p>
              </div>
            </div>

            {mediaUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2" id="uploaded-media-list">
                {mediaUrls.map((url, i) => (
                  <div key={i} className="relative group aspect-square border-2 border-black overflow-hidden">
                    <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setMediaUrls((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-white border border-black p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-4 border-black">
        <header className="border-b-4 border-black p-2 flex flex-wrap gap-2 sticky top-0 bg-white z-10" id="editor-toolbar">
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 hover:bg-black/10 ${editor.isActive('bold') ? 'bg-black text-white' : ''}`} id="btn-bold"><Bold size={18} /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 hover:bg-black/10 ${editor.isActive('italic') ? 'bg-black text-white' : ''}`} id="btn-italic"><Italic size={18} /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 hover:bg-black/10 ${editor.isActive('heading', { level: 1 }) ? 'bg-black text-white' : ''}`} id="btn-h1"><Heading1 size={18} /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 hover:bg-black/10 ${editor.isActive('heading', { level: 2 }) ? 'bg-black text-white' : ''}`} id="btn-h2"><Heading2 size={18} /></button>
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 hover:bg-black/10 ${editor.isActive('bulletList') ? 'bg-black text-white' : ''}`} id="btn-list"><List size={18} /></button>
        </header>
        <div className="p-4 min-h-[400px]" id="wysiwyg-editor">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-10 py-4 bg-black text-white font-bold uppercase tracking-[0.2em] hover:bg-black/90 disabled:opacity-50 transition-all text-xl"
          id="save-post-btn"
        >
          {isSubmitting ? 'Saving...' : post ? 'Update Post' : 'Publish Post'}
        </button>
      </div>
    </form>
  );
}
