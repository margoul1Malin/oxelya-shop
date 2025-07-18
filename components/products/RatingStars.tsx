'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface RatingStarsProps {
  productId: string;
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
}

export default function RatingStars({ productId, initialRating = 0, onRatingChange }: RatingStarsProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleRating = async (rating: number) => {
    if (!isAuthenticated) {
      alert('Vous devez être connecté pour noter un produit');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la notation');
      }

      const data = await response.json();
      setRating(rating);
      onRatingChange?.(data.averageRating);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          disabled={loading}
          onClick={() => handleRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="relative p-1 transition-colors disabled:opacity-50"
        >
          <Star
            className={`w-6 h-6 ${
              (hover || rating) >= star
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-400'
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
} 