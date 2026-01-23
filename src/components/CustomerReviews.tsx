import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  const [startIndex, setStartIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-rotate reviews every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setStartIndex((prev) => (prev + 3) % reviews.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Get visible reviews (wrap around if needed)
  const visibleReviews = [
    reviews[startIndex % reviews.length],
    reviews[(startIndex + 1) % reviews.length],
    reviews[(startIndex + 2) % reviews.length],
  ];

  return (
    <section className="py-12 bg-muted overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-center">
          Canadians Trust Car Street for a Fast & Easy Car Experience!
        </h2>
      </div>

      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
          {visibleReviews.map((review) => (
            <Card key={review.id} className="border-0 shadow-lg md:hover:shadow-xl transition-shadow bg-background card-hover-lift">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Quote className="h-8 w-8 text-primary" />
                </div>
                <div className="flex items-center justify-center gap-1 mb-3">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  "{review.text}"
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium">{review.name}</span>
                  <span className="text-muted-foreground">{review.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 3].map((index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setStartIndex(index);
                  setIsTransitioning(false);
                }, 300);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${startIndex === index
                ? "bg-primary w-6"
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              aria-label={`Show reviews ${index + 1}-${index + 3}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
