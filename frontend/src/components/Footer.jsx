export default function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/10 text-white py-16 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <h4 className="font-serif text-2xl font-bold tracking-widest uppercase mb-4 text-[#C9A66B]">
            BROTHERHOOD
          </h4>
          <p className="text-gray-400 text-sm mb-1 uppercase tracking-widest">Swargate, Pune</p>
          <p className="text-gray-400 text-sm mb-6 font-mono tracking-widest">+91 9172566873</p>
          <p className="text-gray-600 text-xs tracking-widest uppercase mt-8">
            ©️ 2026 BrotherHood. All rights reserved.
          </p>
        </div>
        
        <div>
          <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-6">QUICK LINKS</h4>
          <ul className="space-y-4 text-sm text-gray-400 tracking-wide">
            {['Privacy Policy', 'Terms of Service', 'FAQ'].map(link => (
              <li key={link}>
                <a href="#" className="hover:text-white transition-colors">{link}</a>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-6">CONNECT</h4>
          <div className="flex gap-6">
            {[
              { icon: 'fa-instagram', href: 'https://www.instagram.com/the.brotherhood2k26?igsh=aWYyOW0xYWdidHJn' },
              { icon: 'fa-facebook-f', href: '#' },
              { icon: 'fa-x-twitter', href: '#' },
            ].map(s => (
              <a 
                key={s.icon} 
                href={s.href} 
                target="_blank" 
                rel="noreferrer"
                className="text-gray-400 text-xl hover:text-white transition-colors"
              >
                <i className={`fab ${s.icon}`}></i>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
