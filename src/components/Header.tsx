import { useState, useEffect } from 'react';
import { Search, Menu, X, Globe, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function Header({ searchValue, onSearchChange }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'ホーム', href: '#' },
    { label: '技術記事', href: '#articles' },
    { label: 'メーカー', href: '#makers' },
    { label: 'カテゴリー', href: '#categories' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-2 px-4'
          : 'py-4 px-6'
      }`}
    >
      <div
        className={`mx-auto transition-all duration-500 ${
          isScrolled
            ? 'max-w-4xl glass rounded-full shadow-lg px-6 py-2'
            : 'max-w-7xl'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a 
            href="#" 
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <span className={`font-bold text-lg text-gray-800 transition-all duration-300 ${
              isScrolled ? 'hidden md:block' : ''
            }`}>
              3Dプリンターテック
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm underline-animate transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className={`transition-all duration-300 ${
              isSearchOpen ? 'w-64' : 'w-auto'
            }`}>
              {isSearchOpen ? (
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="記事を検索..."
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-10 search-glow transition-all duration-300"
                    autoFocus
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      onSearchChange('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="hover:bg-gray-100 transition-colors duration-200"
                >
                  <Search className="w-5 h-5 text-gray-600" />
                </Button>
              )}
            </div>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex hover:bg-gray-100 transition-colors duration-200"
            >
              <Globe className="w-5 h-5 text-gray-600" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-gray-100 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4 animate-fade-in-up">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 font-medium py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="記事を検索..."
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 search-glow"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
