// src/app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Send, Users, Database, LineChart } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Mail SaaS</span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium hover:underline">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:underline">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Professional Email Templates & Mass Mailing Made Simple
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Create beautiful email templates, manage contacts, and send bulk emails
                  with our easy-to-use platform.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/auth/register">
                  <Button size="lg" className="w-full">Get Started Free</Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-full overflow-hidden rounded-lg bg-card p-2 shadow-xl">
                {/* Placeholder for hero image */}
                <div className="flex h-full w-full items-center justify-center bg-muted rounded-md">
                  <Mail className="h-16 w-16 text-muted-foreground/50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Key Features
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl">
                Our powerful tools make email marketing efficient and effective
              </p>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mt-12">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <Mail className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Email Templates</h3>
              <p className="text-center text-muted-foreground">
                Create beautiful, responsive email templates with our easy-to-use editor.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <Users className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Contact Management</h3>
              <p className="text-center text-muted-foreground">
                Organize your contacts with custom fields and segmentation.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <Send className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Mass Mailing</h3>
              <p className="text-center text-muted-foreground">
                Send personalized emails to thousands of recipients with just a few clicks.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <LineChart className="h-10 w-10 text-primary" />
              <h3 className="text-xl font-bold">Analytics</h3>
              <p className="text-center text-muted-foreground">
                Track delivery status and performance with detailed reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="max-w-[600px] md:text-xl">
                Join thousands of businesses that use our platform to connect with their customers.
              </p>
            </div>
            <div>
              <Link href="/auth/register">
                <Button size="lg" variant="secondary">Create Your Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Mail SaaS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Mail SaaS. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
