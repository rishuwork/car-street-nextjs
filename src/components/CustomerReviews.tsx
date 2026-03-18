import { useState, useEffect, useRef } from "react";
import { Star } from "lucide-react";

interface Review {
  id: string | number;
  name: string;
  rating: number;
  text: string;
  date: string;
  initials: string;
  color: string;
  photoUrl?: string;
}

const fallbackReviews: Review[] = [
  {
    id: 1,
    name: "Michael R.",
    rating: 5,
    text: "Amazing experience! Got my dream car at a great price. The team was super helpful and the process was smooth.",
    date: "2 weeks ago",
    initials: "M",
    color: "bg-blue-500"
  },
  {
    id: 2,
    name: "Sarah T.",
    rating: 5,
    text: "Best car buying experience ever! No pressure sales and transparent pricing. Highly recommend Car Street!",
    date: "1 month ago",
    initials: "S",
    color: "bg-purple-500"
  },
  {
    id: 3,
    name: "David K.",
    rating: 5,
    text: "Got approved for financing in minutes! The staff went above and beyond to help me find the perfect SUV.",
    date: "3 weeks ago",
    initials: "D",
    color: "bg-emerald-500"
  },
  {
    id: 4,
    name: "Jennifer L.",
    rating: 5,
    text: "Fantastic service from start to finish. They made the whole process easy and stress-free.",
    date: "1 month ago",
    initials: "J",
    color: "bg-rose-500"
  },
  {
    id: 5,
    name: "Robert M.",
    rating: 5,
    text: "Great selection of quality vehicles. The team really knows their stuff and helped me make the right choice.",
    date: "2 months ago",
    initials: "R",
    color: "bg-amber-500"
  },
  {
    id: 6,
    name: "Emily W.",
    rating: 5,
    text: "Couldn't be happier with my purchase! Fair prices and honest dealing. Will definitely come back.",
    date: "1 week ago",
    initials: "E",
    color: "bg-indigo-500"
  }
];

const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#fbbc04" />
  </svg>
);

const API_KEY = "AIzaSyANRjJRqI0cgD_BhHqvHTDB3UbTky80Atw";
const PLACE_ID = "ChIJ80_SMh7NLYgRHY0kH-Oi6ok";

// Helper component for avatar with fallback
const Avatar = ({
  photoUrl,
  name,
  initials,
  color,
  className = "w-11 h-11",
  style
}: {
  photoUrl?: string,
  name: string,
  initials: string,
  color: string,
  className?: string,
  style?: React.CSSProperties
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      style={style}
      className={`${className} rounded-full flex items-center justify-center font-bold text-white shadow-inner overflow-hidden flex-shrink-0 ${(!photoUrl || imgError) ? color : "bg-slate-100"}`}
    >
      {photoUrl && !imgError ? (
        <img
          src={photoUrl}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);
  const [totalReviews, setTotalReviews] = useState(48);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const existingScript = document.getElementById("googleMapsReviews");

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
      script.id = "googleMapsReviews";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const checkApi = () => {
      if (!isMounted) return;
      if (typeof window !== "undefined" && (window as any).google?.maps?.places?.PlacesService) {
        fetchGoogleReviews();
      } else {
        setTimeout(checkApi, 100);
      }
    };
    checkApi();

    function fetchGoogleReviews() {
      if (!isMounted) return;
      try {
        const dummyDiv = document.createElement("div");
        const service = new (window as any).google.maps.places.PlacesService(dummyDiv);

        service.getDetails(
          { placeId: PLACE_ID, fields: ["name", "rating", "user_ratings_total", "reviews"] },
          (place: any, status: any) => {
            if (!isMounted) return;
            if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place) {
              if (place.user_ratings_total) setTotalReviews(place.user_ratings_total);
              if (place.reviews && place.reviews.length > 0) {
                const liveReviews = place.reviews.map((r: any, index: number) => {
                  const nameParts = r.author_name ? r.author_name.split(" ") : ["?"];
                  const initials = nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : nameParts[0][0];
                  const colors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-rose-500", "bg-amber-500", "bg-indigo-500"];
                  return {
                    id: `live-${index}`,
                    name: r.author_name,
                    rating: r.rating || 5,
                    text: r.text,
                    date: r.relative_time_description,
                    initials: initials.toUpperCase().substring(0, 2),
                    color: colors[index % colors.length],
                    photoUrl: r.profile_photo_url
                  };
                });
                setReviews(liveReviews);
              }
            } else {
              console.error("Google Places API Error. Status:", status);
            }
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error fetching Google Reviews:", err);
        setLoading(false);
      }
    }
    return () => { isMounted = false; };
  }, []);



  return (
    <section className="py-16 bg-muted overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-10 text-slate-800">
          Canadians Trust Car Street for a Fast & Easy Car Experience!
        </h2>

        {/* Header Badge */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-white/50 backdrop-blur-sm rounded-full py-3 px-8 mx-auto w-fit mb-10 border border-slate-200">
          <div className="flex -space-x-3 mr-2">
            {!loading && reviews.slice(0, 4).map((r, i) => (
              <Avatar
                key={i}
                photoUrl={r.photoUrl}
                name={r.name}
                initials={r.initials}
                color={r.color}
                className="w-8 h-8 border-2 border-white"
                style={{ zIndex: 4 - i, position: "relative" }}
              />
            ))}
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">Excellent</span>
              <div className="flex gap-0.5"><StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon /></div>
            </div>
            <span className="text-xs text-slate-500">Based on <strong>{totalReviews} reviews</strong></span>
          </div>

          <div className="w-px h-8 bg-slate-200 mx-2 hidden sm:block"></div>
          <GoogleIcon size={24} />
        </div>

        {/* Carousel Container */}
        <div className="relative group max-w-full">
          <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 pt-4 px-4 -mx-4 scroll-smooth" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
            <style dangerouslySetInnerHTML={{ __html: ".scrollbar-hide::-webkit-scrollbar { display: none; }" }} />
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100 flex-none w-[300px] md:w-[350px] snap-center hover:shadow-md transition-all text-left">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      photoUrl={review.photoUrl}
                      name={review.name}
                      initials={review.initials}
                      color={review.color}
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{review.name}</h4>
                      <p className="text-[13px] text-slate-500 mt-0.5">{review.date}</p>
                    </div>
                  </div>
                  <GoogleIcon size={18} />
                </div>

                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => <div key={i} className={i < review.rating ? "" : "opacity-30"}><StarIcon /></div>)}
                </div>

                <p className="text-slate-600 text-[15px] leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
