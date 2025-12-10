import { motion } from "framer-motion";
import { Star } from "lucide-react";

interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Michael R.",
    rating: 5,
    text: "Amazing experience! Got my dream car at a great price. The team was super helpful and the process was smooth.",
    date: "2 weeks ago"
  },
  {
    id: 2,
    name: "Sarah T.",
    rating: 5,
    text: "Best car buying experience ever! No pressure sales and transparent pricing. Highly recommend Car Street!",
    date: "1 month ago"
  },
  {
    id: 3,
    name: "David K.",
    rating: 5,
    text: "Got approved for financing in minutes! The staff went above and beyond to help me find the perfect SUV.",
    date: "3 weeks ago"
  },
  {
    id: 4,
    name: "Jennifer L.",
    rating: 5,
    text: "Fantastic service from start to finish. They made the whole process easy and stress-free.",
    date: "1 month ago"
  },
  {
    id: 5,
    name: "Robert M.",
    rating: 5,
    text: "Great selection of quality vehicles. The team really knows their stuff and helped me make the right choice.",
    date: "2 months ago"
  },
  {
    id: 6,
    name: "Emily W.",
    rating: 5,
    text: "Couldn't be happier with my purchase! Fair prices and honest dealing. Will definitely come back.",
    date: "1 week ago"
  }
];

export default function CustomerReviews() {
  // Duplicate reviews for infinite scroll effect
  const duplicatedReviews = [...reviews, ...reviews];

  return (
    <section className="py-12 bg-muted overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-center">
          Canadians Trust Car Street for a Fast & Easy Car Experience!
        </h2>
      </div>

      <div className="relative">
        <motion.div
          className="flex gap-6"
          animate={{
            x: [0, -50 * reviews.length * 24],
          }}
          transition={{
            x: {
              duration: 120,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {duplicatedReviews.map((review, index) => (
            <motion.div
              key={`${review.id}-${index}`}
              className="flex-shrink-0 w-80 bg-card rounded-lg p-6 shadow-lg border border-border cursor-pointer"
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                "{review.text}"
              </p>
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{review.name}</span>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}