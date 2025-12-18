import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { FloatingPanicButton } from "@/components/PanicButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  MapPin, 
  Send, 
  ThumbsUp,
  Clock,
  User,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  user: string;
  route: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

const mockReviews: Review[] = [
  {
    id: "1",
    user: "Sarah M.",
    route: "Main Street to Central Station",
    rating: 5,
    comment: "Very well-lit path with lots of people around even at night. Felt completely safe!",
    date: "2 days ago",
    helpful: 12,
  },
  {
    id: "2",
    user: "Anonymous",
    route: "Market Square to University",
    rating: 4,
    comment: "Generally safe during daytime. Would avoid after dark though.",
    date: "1 week ago",
    helpful: 8,
  },
  {
    id: "3",
    user: "Priya K.",
    route: "Tech Park to Metro Station",
    rating: 3,
    comment: "Some stretches have poor lighting. Recommend taking the longer route via Mall Road.",
    date: "2 weeks ago",
    helpful: 24,
  },
];

export default function RatingsPage() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [route, setRoute] = useState("");
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState(mockReviews);
  const { toast } = useToast();

  const handleSubmitRating = () => {
    if (!rating || !route) {
      toast({
        title: "Missing Information",
        description: "Please select a rating and enter the route name.",
        variant: "destructive",
      });
      return;
    }

    const newReview: Review = {
      id: Date.now().toString(),
      user: "You",
      route,
      rating,
      comment,
      date: "Just now",
      helpful: 0,
    };

    setReviews([newReview, ...reviews]);
    setRating(0);
    setRoute("");
    setComment("");

    toast({
      title: "Rating Submitted!",
      description: "Thank you for helping make routes safer for everyone.",
    });
  };

  const handleHelpful = (id: string) => {
    setReviews(reviews.map(r => 
      r.id === id ? { ...r, helpful: r.helpful + 1 } : r
    ));
  };

  const StarRating = ({ value, onSelect, onHover, interactive = true }: { 
    value: number; 
    onSelect?: (n: number) => void;
    onHover?: (n: number) => void;
    interactive?: boolean;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onSelect?.(n)}
          onMouseEnter={() => onHover?.(n)}
          onMouseLeave={() => onHover?.(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : ''} transition-transform`}
        >
          <Star
            className={`w-6 h-6 ${
              n <= (hoveredRating || value)
                ? "fill-moderate text-moderate"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="moderate-soft" className="mb-3">
            <Star className="w-3 h-3 mr-1" />
            Community Ratings
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Safety Ratings & Feedback
          </h1>
          <p className="text-muted-foreground">
            Share your experience to help others travel safely.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Submit Rating */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Rate a Route</CardTitle>
                <CardDescription>
                  Your feedback helps improve safety recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Safety Rating
                  </label>
                  <StarRating
                    value={rating}
                    onSelect={setRating}
                    onHover={setHoveredRating}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {rating === 0 && "Select a rating"}
                    {rating === 1 && "Very Unsafe"}
                    {rating === 2 && "Somewhat Unsafe"}
                    {rating === 3 && "Moderate"}
                    {rating === 4 && "Safe"}
                    {rating === 5 && "Very Safe"}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Route Name
                  </label>
                  <Input
                    icon="location"
                    placeholder="e.g., Main St to Central Park"
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Your Feedback (Optional)
                  </label>
                  <Textarea
                    placeholder="Share details about lighting, crowd levels, or any safety concerns..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button variant="hero" className="w-full" onClick={handleSubmitRating}>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Rating
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Recent Reviews
              </h2>
              <Badge variant="secondary">
                {reviews.length} reviews
              </Badge>
            </div>

            {reviews.map((review) => (
              <Card key={review.id} className="animate-fade-in">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{review.user}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {review.date}
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-4 h-4 ${
                            n <= review.rating
                              ? "fill-moderate text-moderate"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {review.route}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-muted-foreground text-sm mb-4">
                      {review.comment}
                    </p>
                  )}

                  <div className="flex items-center gap-4 pt-3 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => handleHelpful(review.id)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Helpful ({review.helpful})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <FloatingPanicButton />
    </div>
  );
}
