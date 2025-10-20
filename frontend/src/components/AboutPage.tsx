import { Scale, Award, Users, Building2, Mail, Phone, MapPin, Code } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
// import { ImageWithFallback } from "./figma/ImageWithFallback";

export function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <div className="bg-primary rounded-full p-6">
            <Scale className="w-16 h-16 text-primary-foreground" />
          </div>
        </div>
        <h1 className="mb-4">About Legal Partners & Associates</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Providing exceptional legal services and representation since 2005
        </p>
      </div>

      {/* Our Story */}
      <div className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Founded in 2005, Neyra Marcos Mendez Jungco Law Office has been at the
              forefront of providing comprehensive legal services to individuals
              and businesses across the country. Our firm was built on the
              foundation of integrity, excellence, and unwavering commitment to
              our clients.
            </p>
            <p>
              With over two decades of combined experience, our team of dedicated
              attorneys specializes in various areas of law, ensuring that our
              clients receive expert guidance tailored to their unique needs.
            </p>
            <p>
              We pride ourselves on our client-centered approach, combining
              traditional legal expertise with modern technology to deliver
              efficient and effective solutions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="w-12 h-12 text-accent mx-auto mb-3" />
            <div className="text-3xl mb-2">500+</div>
            <p className="text-sm text-muted-foreground">Cases Won</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="w-12 h-12 text-accent mx-auto mb-3" />
            <div className="text-3xl mb-2">1000+</div>
            <p className="text-sm text-muted-foreground">Satisfied Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Building2 className="w-12 h-12 text-accent mx-auto mb-3" />
            <div className="text-3xl mb-2">20+</div>
            <p className="text-sm text-muted-foreground">Years Experience</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Scale className="w-12 h-12 text-accent mx-auto mb-3" />
            <div className="text-3xl mb-2">8</div>
            <p className="text-sm text-muted-foreground">Practice Areas</p>
          </CardContent>
        </Card>
      </div>

      {/* Practice Areas */}
      <div className="mb-12">
        <h2 className="mb-6">Our Practice Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Corporate Law",
            "Contract Law",
            "Employment Law",
            "Personal Injury",
            "Property Law",
            "Estate Planning",
            "Intellectual Property",
            "Family Law",
          ].map((area) => (
            <Card key={area}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <p>{area}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Address</p>
                <p className="text-sm text-muted-foreground">
                  Kumintang Street, Mintal, Davao City, Philippines
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">(082) 291 5909</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  neyramarcoslawoffice@gmail.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-12" />

      {/* Developer Section */}
      <div>
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Code className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2">Developer Information</h2>
          <p className="text-sm text-muted-foreground">
            Meet the team behind this application
          </p>
        </div>

        {/* Developer Profile */} 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Developer 1 */}
          <Card className="bg-muted/30 border shadow-lg">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-4 overflow-hidden">
                  {/* <Users className="w-12 h-12 text-muted-foreground" /> */}
                  <img src="/ylde.jpg" alt="Developer Name" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold mb-1">Yldevier John Magpusao</h3>
                <p className="text-sm text-muted-foreground mb-3">Lead Developer</p>
                <div className="space-y-1 text-sm w-full">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">yamagpusao@up.edu.ph</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">+63 5555</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developer 2 */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-4 overflow-hidden">
                  {/* <Users className="w-12 h-12 text-muted-foreground" /> */}
                  <img src="/drew.jpg" alt="Developer Name" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold mb-1">Andrew Jerick B. Mante</h3>
                <p className="text-sm text-muted-foreground mb-3">Frontend Developer</p>
                <div className="space-y-1 text-sm w-full">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">abmante@up.edu.ph</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">+63 4564564</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developer 3 */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mb-4 overflow-hidden">
                  {/* <Users className="w-12 h-12 text-muted-foreground" /> */}
                  <img src="/carl.jpg" alt="Developer Name" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold mb-1">Carl Raymund P. Suello</h3>
                <p className="text-sm text-muted-foreground mb-3">UI/UX Designer</p>
                <div className="space-y-1 text-sm w-full">
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">cpsuello@up.edu.ph</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">+63 11111</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="mb-3">Technology Stack</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                    React with TypeScript
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                    Tailwind CSS v4
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                    Shadcn/ui Components
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                    Lucide Icons
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-3">Features</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                    Responsive Design
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                    Case Management System
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                    Advanced Filtering
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                    Modern UI/UX
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                &copy; 2025 NMMJ Law Office Database System
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Version 1.0.0 | Dura lex, sed lex.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}