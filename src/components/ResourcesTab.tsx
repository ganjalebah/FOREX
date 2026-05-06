import React from 'react';
import { motion } from 'motion/react';
import { Database, Server, Cloud, Globe, Zap, Shield, Layout, Code } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResourceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  theme: 'light' | 'dark';
}

const ResourceCard: React.FC<ResourceCardProps & { key?: string }> = ({ title, description, icon, tags, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl group",
      theme === 'dark' 
        ? "bg-slate-900/50 border-white/5 hover:border-indigo-500/30" 
        : "bg-white border-slate-200 hover:border-indigo-500/30"
    )}
  >
    <div className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
      theme === 'dark' ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"
    )}>
      {icon}
    </div>
    <h3 className={cn("text-lg font-bold mb-2", theme === 'dark' ? "text-white" : "text-slate-900")}>
      {title}
    </h3>
    <p className={cn("text-sm mb-4 leading-relaxed", theme === 'dark' ? "text-slate-400" : "text-slate-600")}>
      {description}
    </p>
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <span 
          key={tag} 
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
            theme === 'dark' ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"
          )}
        >
          {tag}
        </span>
      ))}
    </div>
  </motion.div>
);

interface ResourcesTabProps {
  theme: 'light' | 'dark';
}

export const ResourcesTab = ({ theme }: ResourcesTabProps) => {
  const backendResources = [
    {
      title: 'Supabase',
      description: 'Sering disebut sebagai "Firebase open-source", sangat cocok untuk backend instan, database PostgreSQL, dan autentikasi gratis.',
      icon: <Database className="w-6 h-6" />,
      tags: ['PostgreSQL', 'Auth', 'Edge Functions', 'Realtime']
    },
    {
      title: 'Firebase',
      description: 'Layanan dari Google yang menyediakan database real-time, hosting, dan autentikasi gratis untuk pemula.',
      icon: <Cloud className="w-6 h-6" />,
      tags: ['NoSQL', 'Hosting', 'Cloud Functions', 'Analytics']
    },
    {
      title: 'Appwrite',
      description: 'Platform backend-as-a-service (BaaS) yang aman dan open-source dengan kontrol penuh atas data Anda.',
      icon: <Shield className="w-6 h-6" />,
      tags: ['BaaS', 'Self-hosted', 'Open Source', 'Microservices']
    }
  ];

  const hostingResources = [
    {
      title: 'Netlify',
      description: 'Sangat populer untuk hosting website statis dan frontend dengan fitur CI/CD, serverless functions, dan form handling.',
      icon: <Globe className="w-6 h-6" />,
      tags: ['Static Hosting', 'CI/CD', 'Edge Functions', 'Forms']
    },
    {
      title: 'Vercel',
      description: 'Hosting terbaik untuk Next.js dan frontend modern. Performa maksimal dengan deployment instan dari Git.',
      icon: <Zap className="w-6 h-6" />,
      tags: ['Next.js', 'Frontend', 'Serverless', 'Vitals']
    },
    {
      title: 'Cloudflare',
      description: 'Menyediakan CDN gratis, DNS cepat, dan perlindungan situs web yang sangat baik dengan Cloudflare Pages.',
      icon: <Server className="w-6 h-6" />,
      tags: ['CDN', 'DNS', 'Security', 'Edge Computing']
    },
    {
      title: 'Railway',
      description: 'Platform untuk men-deploy aplikasi backend (Node.js, Python, dll) dengan kemudahan penggunaan luar biasa.',
      icon: <Code className="w-6 h-6" />,
      tags: ['Backend', 'PaaS', 'Docker', 'Auto-scaling']
    }
  ];

  return (
    <div className="space-y-12 pb-10">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className={cn(
            "p-2 rounded-lg",
            theme === 'dark' ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
          )}>
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2 className={cn("text-xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
              Platform Backend & Database
            </h2>
            <p className={cn("text-xs font-bold uppercase tracking-[0.2em]", theme === 'dark' ? "text-blue-400/60" : "text-blue-500/60")}>
              Infrastructure for your Apps
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {backendResources.map(res => (
            <ResourceCard 
              key={res.title} 
              title={res.title}
              description={res.description}
              icon={res.icon}
              tags={res.tags}
              theme={theme} 
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className={cn(
            "p-2 rounded-lg",
            theme === 'dark' ? "bg-orange-500/20 text-orange-400" : "bg-orange-100 text-orange-600"
          )}>
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className={cn("text-xl font-black uppercase tracking-tight", theme === 'dark' ? "text-white" : "text-slate-900")}>
              Hosting & Deployment Gratis
            </h2>
            <p className={cn("text-xs font-bold uppercase tracking-[0.2em]", theme === 'dark' ? "text-orange-400/60" : "text-orange-500/60")}>
              Put your Apps Online
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {hostingResources.map(res => (
            <ResourceCard 
              key={res.title} 
              title={res.title}
              description={res.description}
              icon={res.icon}
              tags={res.tags}
              theme={theme} 
            />
          ))}
        </div>
      </section>
    </div>
  );
};
