"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ShoppingCart, User, Menu, X, Trash2, Plus, Minus, ShieldAlert } from "lucide-react";

export const Header: React.FC = () => {
  const pathname = usePathname();
  
  const { cart, removeFromCart, updateCartQuantity, currentUser, logoutUser } = useApp();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  if (pathname?.startsWith("/studio")) {
    return null;
  }

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const navLinks = [
    { name: "الرئيسية", path: "/" },
    { name: "عن ملهم", path: "/about" },
    { name: "البرامج", path: "/programs" },
    { name: "الرحلات", path: "/trips" },
    { name: "الأكاديميات", path: "/academies" },
    { name: "المتجر", path: "/store" },
    { name: "التسجيل", path: "/register" },
    { name: "تواصل معنا", path: "/contact" }
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass bg-white/80 border-b border-slate-100 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/mulihmlogo.svg" alt="Mulhim Logo" className="h-10 w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 space-x-reverse">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "text-accent-yellow bg-yellow-50/50 border-b-2 border-accent-yellow"
                        : "text-slate-600 hover:text-primary-navy hover:bg-slate-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              {/* Dashboard Link for Admin (Sanity Studio) */}
              {currentUser?.role === 'admin' && (
                <Link
                  href="/studio"
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 self-center mr-2 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:scale-105`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  لوحة التحكم
                </Link>
              )}
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-3">
              {/* Cart Toggle Button */}
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative p-2 rounded-full text-slate-600 hover:text-accent-yellow hover:bg-slate-100 transition-all duration-300"
                aria-label="سلة المشتريات"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-accent-yellow rounded-full animate-bounce">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              {/* User Account / Profile */}
              <div className="relative">
                {currentUser ? (
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="w-10 h-10 rounded-full bg-yellow-600 text-white font-bold flex items-center justify-center shadow-md hover:bg-yellow-700 transition-all duration-300"
                  >
                    {currentUser.fullName.charAt(0)}
                  </button>
                ) : (
                  <Link
                    href="/register"
                    className="p-2 rounded-full text-slate-600 hover:text-accent-yellow hover:bg-slate-100 transition-all duration-300 block"
                    aria-label="تسجيل الدخول"
                  >
                    <User className="w-6 h-6" />
                  </Link>
                )}

                {/* Profile Dropdown */}
                {currentUser && isProfileDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 focus:outline-none z-50 text-right animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3">
                      <p className="text-xs text-slate-400">مرحباً بك،</p>
                      <p className="text-sm font-semibold text-slate-800">{currentUser.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        لوحة التحكم الخاصة بك
                      </Link>
                      <button
                        onClick={() => {
                          logoutUser();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-right block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Burger Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-primary-navy hover:bg-slate-100 transition-all duration-300"
                aria-label="القائمة الرئيسية"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 border-b border-slate-100 shadow-inner px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top-5 duration-300">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                    isActive
                      ? "text-accent-yellow bg-yellow-50"
                      : "text-slate-700 hover:text-primary-navy hover:bg-slate-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            {/* Dashboard Mobile Link */}
            {currentUser?.role === 'admin' && (
              <Link
                href="/studio"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-base font-semibold text-blue-700 bg-blue-50 border border-blue-100 transition-all duration-300 flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" />
                لوحة التحكم (الإدارة)
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Shopping Cart Sliding Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsCartOpen(false)} />
          <div className="fixed inset-y-0 left-0 max-w-full flex pr-10 pl-0">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-300">
              {/* Drawer Header */}
              <div className="px-6 py-6 bg-primary-navy text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-accent-yellow" />
                  <h2 className="text-lg font-bold font-tajawal">سلة المشتريات</h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Drawer Body - Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <p className="text-slate-600 font-bold mb-2">السلة فارغة حالياً</p>
                    <p className="text-slate-400 text-xs px-6">تصفح المتجر الإلكتروني وأضف المنتجات الرائعة التي تناسبك!</p>
                    <Link
                      href="/store"
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 px-6 py-2.5 bg-accent-yellow text-white rounded-xl text-sm font-semibold hover:bg-primary-yellow transition-all duration-300"
                    >
                      تصفح المتجر الآن
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{item.product.name}</h4>
                          <span className="text-xs text-accent-yellow font-semibold">{item.product.price} ر.س</span>
                        </div>
                        {/* Quantity Counter */}
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center gap-1 border border-slate-200 rounded-lg bg-slate-50 px-1">
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 text-slate-500 hover:text-accent-yellow hover:bg-white rounded-md transition-all duration-200"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-semibold text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 text-slate-500 hover:text-accent-yellow hover:bg-white rounded-md transition-all duration-200"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer - Total & Checkout */}
              {cart.length > 0 && (
                <div className="border-t border-slate-100 p-6 bg-slate-50 space-y-4">
                  <div className="flex justify-between items-center text-slate-800">
                    <span className="text-sm font-semibold">المجموع الإجمالي</span>
                    <span className="text-lg font-bold text-accent-yellow">{cartTotal} ر.س</span>
                  </div>
                  <p className="text-[11px] text-slate-400">الأسعار تشمل ضريبة القيمة المضافة. توصيل سريع وآمن لجميع مناطق المملكة.</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/store"
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-3 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-center text-sm font-bold transition-all duration-300"
                    >
                      متابعة التسوق
                    </Link>
                    <Link
                      href="/store?checkout=true"
                      onClick={() => setIsCartOpen(false)}
                      className="w-full py-3 bg-accent-yellow hover:bg-primary-yellow text-white rounded-xl text-center text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      إتمام الطلب
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
