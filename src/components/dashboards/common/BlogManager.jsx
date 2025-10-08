import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash, Eye, EyeOff, MoreVertical, Image as ImageIcon, Paperclip, X, Code, Type, FileText, FileCode } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const BlogEditor = ({ post, onSave, onCancel, user }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('html');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [mainImageUrl, setMainImageUrl] = useState('');
  const [galleryUrls, setGalleryUrls] = useState([]);
  const [documentUrls, setDocumentUrls] = useState([]);
  const [categories, setCategories] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setContentType(post.content_type || 'html');
      setMetaDescription(post.meta_description || '');
      setMetaTitle(post.meta_title || '');
      setMainImageUrl(post.main_image_url || '');
      setGalleryUrls(post.gallery_urls || []);
      setDocumentUrls(post.document_urls || []);
      setCategories(post.categories?.join(', ') || '');
    }
  }, [post]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);

    const bucket = type === 'image' ? 'boat-images' : 'documents';
    const folder = type === 'image' ? 'blog' : 'blog-docs';
    const fileName = `${folder}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) {
      toast({ variant: "destructive", title: "Error de subida", description: error.message });
    } else {
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
      if (type === 'image') {
        if (!mainImageUrl) {
          setMainImageUrl(data.publicUrl);
        } else {
          setGalleryUrls(prev => [...prev, data.publicUrl]);
        }
      } else {
        setDocumentUrls(prev => [...prev, { name: file.name, url: data.publicUrl }]);
      }
      toast({ title: "Éxito", description: "Archivo subido correctamente." });
    }
    setLoading(false);
  };

  const handleSubmit = async (newStatus) => {
    setLoading(true);
    const postData = {
      title,
      content,
      content_type: contentType,
      meta_description: metaDescription,
      meta_title: metaTitle,
      main_image_url: mainImageUrl,
      gallery_urls: galleryUrls,
      document_urls: documentUrls,
      categories: categories.split(',').map(c => c.trim()).filter(Boolean),
      status: newStatus,
      author_id: user.id,
    };

    let error;
    if (post?.id) {
      ({ error } = await supabase.from('blog_posts').update(postData).eq('id', post.id));
    } else {
      ({ error } = await supabase.from('blog_posts').insert(postData));
    }

    if (error) {
      toast({ variant: "destructive", title: "Error", description: `No se pudo guardar el artículo: ${error.message}` });
    } else {
      toast({ title: "Éxito", description: `Artículo guardado como ${newStatus === 'published' ? 'publicado' : 'borrador'}.` });
      onSave();
    }
    setLoading(false);
  };

  const removeImage = (urlToRemove) => {
    if (mainImageUrl === urlToRemove) {
      setMainImageUrl(galleryUrls[0] || '');
      setGalleryUrls(galleryUrls.slice(1));
    } else {
      setGalleryUrls(galleryUrls.filter(url => url !== urlToRemove));
    }
  };

  const removeDocument = (urlToRemove) => {
    setDocumentUrls(documentUrls.filter(doc => doc.url !== urlToRemove));
  };

  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image', 'video'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean'],
        ['code-block']
      ],
    },
  }), []);

  const renderEditor = () => {
    switch (contentType) {
      case 'html':
        return <ReactQuill theme="snow" value={content} onChange={setContent} modules={quillModules} className="h-64 mb-12" />;
      case 'markdown':
        return (
          <div className="grid grid-cols-2 gap-4">
            <textarea
              placeholder="Escribe tu Markdown aquí..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 p-3 bg-slate-100 border border-slate-200 rounded-lg font-mono"
            />
            <div className="prose prose-sm max-w-none border border-slate-200 rounded-lg p-3 overflow-y-auto h-64">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
        );
      case 'code':
        return (
          <textarea
            placeholder="Pega tu código aquí..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 p-3 bg-gray-800 text-green-300 border border-slate-600 rounded-lg font-mono"
          />
        );
      case 'text':
      default:
        return (
          <textarea
            placeholder="Escribe tu texto aquí..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="10"
            className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg"
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 w-full max-w-5xl border border-slate-200 shadow-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{post?.id ? 'Editar Artículo' : 'Nuevo Artículo'}</h2>
        <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
          <input type="text" placeholder="Título del artículo" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg" />
          
          <div>
            <label className="font-semibold text-slate-700 mb-2 block">Meta Título SEO</label>
            <input type="text" placeholder="Título para motores de búsqueda (máx. 60 caracteres)" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength="60" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg" />
            <p className="text-xs text-slate-500 mt-1 text-right">{metaTitle.length} / 60</p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-2 block">Meta-descripción SEO</label>
            <textarea placeholder="Descripción corta para motores de búsqueda (155 caracteres recomendados)" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} rows="2" maxLength="160" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg"></textarea>
            <p className="text-xs text-slate-500 mt-1 text-right">{metaDescription.length} / 160</p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-2 block">Tipo de Contenido</label>
            <div className="flex space-x-2">
              <Button variant={contentType === 'html' ? 'default' : 'outline'} onClick={() => setContentType('html')}><FileCode className="mr-2 h-4 w-4" /> HTML</Button>
              <Button variant={contentType === 'markdown' ? 'default' : 'outline'} onClick={() => setContentType('markdown')}><Type className="mr-2 h-4 w-4" /> Markdown</Button>
              <Button variant={contentType === 'code' ? 'default' : 'outline'} onClick={() => setContentType('code')}><Code className="mr-2 h-4 w-4" /> Código</Button>
              <Button variant={contentType === 'text' ? 'default' : 'outline'} onClick={() => setContentType('text')}><FileText className="mr-2 h-4 w-4" /> Texto Plano</Button>
            </div>
          </div>

          <div className="bg-white mt-4">
            {renderEditor()}
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Imágenes</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
              {[mainImageUrl, ...galleryUrls].filter(Boolean).map(url => (
                <div key={url} className="relative group">
                  <img src={url} alt="preview" className="w-full h-24 object-cover rounded-lg"/>
                  <button onClick={() => removeImage(url)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                  {url === mainImageUrl && <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5 rounded-b-lg">Principal</div>}
                </div>
              ))}
              <label className="w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-50">
                <ImageIcon size={24} className="text-slate-400"/>
                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} accept="image/*"/>
              </label>
            </div>
             <p className="text-xs text-yellow-600 mt-2">⚠️ No subas archivos pesados, el sistema los comprimirá automáticamente para optimizar espacio y velocidad.</p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-700 mb-2">Documentos</h3>
            <div className="space-y-2">
              {documentUrls.map(doc => (
                <div key={doc.url} className="flex items-center justify-between bg-slate-100 p-2 rounded-lg">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 truncate">{doc.name}</a>
                  <button onClick={() => removeDocument(doc.url)} className="text-red-500 hover:text-red-700 p-1"><X size={14}/></button>
                </div>
              ))}
            </div>
            <label className="mt-2 w-full p-3 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-50 text-sm text-slate-500">
              <Paperclip size={16} className="mr-2"/> Añadir documento
              <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'document')} accept=".pdf,.doc,.docx,.xls,.xlsx"/>
            </label>
             <p className="text-xs text-yellow-600 mt-2">⚠️ No subas archivos pesados, el sistema los comprimirá automáticamente para optimizar espacio y velocidad.</p>
          </div>

          <input type="text" placeholder="Categorías (separadas por comas)" value={categories} onChange={(e) => setCategories(e.target.value)} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-lg" />
        </div>
        <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={loading}>Guardar Borrador</Button>
          <Button onClick={() => handleSubmit('published')} disabled={loading} className="bg-[#FF6B6B] text-white hover:bg-[#FF6B6B]/90">Publicar</Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const BlogManager = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:profiles(full_name)')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los artículos." });
    } else {
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleNewPost = () => {
    setEditingPost(null);
    setIsEditorOpen(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsEditorOpen(true);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este artículo?')) return;
    const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar el artículo." });
    } else {
      toast({ title: "Éxito", description: "Artículo eliminado." });
      fetchPosts();
    }
  };

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('blog_posts').update({ status: newStatus }).eq('id', post.id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo cambiar el estado." });
    } else {
      toast({ title: "Éxito", description: `El artículo ahora es ${newStatus === 'published' ? 'público' : 'un borrador'}.` });
      fetchPosts();
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Gestión del Blog</h2>
        <Button onClick={handleNewPost}><Plus className="mr-2 h-4 w-4" /> Nuevo Artículo</Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">Título</th>
              <th scope="col" className="px-6 py-3">Tipo</th>
              <th scope="col" className="px-6 py-3">Estado</th>
              <th scope="col" className="px-6 py-3">Fecha</th>
              <th scope="col" className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8">Cargando...</td></tr>
            ) : posts.map(post => (
              <tr key={post.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{post.title}</td>
                <td className="px-6 py-4 capitalize">{post.content_type}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {post.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(post.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditPost(post)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(post)}>
                        {post.status === 'published' ? <><EyeOff className="mr-2 h-4 w-4" /> Ocultar</> : <><Eye className="mr-2 h-4 w-4" /> Publicar</>}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePost(post.id)}>
                        <Trash className="mr-2 h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isEditorOpen && (
          <BlogEditor
            user={user}
            post={editingPost}
            onSave={() => { setIsEditorOpen(false); fetchPosts(); }}
            onCancel={() => setIsEditorOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogManager;