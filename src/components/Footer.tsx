import { Printer, Mail, Twitter, Github, Linkedin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'サイトマップ',
      links: [
        { label: 'ホーム', href: '#' },
        { label: '技術記事', href: '#articles' },
        { label: 'メーカー', href: '#makers' },
        { label: 'カテゴリー', href: '#categories' },
      ],
    },
    {
      title: 'リソース',
      links: [
        { label: '3Dプリント基礎知識', href: '#' },
        { label: '材料ガイド', href: '#' },
        { label: 'ソフトウェア比較', href: '#' },
        { label: '用語集', href: '#' },
      ],
    },
    {
      title: '会社情報',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'お問い合わせ', href: '#' },
        { label: 'プライバシーポリシー', href: '#' },
        { label: '利用規約', href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#FF6B35] rounded-lg flex items-center justify-center">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg">3Dプリンターテック</span>
            </a>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              世界の3Dプリンティング技術の最新情報を日本語でお届けします。
              毎日更新される技術記事で、業界の最先端を追いかけましょう。
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#FF6B35] transition-colors duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-sm mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-400 text-sm hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {currentYear} 3Dプリンターテック. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors duration-200">
              プライバシーポリシー
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              利用規約
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              Cookie設定
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
