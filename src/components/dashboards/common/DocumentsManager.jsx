import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, XCircle, AlertTriangle, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Label } from '@/components/ui/label';

const DocumentsManager = ({ user, requiredDocs, relatedBoats = [], onUpdateStatus, isAdminView = false }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBoat, setSelectedBoat] = useState(relatedBoats.length > 0 ? relatedBoats[0].id : null);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('documents').select('*').eq('user_id', user.id);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los documentos." });
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [user.id]);

  const handleFileUpload = async (event, docType, boatId = null) => {
    try {
      setUploading(docType);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${docType}-${boatId || 'user'}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName);
      
      const conflictColumns = boatId ? ['user_id', 'document_type', 'boat_id'] : ['user_id', 'document_type'];
      const upsertData = { user_id: user.id, document_type: docType, file_url: publicUrl, status: 'pending', boat_id: boatId };

      const { error: dbError } = await supabase
        .from('documents')
        .upsert(upsertData, { onConflict: conflictColumns.join(',') });

      if (dbError) throw dbError;

      toast({ title: "Éxito", description: "Documento subido. Pendiente de revisión." });
      fetchDocuments();

    } catch (error) {
      toast({ variant: "destructive", title: "Error de subida", description: error.message });
    } finally {
      setUploading(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getDocumentStatus = (docType, boatId = null) => {
    const doc = documents.find(d => d.document_type === docType && d.boat_id === boatId);
    if (!doc) return { status: 'missing', icon: <AlertTriangle className="text-yellow-500" />, text: 'Pendiente de subir' };
    switch (doc.status) {
      case 'approved': return { status: 'approved', icon: <CheckCircle className="text-green-500" />, text: 'Aprobado' };
      case 'rejected': return { status: 'rejected', icon: <XCircle className="text-red-500" />, text: 'Rechazado', reason: doc.rejection_reason };
      default: return { status: 'pending', icon: <AlertTriangle className="text-orange-500" />, text: 'Pendiente de revisión' };
    }
  };

  if (loading) {
    return <div className="text-center text-slate-500 py-10">Cargando documentos...</div>;
  }

  const userDocs = requiredDocs.filter(d => !d.isBoatDoc);
  const boatDocs = requiredDocs.filter(d => d.isBoatDoc);

  return (
    <motion.div 
      className="bg-white shadow-md rounded-2xl p-6 border border-slate-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {!isAdminView && (
        <>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Gestión de Documentación</h2>
          <p className="text-slate-600 mb-6">Sube y gestiona la documentación requerida para mantener tu perfil activo y verificado.</p>
          <p className="text-sm text-yellow-600 mb-6">⚠️ No subas archivos pesados, el sistema los comprimirá automáticamente para optimizar espacio y velocidad.</p>
        </>
      )}
      
      {userDocs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-slate-700 mb-4">Documentos Personales</h3>
          <div className="space-y-4">
            {userDocs.map(doc => {
              const statusInfo = getDocumentStatus(doc.id);
              const userDoc = documents.find(d => d.document_type === doc.id && !d.boat_id);
              return (
                <DocumentRow 
                  key={doc.id} 
                  doc={doc} 
                  statusInfo={statusInfo} 
                  userDoc={userDoc} 
                  uploading={uploading} 
                  onFileUpload={handleFileUpload} 
                  fileInputRef={fileInputRef}
                  onUpdateStatus={onUpdateStatus}
                  isAdminView={isAdminView}
                />
              );
            })}
          </div>
        </div>
      )}

      {boatDocs.length > 0 && relatedBoats.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-slate-700 mb-4">Documentos de Embarcaciones</h3>
          <div className="mb-4">
            <Label htmlFor="boat-select" className="text-slate-600">Selecciona una embarcación:</Label>
            <select id="boat-select" value={selectedBoat} onChange={(e) => setSelectedBoat(Number(e.target.value))} className="w-full mt-1 p-2 border border-slate-300 rounded-lg">
              {relatedBoats.map(boat => <option key={boat.id} value={boat.id}>{boat.name}</option>)}
            </select>
          </div>
          <div className="space-y-4">
            {boatDocs.map(doc => {
              const statusInfo = getDocumentStatus(doc.id, selectedBoat);
              const userDoc = documents.find(d => d.document_type === doc.id && d.boat_id === selectedBoat);
              return (
                <DocumentRow 
                  key={`${doc.id}-${selectedBoat}`} 
                  doc={doc} 
                  statusInfo={statusInfo} 
                  userDoc={userDoc} 
                  uploading={uploading} 
                  onFileUpload={(e, docType) => handleFileUpload(e, docType, selectedBoat)} 
                  fileInputRef={fileInputRef}
                  onUpdateStatus={onUpdateStatus}
                  isAdminView={isAdminView}
                />
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const DocumentRow = ({ doc, statusInfo, userDoc, uploading, onFileUpload, fileInputRef, onUpdateStatus, isAdminView }) => {
  const handleReject = () => {
    const reason = prompt("Por favor, introduce el motivo del rechazo:");
    if (reason !== null) { // Check if user clicked cancel
      onUpdateStatus(userDoc.id, 'rejected', reason);
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center">
        <div className="mr-4">{statusInfo.icon}</div>
        <div>
          <h3 className="font-semibold text-slate-800">{doc.name}</h3>
          <p className="text-sm text-slate-500">{statusInfo.text}</p>
          {statusInfo.status === 'rejected' && statusInfo.reason && (
            <p className="text-xs text-red-500 mt-1">Motivo: {statusInfo.reason}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 self-end sm:self-center">
        {userDoc && (
          <Button asChild variant="outline" size="sm">
            <a href={userDoc.file_url} target="_blank" rel="noopener noreferrer"><Download size={16} className="mr-2"/> Ver</a>
          </Button>
        )}
        {isAdminView && userDoc ? (
          <>
            <Button onClick={() => onUpdateStatus(userDoc.id, 'approved')} size="sm" className="bg-green-100 text-green-700 hover:bg-green-200"><CheckCircle size={14} /></Button>
            <Button onClick={handleReject} size="sm" className="bg-red-100 text-red-700 hover:bg-red-200"><XCircle size={14} /></Button>
          </>
        ) : !isAdminView && (
          <Button asChild variant="outline" size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
            <label className="cursor-pointer">
              {uploading === doc.id ? <Loader2 size={16} className="mr-2 animate-spin"/> : <Upload size={16} className="mr-2"/>}
              {uploading === doc.id ? 'Subiendo...' : (userDoc ? 'Reemplazar' : 'Subir')}
              <input type="file" className="hidden" onChange={(e) => onFileUpload(e, doc.id)} disabled={!!uploading} ref={fileInputRef} accept="image/*,application/pdf" />
            </label>
          </Button>
        )}
      </div>
    </div>
  );
};

export default DocumentsManager;