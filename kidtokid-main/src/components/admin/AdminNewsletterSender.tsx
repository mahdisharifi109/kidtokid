import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { sendNewsletterNotification } from '@/src/services/notificationService';
import { Megaphone, Send } from 'lucide-react';

export function AdminNewsletterSender() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionLink, setActionLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error('O título e a mensagem são obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      const result = await sendNewsletterNotification(
        title, 
        message, 
        actionLink
      );
      toast.success(`Newsletter enviada com sucesso para ${result.count} utilizadores!`);
      setTitle('');
      setMessage('');
      setActionLink('');
    } catch (error) {
      console.warn("Failed to send newsletter:", error);
      toast.error('Falha ao enviar a newsletter. Tenta novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-card border rounded-lg shadow-sm">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Enviar Notificação In-App</h2>
            <p className="text-sm text-gray-500">
                Envia uma notificação direta e imediata para todos os utilizadores que consentiram em receber a newsletter ("Opt-in").
            </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Título da Notificação</Label>
          <Input 
            id="title" 
            placeholder="Ex: 🚀 Novas coleções de Verão!" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message">Mensagem Curta</Label>
          <Input 
            id="message" 
            placeholder="Ex: Descubra as novidades com 20% de desconto." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="actionLink">Link da Ação (Opcional)</Label>
          <Input 
            id="actionLink" 
            placeholder="Ex: /search?category=verao" 
            value={actionLink} 
            onChange={(e) => setActionLink(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-1">URL ou caminho relativo para onde o utilizador será redirecionado ao clicar.</p>
        </div>

        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
          {loading ? (
             <span className="flex items-center gap-2">
                 <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                 A enviar...
             </span>
          ) : (
             <span className="flex items-center gap-2">
                 <Send className="h-4 w-4" />
                 Enviar Notificação
             </span>
          )}
        </Button>
      </form>
    </div>
  );
}
