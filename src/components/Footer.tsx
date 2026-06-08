"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  const pathname = usePathname();

  if (pathname?.startsWith("/studio")) {
    return null;
  }

  return (
    <footer className="bg-primary-teal text-slate-200 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/mulihmlogo.svg" alt="Mulhim Logo" className="h-10 w-auto brightness-0 invert" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-white font-bold text-lg tracking-wider font-tajawal">مُلهم</span>
                <span className="text-[10px] text-accent-yellow font-medium">MULHIM PLATFORM</span>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed pt-2">
              منصة ملهم تهدف لتمكين الشباب وتوفير فرص استثنائية للنمو والتعلم في بيئة مجتمعية محفزة لبناء جيل يقود المستقبل بأثر مستدام وعطاء متواصل.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href="https://youtube.com/@mulhim180?si=_BpMeZ4m8Kh6KZjC"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 text-slate-450"
                aria-label="يوتيوب"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://www.snapchat.com/add/mulhim.180"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-yellow-400 hover:text-slate-900 flex items-center justify-center transition-all duration-300 hover:scale-110 text-slate-450"
                aria-label="سناب شات"
              >
                <svg className="w-5 h-5 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="m24.0116,42.2697c3.8272-.0024,4.9669-1.6066,7.486-2.7237,2.2497-.9976,5.4694.5087,6.1373-2.1616h0c.0865-1.3801,2.513-1.1579,3.8742-2.0996,1.2418-.8591,1.3659-2.2361.0902-2.778-2.8877-1.2269-5.9232-3.9144-6.6578-6.7964-.4582-1.7978,5.2788-2.3506,4.0841-5.7402-.7049-2.0001-3.2379-1.2958-4.616-.8478.9182-7.1086-2.542-13.3923-10.4098-13.3923s-11.328,6.2837-10.4098,13.3923c-1.378-.448-3.911-1.1523-4.616.8478-1.1947,3.3896,4.5424,3.9424,4.0841,5.7402-.7346,2.882-3.77,5.5695-6.6578,6.7964-1.2757.542-1.1516,1.9189.0902,2.778,1.3612.9417,3.7878.7195,3.8742,2.0996h0c.6679,2.6703,3.8876,1.164,6.1373,2.1616,2.5191,1.1171,3.6588,2.7213,7.486,2.7237.0058,0,.0173,0,.0231,0Z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/mulhim.180?igsh=cjZkaGpiOTkyOGll"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 text-slate-450"
                aria-label="انستغرام"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.01 3.71.054.937.04 1.612.189 2.183.411a4.9 4.9 0 0 1 1.767 1.15 4.9 4.9 0 0 1 1.15 1.767c.221.57.37 1.245.411 2.183.044.925.054 1.28.054 3.71s-.01 2.784-.054 3.71c-.04.937-.189 1.612-.411 2.183a4.722 4.722 0 0 1-1.15 1.767 4.722 4.722 0 0 1-1.767 1.15c-.57.221-1.245.37-2.183.411-.925.044-1.28.054-3.71.054s-2.784-.01-3.71-.054c-.937-.04-1.612-.189-2.183-.411a4.79 4.79 0 0 1-1.767-1.15 4.79 4.79 0 0 1-1.15-1.767c-.221-.57-.37-1.245-.411-2.183C2.01 14.784 2 14.43 2 12s.01-2.784.054-3.71c.04-.937.189-1.612.411-2.183A4.79 4.79 0 0 1 3.7 4.368a4.79 4.79 0 0 1 1.767-1.15c.57-.221 1.245-.37 2.183-.411.925-.044 1.28-.054 3.71-.054zm0 2.232c-2.41 0-2.695.01-3.646.054-.88.04-1.358.186-1.676.31a3.033 3.033 0 0 0-1.116.726 3.033 3.033 0 0 0-.726 1.116c-.123.318-.269.796-.31 1.676-.043.951-.054 1.236-.054 3.646 0 2.41.01 2.695.054 3.646.04.88.186 1.358.31 1.676.124.318.33.643.726.116a3.033 3.033 0 0 0 1.116.726c.318.123.796.269 1.676.31.951.043 1.236.054 3.646.054 2.41 0 2.695-.01 3.646-.054.88-.04 1.358-.186 1.676-.31a3.033 3.033 0 0 0 1.116-.726 3.033 3.033 0 0 0 .726-1.116c.123-.318.269-.796.31-1.676.043-.951.054-1.236.054-3.646 0-2.41-.01-2.695-.054-3.646-.04-.88-.186-1.358-.31-1.676a3.033 3.033 0 0 0-.726-1.116 3.033 3.033 0 0 0-1.116-.726c-.318-.123-.796-.269-1.676-.31-.951-.043-1.236-.054-3.646-.054zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@mulhim180?_r=1&_t=ZS-96vq8RiYNtA"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-black hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110 text-slate-450"
                aria-label="تيك توك"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-8 after:h-0.5 after:bg-accent-yellow">
              روابط سريعة
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white hover:underline transition-all duration-200">
                  الصفحة الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white hover:underline transition-all duration-200">
                  عن ملهم (حكايتنا)
                </Link>
              </li>
              <li>
                <Link href="/programs" className="hover:text-white hover:underline transition-all duration-200">
                  البرامج والفعاليات
                </Link>
              </li>
              <li>
                <Link href="/trips" className="hover:text-white hover:underline transition-all duration-200">
                  الرحلات الاستكشافية
                </Link>
              </li>
              <li>
                <Link href="/academies" className="hover:text-white hover:underline transition-all duration-200">
                  الأكاديميات القيادية
                </Link>
              </li>
              <li>
                <Link href="/store" className="hover:text-white hover:underline transition-all duration-200">
                  المتجر الإلكتروني
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:underline transition-all duration-200">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Support */}
          <div>
            <h3 className="text-white font-bold text-base mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-8 after:h-0.5 after:bg-accent-yellow">
              قانوني والدعم
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-white hover:underline transition-all duration-200">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white hover:underline transition-all duration-200">
                  شروط وأحكام الاستخدام
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-bold text-base mb-6 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-8 after:h-0.5 after:bg-accent-yellow">
                تواصل معنا
              </h3>
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-accent-yellow" />
                <a href="mailto:info@mulhim180.com" className="hover:text-white transition-all">mulhim180@gmail.com</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent-yellow" />
                <a href="tel:+966564605055" className="hover:text-white transition-all font-sans" dir="ltr">+966 56 460 5055</a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-accent-yellow" />
                <span>جدة، المملكة العربية السعودية</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-300 text-center text-xs text-slate-300 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} منصة مُلهم (Mulhim Platform). جميع الحقوق محفوظة.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
            <span>تطوير وإشراف فريق ملهم التقني</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
