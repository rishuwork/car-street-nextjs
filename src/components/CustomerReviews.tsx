import { Star } from "lucide-react";
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

  return (
    <section className="py-12 bg-muted overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-center">
          Canadians Trust Car Street for a Fast & Easy Car Experience!
        </h2>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((review) => (
            <Card key={review.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-background">
              <CardContent className="pt-6 text-center">
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
      </div>
    </section>
  );
}