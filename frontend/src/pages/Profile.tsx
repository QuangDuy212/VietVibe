import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/StatsCard";
import { Trophy, BookOpen, Gamepad2, Flame, Edit, Mail, MapPin, Calendar } from "lucide-react";
import Header from "@/components/Header";
import { useAppSelector } from "@/redux/hook";
import { useEffect, useState } from "react";

const Profile = () => {
  const user = useAppSelector(state => state.account.user);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() =>{
    const tottalPoint = () =>{
      let total = 0;
      user.points.forEach((point: any) => {
        total += point.score;
      });
      setTotalPoints(total);
      console.log("Total Points:", total);
    }
    tottalPoint();
  },[])
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Alex Johnson" />
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      Premium
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Passionate about learning new languages and exploring different cultures. 
                    Currently focusing on mastering Vietnamese!
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    alex.johnson@example.com
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    San Francisco, CA
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Member since August 2025
                  </div>
                </div>
                
                <Button variant="outline" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard icon={Trophy} label="Total Points" value={totalPoints} color="primary" />
          <StatsCard icon={BookOpen} label="Lessons Completed" value="8" color="secondary" />
          <StatsCard icon={Gamepad2} label="Games Played" value="15" color="accent" />
          <StatsCard icon={Flame} label="Day Streak" value="7 days" color="primary" />
        </div>

        {/* Personal Details */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Gender</p>
                  <p className="font-medium">Prefer not to say</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Birthday</p>
                  <p className="font-medium">June 15, 1995</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Native Language</p>
                  <p className="font-medium">English</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Location</p>
                  <p className="font-medium">San Francisco, CA</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
              <CardDescription>Your achievements and milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">Level 3</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary w-[45%]" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Beginner Lessons</span>
                  <Badge variant="secondary">8/12 Completed</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Intermediate Lessons</span>
                  <Badge variant="secondary">0/15 Completed</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Advanced Lessons</span>
                  <Badge variant="secondary">0/10 Completed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
