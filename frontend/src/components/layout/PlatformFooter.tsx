

export function PlatformFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-card py-8 flex items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4 text-center max-w-6xl w-full px-6">
        <div className="flex items-center gap-6">
          <a href="#" className="p-2 rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300 shadow-sm" aria-label="Instagram">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
          <a href="#" className="p-2 rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300 shadow-sm" aria-label="Facebook">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>
          <a href="#" className="p-2 rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300 shadow-sm" aria-label="YouTube">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
            </svg>
          </a>
          <a href="#" className="p-2 rounded-full bg-secondary text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all duration-300 shadow-sm" aria-label="TikTok">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
            </svg>
          </a>
        </div>
        
        <div className="text-sm font-medium text-muted-foreground">
          © Sarriatech Software Dev 2026. Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}
