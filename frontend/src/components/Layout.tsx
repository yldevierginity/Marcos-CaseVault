import { Scale, LogOut } from "lucide-react";
import { Button } from "./ui/button";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function Layout({ children, currentPage, onNavigate, onLogout }: LayoutProps) {
  const navItems = ["Home", "Cases", "About", "Lawyers"];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <nav className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="w-8 h-8" />
              <h1 className="text-xl">NMMJ LAW OFFICE</h1>
            </div>
            <div className="flex items-center gap-6">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => onNavigate(item.toLowerCase())}
                  className={`hover:text-accent transition-colors ${
                    currentPage === item.toLowerCase() ? "text-accent" : ""
                  }`}
                >
                  {item}
                </button>
              ))}
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="ml-2 border-primary-foreground/20 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-6 h-6" />
                <h3>Neyra Marcos Mendez Law Office</h3>
              </div>
              <p className="text-sm opacity-90">
                Providing exceptional legal services since 2011.
              </p>
            </div>
            <div>
              <h3 className="mb-4">Contact Us</h3>
              <p className="text-sm opacity-90">Kumintang Street, Mintal</p>
              <p className="text-sm opacity-90">Davao City 8000, Philippines</p>
              <p className="text-sm opacity-90">Phone: (082) 291 5909</p>
              <p className="text-sm opacity-90">Email: neyramarcoslawoffice@gmail.com</p>
            </div>
            <div>
              <h3 className="mb-4">Office Hours</h3>
              <p className="text-sm opacity-90">Monday - Saturday: 9:00 AM - 5:00 PM</p>
              <p className="text-sm opacity-90">Sunday: Closed</p>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-90">
            <p>&copy; 2025 Neyra Marcos Mendez Law Office. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}