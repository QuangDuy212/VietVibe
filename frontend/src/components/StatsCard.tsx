import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: "primary" | "secondary" | "accent";
}

const colorConfig = {
  primary: {
    gradient: "bg-gradient-to-br from-primary/20 to-primary/5",
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)]",
  },
  secondary: {
    gradient: "bg-gradient-to-br from-secondary/20 to-secondary/5",
    iconBg: "bg-secondary/20",
    iconColor: "text-secondary",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--secondary)/0.3)]",
  },
  accent: {
    gradient: "bg-gradient-to-br from-accent/20 to-accent/5",
    iconBg: "bg-accent/20",
    iconColor: "text-accent",
    glow: "group-hover:shadow-[0_0_30px_hsl(var(--accent)/0.3)]",
  },
};

const StatsCard = ({ icon: Icon, label, value, color }: StatsCardProps) => {
  const config = colorConfig[color];
  
  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 hover:scale-[1.02] transition-all duration-300">
      <div className={`absolute inset-0 ${config.gradient} opacity-50`} />
      <CardContent className="relative p-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${config.iconBg} ${config.glow} transition-all duration-300 group-hover:scale-110`}>
            <Icon className={`h-8 w-8 ${config.iconColor}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {value}
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </CardContent>
    </Card>
  );
};

export default StatsCard;
