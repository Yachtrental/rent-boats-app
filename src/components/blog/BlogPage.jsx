import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { Search, Tag, Calendar, ArrowRight, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BlogPage = ({ onViewChange }) => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, author:profiles(full_name)')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
      } else {
        setPosts(data);
        setFilteredPosts(data);
        const allCategories = new Set(data.flatMap(post => post.categories || []));
        setCategories(['Todas', ...Array.from(allCategories)]);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    let result = posts;

    if (searchTerm) {
      result = result.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory && selectedCategory !== 'Todas') {
      result = result.filter(post => post.categories?.includes(selectedCategory));
    }

    setFilteredPosts(result);
  }, [searchTerm, selectedCategory, posts]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category === 'Todas' ? null : category);
  };

  const truncateText = (post, length) => {
    const { content, content_type } = post;
    if (!content) return '';

    let textToTruncate = content;
    if (content_type === 'html' || content_type === 'markdown') {
      textToTruncate = content.replace(/<[^>]+>/g, '').replace(/[#*`_~]/g, '');
    }
    
    if (textToTruncate.length <= length) return textToTruncate;
    return textToTruncate.substr(0, textToTruncate.lastIndexOf(' ', length)) + '...';
  };

  const renderSummary = (post) => {
    if (post.content_type === 'code') {
      return (
        <div className="text-sm bg-gray-800 text-gray-300 p-3 rounded-md overflow-hidden">
          <Code size={16} className="inline-block mr-2" />
          <span className="font-mono">{truncateText(post, 100)}</span>
        </div>
      );
    }
    return <p className="text-slate-600 text-sm mb-4">{truncateText(post, 120)}</p>;
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">Nuestro Blog Náutico</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Noticias, guías y consejos del mundo de la navegación. Tu fuente de inspiración para la próxima aventura en el mar.
          </p>
        </motion.div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category || (!selectedCategory && category === 'Todas') ? 'default' : 'outline'}
                onClick={() => handleCategoryClick(category)}
                className="whitespace-nowrap"
              >
                <Tag size={14} className="mr-2" /> {category}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">Cargando artículos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group flex flex-col cursor-pointer"
                onClick={() => onViewChange('blogPost', post)}
              >
                <div className="overflow-hidden h-56">
                  <img
                    src={post.main_image_url || 'https://placehold.co/600x400/e2e8f0/334155/png?text=Blog'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex-grow">
                    <div className="flex items-center text-sm text-slate-500 mb-2">
                      <Calendar size={14} className="mr-2" />
                      <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      {post.categories && post.categories.length > 0 && (
                        <>
                          <span className="mx-2">|</span>
                          <Tag size={14} className="mr-1" />
                          <span>{post.categories[0]}</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-[#005B96] transition-colors">{post.title}</h2>
                    {renderSummary(post)}
                  </div>
                  <div className="mt-auto">
                     <span className="font-semibold text-[#005B96] flex items-center">
                      Leer más <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {filteredPosts.length === 0 && !loading && (
          <div className="text-center py-16 text-slate-500">
            <p>No se encontraron artículos que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;