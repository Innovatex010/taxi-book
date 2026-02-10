import React from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, Clock, Shield, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Floating Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl bg-white/80 backdrop-blur-md border border-white/20 shadow-sm rounded-full px-6 py-3 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="font-heading font-bold text-xl text-[#0F172A]">UrbanCab</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-slate-600 hover:text-primary transition-colors text-sm font-medium">Features</a>
          <a href="#vehicles" className="text-slate-600 hover:text-primary transition-colors text-sm font-medium">Vehicles</a>
          <a href="#how-it-works" className="text-slate-600 hover:text-primary transition-colors text-sm font-medium">How it Works</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/signin">
            <Button variant="ghost" className="text-slate-600 hover:text-primary hover:bg-primary/5" data-testid="nav-signin-btn">
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button className="bg-primary text-white hover:bg-primary/90 shadow-md" data-testid="nav-signup-btn">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading font-bold text-5xl lg:text-6xl text-[#0F172A] tracking-tight leading-tight mb-6">
                Book Multi-Day <span className="text-primary">City Rides</span> in Advance
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Plan your city trips ahead. Book professional taxi services for multiple days with transparent pricing and trusted drivers.
              </p>
              <div className="flex gap-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all" data-testid="hero-get-started-btn">
                    Get Started
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="border-slate-300 hover:border-primary hover:text-primary" data-testid="hero-learn-more-btn">
                    Learn More
                  </Button>
                </a>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-slate-200">
                <div>
                  <div className="font-heading font-bold text-3xl text-[#0F172A]">500+</div>
                  <div className="text-sm text-slate-600 mt-1">Active Drivers</div>
                </div>
                <div>
                  <div className="font-heading font-bold text-3xl text-[#0F172A]">50K+</div>
                  <div className="text-sm text-slate-600 mt-1">Rides Completed</div>
                </div>
                <div>
                  <div className="font-heading font-bold text-3xl text-[#0F172A]">4.8★</div>
                  <div className="text-sm text-slate-600 mt-1">Average Rating</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1768291424878-3dbd4118d23d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwzfHx1cmJhbiUyMGNpdHklMjB0YXhpJTIwcGFzc2VuZ2VyJTIwaGFwcHl8ZW58MHx8fHwxNzcwNzE0NDI2fDA&ixlib=rb-4.1.0&q=85"
                alt="Happy passenger in urban taxi"
                className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-4xl text-[#0F172A] mb-4">Why Choose UrbanCab?</h2>
            <p className="text-lg text-slate-600">Everything you need for hassle-free city travel</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-8 hover:shadow-lg transition-shadow border-slate-100" data-testid="feature-card-multiday">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-[#0F172A] mb-3">Multi-Day Booking</h3>
              <p className="text-slate-600 leading-relaxed">Plan your entire city trip in advance. Book taxis for multiple days with flexible scheduling.</p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-slate-100" data-testid="feature-card-transparent">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-[#0F172A] mb-3">Transparent Pricing</h3>
              <p className="text-slate-600 leading-relaxed">Know exactly what you'll pay. No hidden charges, clear breakdown of distance and duration costs.</p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-slate-100" data-testid="feature-card-verified">
              <div className="w-12 h-12 bg-status-success/10 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-status-success" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-[#0F172A] mb-3">Verified Drivers</h3>
              <p className="text-slate-600 leading-relaxed">All our drivers are background-checked and professionally licensed for your safety.</p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-slate-100" data-testid="feature-card-fleet">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-[#0F172A] mb-3">Multiple Vehicle Types</h3>
              <p className="text-slate-600 leading-relaxed">Choose from Sedan, SUV, Hatchback, or Luxury vehicles based on your preference.</p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-slate-100" data-testid="feature-card-location">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-[#0F172A] mb-3">City-Wide Coverage</h3>
              <p className="text-slate-600 leading-relaxed">Available across major cities with reliable service at every location.</p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-slate-100" data-testid="feature-card-support">
              <div className="w-12 h-12 bg-status-info/10 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-status-info" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-[#0F172A] mb-3">24/7 Support</h3>
              <p className="text-slate-600 leading-relaxed">Get help whenever you need it with our round-the-clock customer support team.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Vehicle Types */}
      <section id="vehicles" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-4xl text-[#0F172A] mb-4">Choose Your Ride</h2>
            <p className="text-lg text-slate-600">Comfortable vehicles for every need and budget</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="overflow-hidden hover:shadow-xl transition-all" data-testid="vehicle-card-sedan">
              <img
                src="https://images.unsplash.com/photo-1741313240179-387dac3fddbe?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3aGl0ZSUyMHNlZGFuJTIwdGF4aSUyMHNpZGUlMjB2aWV3fGVufDB8fHx8MTc3MDcxNDQyNnww&ixlib=rb-4.1.0&q=85"
                alt="Sedan"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-2">Sedan</h3>
                <p className="text-slate-600 text-sm mb-3">Perfect for daily commute</p>
                <div className="text-primary font-semibold">$5/km + $200/day</div>
              </div>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-all" data-testid="vehicle-card-suv">
              <img
                src="https://images.unsplash.com/photo-1741313240179-387dac3fddbe?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3aGl0ZSUyMHNlZGFuJTIwdGF4aSUyMHNpZGUlMjB2aWV3fGVufDB8fHx8MTc3MDcxNDQyNnww&ixlib=rb-4.1.0&q=85"
                alt="SUV"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-2">SUV</h3>
                <p className="text-slate-600 text-sm mb-3">Spacious family rides</p>
                <div className="text-primary font-semibold">$5/km + $200/day</div>
              </div>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-all" data-testid="vehicle-card-hatchback">
              <img
                src="https://images.unsplash.com/photo-1741313240179-387dac3fddbe?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzl8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3aGl0ZSUyMHNlZGFuJTIwdGF4aSUyMHNpZGUlMjB2aWV3fGVufDB8fHx8MTc3MDcxNDQyNnww&ixlib=rb-4.1.0&q=85"
                alt="Hatchback"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-2">Hatchback</h3>
                <p className="text-slate-600 text-sm mb-3">Budget-friendly option</p>
                <div className="text-primary font-semibold">$5/km + $200/day</div>
              </div>
            </Card>

            <Card className="overflow-hidden hover:shadow-xl transition-all" data-testid="vehicle-card-luxury">
              <img
                src="https://images.unsplash.com/photo-1764089859662-7b4773dff85b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzV8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBibGFjayUyMGNhciUyMGNoYXVmZmV1ciUyMHNlcnZpY2V8ZW58MHx8fHwxNzcwNzE0NDI3fDA&ixlib=rb-4.1.0&q=85"
                alt="Luxury"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="font-heading font-semibold text-lg mb-2">Luxury</h3>
                <p className="text-slate-600 text-sm mb-3">Premium experience</p>
                <div className="text-primary font-semibold">$5/km + $200/day</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-bold text-4xl text-[#0F172A] mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Book your ride in three simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">1</div>
              <h3 className="font-heading font-semibold text-xl mb-3">Create Your Trip</h3>
              <p className="text-slate-600">Enter your city, dates, and locations for your planned visit</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">2</div>
              <h3 className="font-heading font-semibold text-xl mb-3">Book a Taxi</h3>
              <p className="text-slate-600">Choose your vehicle type and see transparent pricing instantly</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-status-success rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl">3</div>
              <h3 className="font-heading font-semibold text-xl mb-3">Enjoy Your Ride</h3>
              <p className="text-slate-600">Get matched with a verified driver and travel safely</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-12 shadow-2xl">
            <h2 className="font-heading font-bold text-4xl text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-white/90 text-lg mb-8">Join thousands of satisfied customers who trust UrbanCab for their city travel needs.</p>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg" data-testid="cta-get-started-btn">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-6 w-6" />
                <span className="font-heading font-bold text-xl">UrbanCab</span>
              </div>
              <p className="text-slate-400 text-sm">Your trusted partner for multi-day city taxi bookings.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Safety</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            © 2024 UrbanCab. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;