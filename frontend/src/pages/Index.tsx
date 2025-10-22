import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LessonsList from "@/components/LessonsList";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <LessonsList />
    </div>
  );
};

export default Index;
