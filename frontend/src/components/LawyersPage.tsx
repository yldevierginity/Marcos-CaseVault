import { Users, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import Neyra from "./images/Neyra.jpg";
import Marcos from "./images/Marcos.jpg";
import Mendez from "./images/Mendez.jpg";
import Jungco from "./images/Jungco.jpg";

interface Lawyer {
  id: string;
  name: string;
  title: string;
  specialty: string;
  email: string;
  phone: string;
  image: string;
}

const lawyers: Lawyer[] = [
  {
    id: "1",
    name: "Prince Arthur M. Neyra",
    title: "Senior Partner",
    specialty: "Labor & Employment Law",
    email: "neyramarcoslawoffice@gmail.com",
    phone: "0939 928 1717",
    image: Neyra,
  },
  {
    id: "2",
    name: "Cloydie Mark A. Marcos",
    title: "Managing Partner",
    specialty: "Civil & Commercial Law",
    email: "neyramarcoslawoffice@gmail.com",
    phone: "(082) 291 5909",
    image: Marcos,
  },
  {
    id: "3",
    name: "Ryan E. Mendez",
    title: "Partner",
    specialty: "Civil & Commercial Law",
    email: "neyramarcoslawoffice@gmail.com",
    phone: "0976 030 2266",
    image: Mendez,
  },
  {
    id: "4",
    name: "Deolanar C. Jungco",
    title: "Partner",
    specialty: "Labor & Employment Law",
    email: "neyramarcoslawoffice@gmail.com",
    phone: "(082) 291 5909",
    image: Jungco,
  },
];

export function LawyersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-primary" />
          <h1>Our Lawyers</h1>
        </div>
        <p className="text-muted-foreground">
          Meet our experienced team of legal professionals
        </p>
      </div>

      {/* Lawyers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {lawyers.map((lawyer) => (
          <Card
            key={lawyer.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square overflow-hidden bg-muted">
              <ImageWithFallback
                src={lawyer.image}
                alt={lawyer.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-6">
              <h3 className="mb-1">{lawyer.name}</h3>
              <p className="text-sm text-accent mb-2">{lawyer.title}</p>
              <p className="text-sm text-muted-foreground mb-4">
                {lawyer.specialty}
              </p>
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground truncate">
                    {lawyer.email}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">{lawyer.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-12">
        <Card className="bg-accent/10 border-accent">
          <CardContent className="p-8 text-center">
            <h2 className="mb-4">Need Legal Assistance?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our team of experienced attorneys is ready to help you with your
              legal needs. Contact us today to schedule a consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:5551234567"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-secondary transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Us: (082) 291 5909
              </a>
              <a
                href="mailto:neyramarcoslawoffice@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
