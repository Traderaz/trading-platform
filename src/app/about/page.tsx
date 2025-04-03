import { Card } from "@/components/ui/card";
import {
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Expert-Led Learning",
    description: "Learn from experienced traders who have proven track records in the market.",
    icon: AcademicCapIcon,
  },
  {
    name: "Comprehensive Courses",
    description: "From basics to advanced strategies, we cover everything you need to succeed.",
    icon: ChartBarIcon,
  },
  {
    name: "Supportive Community",
    description: "Join a community of like-minded traders and share your journey.",
    icon: UserGroupIcon,
  },
  {
    name: "Practical Experience",
    description: "Apply what you learn with real-world trading scenarios and simulations.",
    icon: RocketLaunchIcon,
  },
];

const team = [
  {
    name: "John Doe",
    role: "Founder & CEO",
    image: "/team/john-doe.jpg",
    bio: "15+ years of trading experience, former hedge fund manager",
  },
  {
    name: "Jane Smith",
    role: "Head of Education",
    image: "/team/jane-smith.jpg",
    bio: "Expert in technical analysis and risk management",
  },
  {
    name: "Mike Johnson",
    role: "Lead Instructor",
    image: "/team/mike-johnson.jpg",
    bio: "Specialized in options trading and market psychology",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Empowering Traders Worldwide
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to democratize trading education and help traders of all levels
            achieve their financial goals through expert-led courses and a supportive community.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature) => (
            <Card key={feature.name} className="p-6">
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.name}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Story Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Story</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-muted-foreground mb-4">
                Founded in 2023, our platform emerged from a simple observation: quality trading
                education was either too expensive or too scattered across the internet. We set
                out to create a comprehensive, accessible platform that would bridge this gap.
              </p>
              <p className="text-muted-foreground">
                Today, we're proud to serve thousands of traders worldwide, helping them develop
                the skills and confidence needed to navigate the markets successfully.
              </p>
            </div>
            <div className="aspect-video bg-card rounded-lg">
              {/* Add an image or video here */}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <Card key={member.name} className="p-6 text-center">
                <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-card overflow-hidden">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserGroupIcon className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-1">{member.name}</h3>
                <p className="text-primary mb-2">{member.role}</p>
                <p className="text-muted-foreground">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 