import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Github, HelpCircle } from 'lucide-react';

export const HelpView = () => {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto mt-10">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
          <HelpCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">Need Help?</h2>
        <p className="text-slate-400 mt-2">Get in touch with the creator of FinPredict Pro</p>
      </div>

      <Card className="glass-card border-white/[0.05] bg-[#1a1c23]">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <a href="mailto:ts.saiannirudh@gmail.com" className="text-lg font-medium text-white hover:text-emerald-400 transition-colors">
                ts.saiannirudh@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Github className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">GitHub</p>
              <a href="https://github.com/SaiAnnirudh" target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-white hover:text-emerald-400 transition-colors">
                github.com/SaiAnnirudh
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
