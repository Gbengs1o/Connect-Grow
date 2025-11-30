import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Church } from 'lucide-react';

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <Church className="h-6 w-6 text-primary" />
          <span className="sr-only">Connect & Grow</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/admin"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Admin Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full pt-12 md:pt-24 lg:pt-32 bg-gradient-to-b from-background to-muted/20">
          <div className="container px-4 md:px-6 space-y-10 xl:space-y-16">
            <div className="grid max-w-[1300px] mx-auto gap-8 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16 items-center">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-2">
                  <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] font-headline text-primary">
                    Welcome to Connect & Grow
                  </h1>
                  <div className="w-24 h-1 bg-primary rounded-full"></div>
                </div>
                <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                  Building a stronger community, one visitor at a time. Easily manage and follow up with new guests to help them feel at home in our church family.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200">
                    <Link href="/welcome">
                      <Church className="mr-2 h-5 w-5" />
                      I'm a New Visitor
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200">
                    <Link href="/admin">
                      Admin Portal
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-md mx-auto">
                  <svg
                    viewBox="0 0 400 300"
                    className="w-full h-auto drop-shadow-lg"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Sky background */}
                    <defs>
                      <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#87CEEB" />
                        <stop offset="100%" stopColor="#E0F6FF" />
                      </linearGradient>
                      <linearGradient id="churchGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F5F5DC" />
                        <stop offset="100%" stopColor="#DDD" />
                      </linearGradient>
                    </defs>

                    {/* Sky */}
                    <rect width="400" height="300" fill="url(#skyGradient)" />

                    {/* Ground */}
                    <rect x="0" y="220" width="400" height="80" fill="#90EE90" />

                    {/* Church main building */}
                    <rect x="120" y="120" width="160" height="100" fill="url(#churchGradient)" stroke="#999" strokeWidth="2" />

                    {/* Church roof */}
                    <polygon points="110,120 200,80 290,120" fill="#8B4513" stroke="#654321" strokeWidth="2" />

                    {/* Bell tower */}
                    <rect x="180" y="60" width="40" height="60" fill="url(#churchGradient)" stroke="#999" strokeWidth="2" />
                    <polygon points="175,60 200,40 225,60" fill="#8B4513" stroke="#654321" strokeWidth="2" />

                    {/* Cross on top */}
                    <rect x="198" y="25" width="4" height="20" fill="#FFD700" />
                    <rect x="192" y="31" width="16" height="4" fill="#FFD700" />

                    {/* Church door */}
                    <rect x="185" y="170" width="30" height="50" fill="#8B4513" stroke="#654321" strokeWidth="2" rx="15" />
                    <circle cx="208" cy="195" r="2" fill="#FFD700" />

                    {/* Windows */}
                    <rect x="140" y="140" width="20" height="30" fill="#87CEEB" stroke="#666" strokeWidth="2" rx="10" />
                    <rect x="240" y="140" width="20" height="30" fill="#87CEEB" stroke="#666" strokeWidth="2" rx="10" />

                    {/* Window crosses */}
                    <line x1="150" y1="140" x2="150" y2="170" stroke="#666" strokeWidth="1" />
                    <line x1="140" y1="155" x2="160" y2="155" stroke="#666" strokeWidth="1" />
                    <line x1="250" y1="140" x2="250" y2="170" stroke="#666" strokeWidth="1" />
                    <line x1="240" y1="155" x2="260" y2="155" stroke="#666" strokeWidth="1" />

                    {/* Bell tower window */}
                    <rect x="190" y="80" width="20" height="15" fill="#87CEEB" stroke="#666" strokeWidth="1" rx="7" />

                    {/* Trees */}
                    <circle cx="80" cy="180" r="25" fill="#228B22" />
                    <rect x="75" y="180" width="10" height="40" fill="#8B4513" />

                    <circle cx="320" cy="170" r="30" fill="#228B22" />
                    <rect x="315" y="170" width="10" height="50" fill="#8B4513" />

                    {/* Clouds */}
                    <ellipse cx="100" cy="50" rx="25" ry="15" fill="white" opacity="0.8" />
                    <ellipse cx="320" cy="40" rx="30" ry="18" fill="white" opacity="0.8" />

                    {/* Path to church */}
                    <path d="M 200 220 Q 200 230 200 240" stroke="#DDD" strokeWidth="8" fill="none" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
                How We Serve Our Community
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Discover the ways we help new visitors feel welcomed and connected
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-lg shadow-sm border">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Church className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Warm Welcome</h3>
                <p className="text-muted-foreground">
                  Every visitor receives a personal greeting and introduction to our church family
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-lg shadow-sm border">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Personal Follow-up</h3>
                <p className="text-muted-foreground">
                  Thoughtful follow-up to help you find your place in our community
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-lg shadow-sm border">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Growing Together</h3>
                <p className="text-muted-foreground">
                  Join small groups and ministries to deepen your faith and friendships
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 Connect & Grow. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
