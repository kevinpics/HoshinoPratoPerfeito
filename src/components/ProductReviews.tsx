
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: reviews = [] } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: productRating } = useQuery({
    queryKey: ['product-rating', productId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_product_rating', {
        product_id: productId
      });

      if (error) throw error;
      return data[0];
    }
  });

  const addReviewMutation = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-rating', productId] });
      setRating(0);
      setComment('');
      setShowForm(false);
      toast({
        title: 'Avaliação enviada!',
        description: 'Obrigado por avaliar nosso produto.'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione uma classificação.',
        variant: 'destructive'
      });
      return;
    }

    addReviewMutation.mutate({ rating, comment });
  };

  const renderStars = (count: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < count ? 'text-yellow-400 fill-current' : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
      />
    ));
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Avaliações</span>
            {productRating && (
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {renderStars(Math.round(productRating.average_rating || 0))}
                </div>
                <span className="text-sm text-gray-600">
                  {productRating.average_rating || 0} ({productRating.total_reviews} avaliações)
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user && !showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              className="mb-4 bg-orange-500 hover:bg-orange-600"
            >
              Avaliar Produto
            </Button>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-orange-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-2">Sua avaliação:</label>
                <div className="flex space-x-1">
                  {renderStars(rating, true)}
                </div>
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-sm font-medium mb-2">
                  Comentário (opcional):
                </label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Conte sobre sua experiência com este produto..."
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={addReviewMutation.isPending}>
                  {addReviewMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Cliente</span>
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-700">{review.comment}</p>
                )}
              </div>
            ))}
            
            {reviews.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                Ainda não há avaliações para este produto.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductReviews;
