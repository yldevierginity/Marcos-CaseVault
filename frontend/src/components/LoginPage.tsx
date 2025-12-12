import { useState } from "react";
import { Scale } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { authService } from "../services/auth-service";
import { validateGmailDomain } from "../config/aws-config";

interface LoginPageProps {
  onLogin: () => void;
  onForgotPassword: () => void;
  onNewPasswordRequired: () => void;
}

export function LoginPage({ onLogin, onForgotPassword, onNewPasswordRequired }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(() => {
    const savedError = sessionStorage.getItem("loginError");
    if (savedError) {
      sessionStorage.removeItem("loginError");
      return savedError;
    }
    return "";
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    
    if (!validateGmailDomain(email)) {
      setError("Please use a Gmail address to sign in.");
      return;
    }

    setIsLoading(true);
    
    authService.signIn({ email, password }).then((result) => {
      setIsLoading(false);
      if (result.success) {
        setTimeout(() => onLogin(), 100);
      } else if (result.requiresNewPassword) {
        onNewPasswordRequired();
      } else {
        sessionStorage.setItem("loginError", "Incorrect username or password.");
        setError("Incorrect username or password.");
        setEmail("");
        setPassword("");
      }
    }).catch(() => {
      setIsLoading(false);
      sessionStorage.setItem("loginError", "Incorrect username or password.");
      setError("Incorrect username or password.");
      setEmail("");
      setPassword("");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-full p-4">
              <Scale className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <CardTitle>Neyra Marcos Mendez Law Office</CardTitle>
          <CardDescription>
            Sign in to access your case management dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-300">
                ⚠️ {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your Gmail address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-accent hover:underline"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-secondary"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
