import { Button } from "@/components/ui/button";
import { Sparkles, Play } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container px-4 py-20 md:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Start Learning Today
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              VietVibe
              <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                the Fun Way
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              Master Vietnamese with interactive lessons, engaging games, and personalized learning paths. 
              Join thousands of learners worldwide!
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="gradient" size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                Start Learning Free
              </Button>
              <Button variant="outline" size="lg">
                View Lessons
              </Button>
            </div>
            
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-foreground">50K+</div>
                <div className="text-sm text-muted-foreground">Active Learners</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-2xl font-bold text-foreground">200+</div>
                <div className="text-sm text-muted-foreground">Lessons</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <div className="text-2xl font-bold text-foreground">4.9★</div>
                <div className="text-sm text-muted-foreground">Rating</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl" />
            <img 
              src={heroImage} 
              alt="Vietnamese learning illustration with diverse students" 
              className="relative rounded-3xl shadow-2xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
