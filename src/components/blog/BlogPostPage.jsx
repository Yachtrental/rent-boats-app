import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Calendar, User, Tag, Paperclip, Download, Share2, Twitter, Linkedin, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const BlogPostPage = ({ post, onBack }) => {
  const { toast } = useToast();

  if (!post) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando artículo...</p>
      </div>
    );
  }

  const generateMetaDescription = (post) => {
    if (post.meta_description) return post.meta_description;
    if (!post.content) return 'Descubre más en nuestro blog náutico.';
    const strippedContent = post.content.replace(/<[^>]+>/g, '').replace(/[#*`_~]/g, '');
    return strippedContent.length > 155 ? strippedContent.substring(0, 152) + '...' : strippedContent;
  };

  const metaDescription = generateMetaDescription(post);
  const metaTitle = post.meta_title || `${post.title} - Rent-boats.com Blog`;
  const postUrl = window.location.href;

  const normalizeContent = (text) => {
    if (!text) return '';
    return text.split('\n').map(line => `<p>${line}</p>`).join('');
  };

  const renderContent = (post) => {
    switch (post.content_type) {
      case 'html':
        return <div className="prose prose-lg max-w-none prose-slate prose-h2:text-[#005B96] prose-h3:text-[#005B96] prose-img:rounded-[12px] prose-a:text-[#005B96] hover:prose-a:text-[#004a7c]" dangerouslySetInnerHTML={{ __html: post.content }} />;
      case 'markdown':
        return <ReactMarkdown className="prose prose-lg max-w-none prose-slate prose-h2:text-[#005B96] prose-h3:text-[#005B96] prose-img:rounded-[12px] prose-a:text-[#005B96] hover:prose-a:text-[#004a7c]" remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>;
      case 'code':
        return (
          <div className="rounded-lg overflow-hidden">
            <SyntaxHighlighter language="javascript" style={atomDark} customStyle={{ margin: 0, padding: '1.5rem', borderRadius: '0' }} showLineNumbers>
              {post.content || ''}
            </SyntaxHighlighter>
          </div>
        );
      case 'text':
      default:
        return <div className="prose prose-lg max-w-none prose-slate" dangerouslySetInnerHTML={{ __html: normalizeContent(post.content) }} />;
    }
  };

  const handleShare = (platform) => {
    let url = '';
    const text = encodeURIComponent(`¡Echa un vistazo a este artículo!: ${post.title}`);
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${text}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(post.title)}&summary=${encodeURIComponent(metaDescription)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(postUrl);
        toast({ title: "¡Enlace copiado!", description: "Ya puedes compartir el artículo donde quieras." });
        return;
    }
    window.open(url, '_blank');
  };

  const allImages = [post.main_image_url, ...(post.gallery_urls || [])].filter(Boolean);

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={onBack} variant="ghost" className="mb-8 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
            <ArrowLeft size={16} className="mr-2" /> Volver al Blog
          </Button>
        </motion.div>

        <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center text-slate-500 text-sm mb-8 gap-x-6 gap-y-2">
            <div className="flex items-center"><Calendar size={14} className="mr-2" /><span>Publicado el {new Date(post.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
            {post.author && <div className="flex items-center"><User size={14} className="mr-2" /><span>Por {post.author.full_name}</span></div>}
            {post.categories && post.categories.length > 0 && (
              <div className="flex items-center gap-2"><Tag size={14} />{post.categories.map(cat => <span key={cat} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-medium">{cat}</span>)}</div>
            )}
          </div>

          {post.main_image_url && (
            <motion.img src={post.main_image_url} alt={post.title} className="w-full h-auto max-h-[500px] object-cover rounded-[12px] shadow-lg mb-12" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }} />
          )}

          {renderContent(post)}

          {allImages.length > 1 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Galería de Imágenes</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {allImages.slice(1).map((url) => (
                  <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                    <img src={url} alt="Galería de imágenes del post" className="rounded-[12px] shadow-md hover:shadow-xl transition-shadow w-full h-full object-cover"/>
                  </a>
                ))}
              </div>
            </div>
          )}

          {post.document_urls && post.document_urls.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Documentos Adjuntos</h3>
              <div className="space-y-3">
                {post.document_urls.map((doc) => (
                  <a key={doc.url} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <Paperclip className="text-slate-500 mr-3" size={20} />
                    <span className="flex-grow text-[#005B96] font-medium truncate">{doc.name}</span>
                    <Download className="text-slate-400 ml-3" size={20} />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center"><Share2 size={20} className="mr-2 text-[#005B96]"/>¡Comparte esta aventura!</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => handleShare('twitter')}><Twitter className="h-4 w-4"/></Button>
              <Button variant="outline" size="icon" onClick={() => handleShare('linkedin')}><Linkedin className="h-4 w-4"/></Button>
              <Button variant="outline" size="icon" onClick={() => handleShare('copy')}><Link className="h-4 w-4"/></Button>
            </div>
          </div>

        </motion.article>
      </div>
    </div>
  );
};

export default BlogPostPage;