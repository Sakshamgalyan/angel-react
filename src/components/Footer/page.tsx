"use client";

import React from 'react';

function Footer() {
  return (
    <footer className="w-full mt-auto py-8 px-4 text-center text-sm text-muted-foreground border-t border-border/40 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© 2025 Capital Growth Labs. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-primary transition-colors" href="mailto:contact@capitalgrowth.com">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
