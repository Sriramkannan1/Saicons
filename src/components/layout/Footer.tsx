import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Youtube, MessageCircle, Facebook, Mail, MapPin, Twitter, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { siteData } from "@/lib/data";

const ICONS: Record<string, any> = {
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
  whatsapp: MessageCircle,
  facebook: Facebook,
  twitter: Twitter,
  email: Mail,
};

const QUICK_LINKS = [
  { label: "Home", url: "/" },
  { label: "About Us", url: "/about" },
  { label: "Events", url: "/events" },
  { label: "Blog", url: "/blog" },
  { label: "Team", url: "/team" },
  { label: "Join Club", url: "/join" },
  { label: "Contact", url: "/contact" },
];

export function Footer() {
  const { data: site } = useQuery({
    queryKey: ["site-settings"],
    queryFn: siteData.getSettings,
  });

  const { data: socialLinks } = useQuery({
    queryKey: ["social-links"],
    queryFn: siteData.getSocialLinks,
  });

  const siteInfo = site || {
    group: "Group 1",
    currentDistrict: "RI District 3206",
    established: "1990-91",
    shortName: "SAICONS",
    tagline: "Service · Leadership · Fellowship",
    phone: "",
    phones: [] as {name: string, number: string}[],
    email: "",
    location: "Saibaba Colony, Coimbatore, Tamil Nadu, India",
    footerText: "Rotaract Club of Saibaba Colony",
    mapQuery: "Saibaba Colony, Coimbatore"
  };

  const socials = socialLinks || [];

  return (
    <footer className="relative bg-[#020813]/80 backdrop-blur-md pt-24 pb-8 overflow-hidden border-t border-white/10">
      
      {/* Subtle Architectural Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_100%_at_50%_0%,#000_20%,transparent_100%)] pointer-events-none"></div>

      {/* Ambient Spotlight */}
      <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.04] blur-[100px] rounded-[100%] pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Massive CTA Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12 pb-20 border-b border-white/10">
          <div className="max-w-2xl">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white tracking-tighter leading-[1.1]">
              Ready to <br />
              <span className="text-white/40">make an impact?</span>
            </h2>
            <p className="mt-6 text-white/50 text-lg leading-relaxed max-w-md">
              Join a global network of young leaders dedicated to solving the world's most pressing challenges.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <Link 
              to="/join"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-transform hover:scale-105 active:scale-95"
            >
              Become a Member
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              to="/contact"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/5 text-white border border-white/10 px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Info & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 py-20 border-b border-white/10">
          
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-white font-bold text-xl font-display">{siteInfo.footerText}</p>
              <p className="text-white/40 text-sm mt-2">{siteInfo.group}  ·  {siteInfo.currentDistrict}  ·  Est. {siteInfo.established}</p>
              
              <div className="mt-8 flex items-start gap-4 text-sm text-white/60 bg-white/5 p-4 rounded-2xl border border-white/10">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-white/40" />
                <span className="leading-relaxed">{siteInfo.location}</span>
              </div>
            </div>

            <div className="mt-12">
              <h3 className="font-semibold text-white/40 text-xs uppercase tracking-widest mb-6">Connect with us</h3>
              <div className="flex flex-wrap gap-3">
                {socials.map((s: any) => {
                  const Icon = ICONS[s.icon?.toLowerCase() || s.platform?.toLowerCase()] ?? Mail;
                  return (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={s.label}
                      className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white hover:text-black hover:scale-110"
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-12">
              <div>
                <h3 className="font-semibold text-white/40 text-xs uppercase tracking-widest mb-6">Navigation</h3>
                <ul className="grid grid-cols-2 gap-y-4 gap-x-4">
                  {QUICK_LINKS.map((l) => (
                    <li key={l.url}>
                      <Link to={l.url as never} className="text-sm font-medium text-white/70 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-white/40 text-xs uppercase tracking-widest mb-6">Reach Out</h3>
                <ul className="space-y-4">
                  {siteInfo.phones && siteInfo.phones.length > 0 ? (
                    siteInfo.phones.map((p: any, i: number) => (
                      <li key={i}>
                        <a href={`tel:${p.number}`} className="group flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors">
                          <MessageCircle className="h-4 w-4 text-white/40 group-hover:text-white" />
                          {p.name ? `${p.name} - ${p.number}` : p.number}
                        </a>
                      </li>
                    ))
                  ) : siteInfo.phone ? (
                    <li>
                      <a href={`tel:${siteInfo.phone}`} className="group flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors">
                        <MessageCircle className="h-4 w-4 text-white/40 group-hover:text-white" />
                        {siteInfo.phone}
                      </a>
                    </li>
                  ) : null}
                  {siteInfo.email && (
                    <li>
                      <a href={`mailto:${siteInfo.email}`} className="group flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors">
                        <Mail className="h-4 w-4 text-white/40 group-hover:text-white" />
                        {siteInfo.email}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Embedded Map Panel */}
            <div className="h-[300px] sm:h-full min-h-[300px] border border-white/10 bg-white/5 overflow-hidden rounded-3xl relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-0"></div>
              {(() => {
                const query = siteInfo.mapQuery || "Saibaba Colony, Coimbatore";
                let finalSrc = "";
                
                if (query.includes("<iframe") && query.includes("src=")) {
                  const match = query.match(/src="([^"]+)"/);
                  finalSrc = match ? match[1] : "";
                } else if (query.includes("google.com/maps/embed")) {
                  finalSrc = query;
                } else {
                  const searchQuery = query.startsWith("http") ? siteInfo.location : query;
                  finalSrc = `https://maps.google.com/maps?q=${encodeURIComponent(searchQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
                }

                return (
                  <iframe
                    title="Map of Saibaba Colony, Coimbatore"
                    src={finalSrc}
                    className="absolute inset-0 h-full w-full border-0 grayscale hover:grayscale-0 transition-all duration-700 opacity-60 hover:opacity-100"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                );
              })()}
              <div className="absolute bottom-6 left-6 z-20 pointer-events-none transition-transform duration-500 group-hover:translate-y-8 group-hover:opacity-0">
                <p className="font-display font-bold text-white tracking-wide">Location</p>
                <p className="text-white/50 text-xs mt-1">Coimbatore, India</p>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Section: Copyright & Tagline */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-10 text-xs text-white/40 relative z-20">
          <p>© {new Date().getFullYear()} {siteInfo.footerText}. All rights reserved.</p>
          <p className="tracking-[0.2em] uppercase font-medium">{siteInfo.tagline}</p>
        </div>

      </div>

      {/* Massive Background Typography */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full overflow-hidden pointer-events-none select-none flex justify-center z-0">
        <span className="text-[24vw] font-display font-bold text-white/[0.06] leading-none whitespace-nowrap tracking-tighter">
          {siteInfo.shortName}
        </span>
      </div>

    </footer>
  );
}
