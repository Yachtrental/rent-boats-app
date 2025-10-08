import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Users, MapPin, Clock, User as UserIcon, Sailboat, Anchor, Briefcase, MessageSquare, Send, CreditCard, Download, AlertTriangle, CheckCircle, Clock as ClockIcon, XCircle, DollarSign, Percent, FileText, History, Check, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const CountdownTimer = ({ expiryTimestamp }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryTimestamp) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];
  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) {
      return;
    }
    timerComponents.push(
      <span key={interval}>
        {String(timeLeft[interval]).padStart(2, '0')}
        {interval !== 'seconds' ? ':' : ''}
      </span>
    );
  });

  return (
    <div className="font-mono text-orange-500 font-semibold">
      {timerComponents.length ? timerComponents : <span>¡Tiempo agotado!</span>}
    </div>
  );
};

const BookingStatusBadge = ({ status }) => {
  const statusInfo = {
    pending_approval: { text: 'Pendiente Aprobación', color: 'yellow', icon: ClockIcon },
    pending_payment: { text: 'Pendiente de Pago', color: 'blue', icon: CreditCard },
    confirmed: { text: 'Confirmado', color: 'green', icon: CheckCircle },
    completed: { text: 'Completado', color: 'slate', icon: CheckCircle },
    cancelled: { text: 'Cancelado', color: 'red', icon: XCircle },
    pending_admin_action: { text: 'Acción Requerida', color: 'orange', icon: AlertTriangle },
  };
  const currentStatus = statusInfo[status] || { text: status, color: 'slate', icon: AlertTriangle };
  const Icon = currentStatus.icon;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${currentStatus.color}-100 text-${currentStatus.color}-800`}>
      <Icon size={16} className="mr-2" />
      {currentStatus.text}
    </span>
  );
};

const ConfirmationStatus = ({ booking, userRole, currentUser }) => {
  const confirmations = [];
  if (booking.boat) {
    confirmations.push({ role: 'Armador', confirmed: !!booking.armador_confirmed_at, isCurrentUser: userRole === 'armador' });
  }
  if (booking.patron) {
    confirmations.push({ role: 'Patrón', confirmed: !!booking.patron_confirmed_at, isCurrentUser: userRole === 'patron' });
  }
  
  const serviceConfirmations = {};
  booking.booking_items?.forEach(item => {
    if (item.item_type === 'service' && item.service && item.service.provider) {
      const providerId = item.service.provider_id;
      if (!serviceConfirmations[providerId]) {
        const serviceConfirmation = booking.booking_service_confirmations?.find(c => c.service_provider_id === providerId);
        serviceConfirmations[providerId] = {
          role: `Servicios: ${item.service.provider.company_name || item.service.provider.full_name}`,
          confirmed: !!serviceConfirmation?.confirmed_at,
          isCurrentUser: userRole === 'servicios' && currentUser.id === providerId
        };
      }
    }
  });
  confirmations.push(...Object.values(serviceConfirmations));

  return (
    <div>
      <h4 className="text-lg font-semibold text-slate-700 mb-3">Estado de Confirmaciones</h4>
      <div className="space-y-2">
        {confirmations.map(({ role, confirmed }) => (
          <div key={role} className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{role}</span>
            {confirmed ? (
              <span className="flex items-center font-semibold text-green-600"><CheckCircle size={16} className="mr-1.5" /> Confirmado</span>
            ) : (
              <span className="flex items-center font-semibold text-yellow-600"><ClockIcon size={16} className="mr-1.5" /> Pendiente</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BookingDetailModal = ({ booking, user, onClose, onConfirm, onPayment }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const commentsEndRef = useRef(null);
  const { toast } = useToast();

  const userRole = user.role;
  const isClient = userRole === 'cliente';
  const isProvider = ['armador', 'patron', 'servicios'].includes(userRole);
  const isChatActive = ['confirmed', 'completed'].includes(booking.status);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isChatActive) return;
    const fetchComments = async () => {
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('booking_comments')
        .select('*, user:profiles(id, full_name, avatar_url, role)')
        .eq('booking_id', booking.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los comentarios." });
      } else {
        setComments(data);
      }
      setLoadingComments(false);
    };

    fetchComments();

    const channel = supabase
      .channel(`booking-comments-${booking.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'booking_comments', filter: `booking_id=eq.${booking.id}` }, async (payload) => {
        const { data: userProfile, error } = await supabase.from('profiles').select('id, full_name, avatar_url, role').eq('id', payload.new.user_id).single();
        if (!error) {
          setComments(currentComments => [...currentComments, { ...payload.new, user: userProfile }]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking.id, toast, isChatActive]);

  useEffect(() => {
    if (isChatActive) {
      scrollToBottom();
    }
  }, [comments, isChatActive]);

  const sanitizeComment = (comment) => {
    const phoneRegex = /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const addressRegex = /(calle|avenida|plaza|c\/|avd\.?|plz\.?)\s+[\w\s\d,]+/gi;
    const companyKeywords = ['ltd', 's.l.', 's.a.', 'inc.', 'corp.'];
    const companyRegex = new RegExp(`\\b(${companyKeywords.join('|')})\\b`, 'gi');

    let sanitized = comment
      .replace(phoneRegex, '[información oculta]')
      .replace(emailRegex, '[información oculta]')
      .replace(addressRegex, '[información oculta]')
      .replace(companyRegex, '[información oculta]');

    return sanitized;
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '' || !isChatActive) return;

    const sanitizedComment = sanitizeComment(newComment.trim());

    const { error } = await supabase
      .from('booking_comments')
      .insert({ booking_id: booking.id, user_id: user.id, comment: sanitizedComment });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo enviar el comentario." });
    } else {
      setNewComment('');
      if (sanitizedComment !== newComment.trim()) {
        toast({
          variant: "destructive",
          title: "Contenido Modificado",
          description: "Se ha eliminado información de contacto de tu mensaje para proteger tu privacidad.",
        });
      }
    }
  };

  const getProviderFee = () => {
    if (!isProvider) return 0;
    
    let total = 0;
    if (userRole === 'armador') {
      const boatItem = booking.booking_items?.find(i => i.item_type === 'boat');
      const extrasItems = booking.booking_items?.filter(i => {
        const extraIsFromBoat = booking.boat?.boat_extras?.some(be => be.extra_id === i.extra_id);
        return i.item_type === 'extra' && extraIsFromBoat;
      });
      const boatPrice = boatItem?.price || 0;
      const extrasPrice = extrasItems?.reduce((sum, i) => sum + (i.price * i.quantity), 0) || 0;
      total = boatPrice + extrasPrice;
    } else if (userRole === 'patron') {
      const patronItem = booking.booking_items?.find(i => i.item_type === 'patron');
      total = patronItem?.price || 0;
    } else if (userRole === 'servicios') {
      const serviceItems = booking.booking_items?.filter(item => item.service?.provider_id === user.id);
      total = serviceItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    }
    return total;
  };

  const providerFee = getProviderFee();
  const commission = providerFee * (user.commission_rate || 0.15);
  const netIncome = providerFee - commission;

  const mainItem = booking.boat ? { type: 'boat', ...booking.boat } : (booking.booking_items?.find(i => i.item_type === 'service')?.service || { name: 'Servicio' });
  const mainItemIcon = booking.boat ? Sailboat : (booking.patron ? UserIcon : Briefcase);
  const mainItemName = booking.boat?.name || booking.patron?.full_name || booking.booking_items?.find(i => i.item_type === 'service')?.name || 'Reserva';

  const confirmationDeadline = new Date(new Date(booking.created_at).getTime() + 24 * 60 * 60 * 1000);

  const totalDeposit = (booking.boat?.deposit || 0) + (booking.booking_items?.reduce((acc, item) => {
    if (item.item_type === 'extra' && item.extra?.deposit_amount) {
      return acc + (item.extra.deposit_amount * item.quantity);
    }
    return acc;
  }, 0) || 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-50 rounded-2xl w-full max-w-4xl border border-slate-200 shadow-xl max-h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Detalles de la Reserva #{booking.id}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={24} /></Button>
        </div>
        <div className="flex-grow overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <BookingStatusBadge status={booking.status} />
                  <Button variant="outline" size="sm"><Download size={16} className="mr-2" /> Factura</Button>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  <img src={mainItem.image_url || mainItem.boat_images?.[0]?.image_url || 'https://placehold.co/600x400/e2e8f0/94a3b8/png?text=Item'} alt={mainItemName} className="w-full md:w-40 h-32 object-cover rounded-lg" />
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center"><mainItemIcon size={20} className="mr-2 text-blue-500" />{mainItemName}</h3>
                    <p className="text-slate-500 text-sm">{booking.boat?.model}</p>
                    <p className="text-slate-500 text-sm">{booking.selected_slot_name}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-3">
                      <div className="flex items-center"><Calendar size={14} className="mr-2 text-slate-400"/> <span>{new Date(booking.start_date).toLocaleDateString()}</span></div>
                      <div className="flex items-center"><Clock size={14} className="mr-2 text-slate-400"/> <span>{new Date(booking.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                      <div className="flex items-center"><Users size={14} className="mr-2 text-slate-400"/> <span>{booking.guests} invitados</span></div>
                      <div className="flex items-center"><MapPin size={14} className="mr-2 text-slate-400"/> <span>{booking.location}</span></div>
                    </div>
                  </div>
                </div>
                {booking.patron && (
                  <div className="mt-4 pt-4 border-t border-dashed">
                    <h4 className="text-md font-semibold text-slate-700 mb-2 flex items-center"><Sailboat size={16} className="mr-2" />Patrón Asignado</h4>
                    <div className="flex items-center gap-3">
                      <img src={booking.patron.avatar_url || `https://ui-avatars.com/api/?name=${booking.patron.full_name}`} alt={booking.patron.full_name} className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-semibold text-slate-800">{booking.patron.full_name}</p>
                        <p className="text-xs text-slate-500">Patrón Profesional</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h4 className="text-lg font-semibold text-slate-700 mb-4">Desglose del Precio</h4>
                <div className="space-y-2 text-sm">
                  {booking.booking_items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <p className="text-slate-600">{item.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}</p>
                      <p className="font-medium text-slate-800">€{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-base font-bold">Total Cliente</span>
                    <span className="text-lg font-bold text-slate-800">€{booking.total_price.toFixed(2)}</span>
                  </div>
                  {totalDeposit > 0 && (
                    <div className="mt-3 pt-3 border-t border-dashed">
                      <div className="flex justify-between items-center text-amber-600">
                        <div className="flex items-center">
                          <Shield size={16} className="mr-2"/>
                          <span className="font-semibold">Fianza Total</span>
                        </div>
                        <span className="font-bold">€{totalDeposit.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 text-right">Se paga directamente al proveedor el día del embarque.</p>
                    </div>
                  )}
                </div>
                {isProvider && (
                  <div className="mt-4 pt-4 border-t border-dashed">
                    <h4 className="text-md font-semibold text-slate-700 mb-2">Tus Ingresos</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Tu Total Bruto</span><span>€{providerFee.toFixed(2)}</span></div>
                      <div className="flex justify-between text-red-600"><span className="text-slate-500">Comisión ({((user.commission_rate || 0.15) * 100).toFixed(0)}%)</span><span>-€{commission.toFixed(2)}</span></div>
                      <div className="flex justify-between font-bold text-green-700 text-base pt-1 border-t"><span >Ingreso Neto Estimado</span><span>€{netIncome.toFixed(2)}</span></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <ConfirmationStatus booking={booking} userRole={userRole} currentUser={user} />
              </div>

              {isClient && booking.status === 'pending_payment' && (
                <div className="bg-white p-6 rounded-xl border border-green-300 text-center">
                  <p className="text-green-600 font-semibold mb-4">¡Todo está confirmado! Ya puedes realizar el pago.</p>
                  <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white" onClick={onPayment}>
                    <CreditCard size={20} className="mr-2" /> Pagar Ahora
                  </Button>
                </div>
              )}
            </div>

            <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4 flex flex-col h-[600px]">
              <h4 className="text-lg font-semibold text-slate-700 mb-4 flex items-center"><MessageSquare size={18} className="mr-2"/>Comentarios</h4>
              {isChatActive ? (
                <>
                  <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    {loadingComments ? <p className="text-slate-500 text-sm">Cargando...</p> : comments.map(comment => (
                      <div key={comment.id} className={`flex items-start gap-2.5 ${comment.user_id === user.id ? 'justify-end' : ''}`}>
                        {comment.user_id !== user.id && <img src={comment.user.avatar_url || `https://ui-avatars.com/api/?name=${comment.user.full_name}`} alt={comment.user.full_name} className="w-8 h-8 rounded-full" />}
                        <div className={`p-3 rounded-lg max-w-xs ${comment.user_id === user.id ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                          <p className="text-sm">{comment.comment}</p>
                          <p className={`text-xs mt-1 text-right ${comment.user_id === user.id ? 'text-blue-200' : 'text-slate-400'}`}>{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        {comment.user_id === user.id && <img src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}`} alt={user.full_name} className="w-8 h-8 rounded-full" />}
                      </div>
                    ))}
                    <div ref={commentsEndRef} />
                  </div>
                  <form onSubmit={handlePostComment} className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
                    <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Escribe un comentario..." className="flex-grow p-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm" />
                    <Button type="submit" size="icon"><Send size={18} /></Button>
                  </form>
                </>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center bg-slate-100 rounded-lg p-4">
                  <Lock size={32} className="text-slate-400 mb-4" />
                  <h5 className="font-semibold text-slate-600">Chat Bloqueado</h5>
                  <p className="text-sm text-slate-500">El chat se activará una vez que la reserva esté confirmada y pagada.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {isProvider && booking.status === 'pending_approval' && (
          <div className="p-6 border-t border-slate-200 bg-white flex justify-between items-center">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-orange-600">
              <History size={20} />
              <div className="text-sm">
                <span className="font-semibold">Pendiente de tu confirmación</span>
                <div className="flex items-center gap-2">
                  <span>Tiempo restante:</span>
                  <CountdownTimer expiryTimestamp={confirmationDeadline} />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onConfirm(booking.id, true)} size="sm" className="bg-green-100 text-green-700 hover:bg-green-200"><Check size={16} className="mr-1"/>Aceptar</Button>
              <Button onClick={() => onConfirm(booking.id, false)} size="sm" className="bg-red-100 text-red-700 hover:bg-red-200"><X size={16} className="mr-1"/>Rechazar</Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BookingDetailModal;