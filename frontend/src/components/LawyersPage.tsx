import { Users, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

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
    image: "https://visscards.com/wp-content/uploads/2025/07/520982044_1552160548880264_8356160580350536972_n-1.jpg",
  },
  {
    id: "2",
    name: "Cloydie Mark A. Marcos",
    title: "Managing Partner",
    specialty: "Civil & Commercial Law",
    email: "neyramarcoslawoffice@gmail.com",
    phone: "(082) 291 5909",
    image: "https://scontent.fdvo1-1.fna.fbcdn.net/v/t39.30808-6/486503239_10228900828450075_8650763127292178408_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEjm5J_70pTaCf_j-VgoAfSyIZ2VSfPo-3IhnZVJ8-j7SdXsoCRH863sdiftTCIPDXWkO_N_bnPC-pimdtI_7uH&_nc_ohc=Z9t33dpTE_0Q7kNvwFSLwG1&_nc_oc=AdmYJyEIApTNLDj3_TKXoeZJGZiPdxsyPMSMGFv-Q0C7VyDdlkMqoCyedwcnHeyssVI&_nc_zt=23&_nc_ht=scontent.fdvo1-1.fna&_nc_gid=oufey_RQnX4O8z9c56qv3w&oh=00_AfdAL6e4sNXeaGVRRh6zF_jAWCYAQsIDFmKiLk1WlG8-ag&oe=68FFE829",
  },
  {
    id: "3",
    name: "Ryan E. Mendez",
    title: "Partner",
    specialty: "Civil & Commercial Law",
    email: "neyramarcoslawoffice@gmail.com",
    phone: "0976 030 2266",
    image: "https://scontent.fdvo1-2.fna.fbcdn.net/v/t39.30808-6/534680716_1088248146708530_5196565418015870623_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHj256LW9xcvZKSGlk0W8Sk9qXqH-hZeAf2peof6Fl4B9VRVUMErplKloOS0r5J2sfxNfEDKNLLJ-Njil3obLoU&_nc_ohc=i47-Jmx4BbUQ7kNvwG8Ik6f&_nc_oc=AdlpaAdCSq-HflJuMlYS-JS1gimNmvszmQAs29PKEFy3ji9si_CDqkCWZX3YiNOh384&_nc_zt=23&_nc_ht=scontent.fdvo1-2.fna&_nc_gid=-KD8tsayCLagvR7nNKunBQ&oh=00_AffSSwRSNa04NWT7yH0b1yFOCt2yNvGht2JdBRnQBh9nxw&oe=68FFCC79",
  },
  {
    id: "4",
    name: "Deolanar C. Jungco",
    title: "Partner",
    specialty: "Labor & Employment Law",
    email: "neyramarcoslawoffice@gmail.com",
    phone: "(082) 291 5909",
    image: "https://scontent.fdvo1-1.fna.fbcdn.net/v/t39.30808-6/486662614_10228900828570078_1484952674209267624_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeERxjGCmLDZ58NF9TAsP_749bx_LKOVUyj1vH8so5VTKGuUfb4ise_eYnbJnbJXVDFIj-mXd4sQA1uIZDhaaHjU&_nc_ohc=xcT9tSwv18gQ7kNvwHmlSKc&_nc_oc=Adm7EeMdk1vTEg_IIS719XTPAvHlnVy_fcreEwqHTgl0v7xThxo2eVRIKyqOUF8yxh4&_nc_zt=23&_nc_ht=scontent.fdvo1-1.fna&_nc_gid=A_e_wUlJd4FCaUMsKWVniQ&oh=00_AfdIenwUhqrBQ6t58eQu4VhWAzi6ZGdTEJJkN8phHSkz1Q&oe=68FFDB1E",
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
