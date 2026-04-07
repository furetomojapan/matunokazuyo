import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { 
  Instagram, 
  MessageCircle, 
  Calendar, 
  Heart, 
  Leaf, 
  Droplets, 
  ArrowRight,
  ChevronRight,
  Mail,
  Clock,
  MapPin
} from "lucide-react";

import { scheduleData as fallbackData, ScheduleItem } from "./data/schedule";
import Papa from "papaparse";

// --- Sakura Petal Component ---
const SakuraPetal = ({ id }: { id: number; key?: any }) => {
  const [initialX] = useState(Math.random() * 100);
  const [duration] = useState(10 + Math.random() * 20);
  const [delay] = useState(Math.random() * 10);
  const [size] = useState(10 + Math.random() * 15);
  const [rotation] = useState(Math.random() * 360);

  return (
    <motion.div
      className="sakura-petal fixed top-[-20px] opacity-60"
      initial={{ 
        left: `${initialX}%`, 
        y: -20, 
        rotate: rotation,
        scale: 0.5
      }}
      animate={{
        y: "110vh",
        x: [
          `${initialX}%`, 
          `${initialX + (Math.random() * 10 - 5)}%`, 
          `${initialX + (Math.random() * 20 - 10)}%`
        ],
        rotate: rotation + 720,
        scale: [0.5, 1, 0.8]
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "linear"
      }}
      style={{
        width: size,
        height: size * 0.8,
        background: "radial-gradient(circle, #ffb7c5 0%, #ffd1dc 100%)",
        borderRadius: "100% 0% 100% 0% / 100% 0% 100% 0%",
      }}
    />
  );
};

const SakuraBackground = () => {
  const [petals, setPetals] = useState<number[]>([]);
  
  useEffect(() => {
    setPetals(Array.from({ length: 25 }, (_, i) => i));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {petals.map((id) => (
        <SakuraPetal key={id} id={id} />
      ))}
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollRef = useRef(null);
  const { scrollYProgress } = useScroll();
  
  const [schedule, setSchedule] = useState<ScheduleItem[]>(fallbackData);
  
  // --- Contact Form State ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "YOSAのご予約について",
    message: ""
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const mailtoLink = `mailto:kenkazu1105@icloud.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `お名前: ${formData.name}\nメールアドレス: ${formData.email}\n\nメッセージ:\n${formData.message}`
    )}`;
    
    window.location.href = mailtoLink;
  };

  // --- Google Sheet Fetching ---
  // ここにスプレッドシートの「ウェブに公開」したCSVのURLを入れます
  const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR2MVBTBNkCezFbOBS4Dv8XrjJPPfxG9p4s14JNO0pVqKVg-DIHg9NJt8wjcjyz8jvoYA-aD0jg3GWU/pub?gid=1179263377&single=true&output=csv";

  useEffect(() => {
    const fetchSchedule = async () => {
      console.log("Fetching schedule from:", SHEET_CSV_URL);
      try {
        const response = await fetch(SHEET_CSV_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvText = await response.text();
        console.log("CSV Data received (first 50 chars):", csvText.substring(0, 50));
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: 'greedy',
          transformHeader: (header) => header.trim().replace(/^\uFEFF/, ""), // BOM（文字化けの原因）を削除
          complete: (results) => {
            console.log("Parsed results:", results);
            if (results.data && Array.isArray(results.data)) {
              // date または event が存在する行を有効なデータとする
              const validData = results.data.filter((item: any) => 
                item && typeof item === 'object' && (item.date || item.event)
              );
              
              if (validData.length > 0) {
                console.log("Setting schedule with", validData.length, "items");
                setSchedule(validData as ScheduleItem[]);
              } else {
                console.warn("No valid data found in CSV. Check column names (date, event, time_range, location).");
              }
            }
          },
          error: (error) => {
            console.error("PapaParse error:", error);
          }
        });
      } catch (error) {
        console.error("Failed to fetch schedule from Google Sheets:", error);
      }
    };

    fetchSchedule();
  }, []);

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div className="relative min-h-screen selection:bg-sakura-pink selection:text-neutral-900">
      <SakuraBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 flex justify-between items-baseline mix-blend-difference text-white">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-serif tracking-widest"
        >
          Diamond Sweet Pea
        </motion.div>
        <div className="hidden md:flex gap-12 text-xs uppercase tracking-[0.3em] font-medium">
          {["Story", "Services", "Schedule", "Contact"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="hover:opacity-50 transition-opacity">
              {item}
            </a>
          ))}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden px-6">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/mk.png" 
            alt="Hero Background"
            className="w-full h-full object-cover grayscale opacity-10"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-sakura-light/80 via-transparent to-sakura-light" />
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 text-center max-w-4xl"
        >
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="block text-xs md:text-sm uppercase tracking-[0.5em] mb-8 text-neutral-500 font-medium"
          >
            Beauty & Wellness Portfolio
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-5xl md:text-8xl font-serif leading-[1.1] mb-12 tracking-tight"
          >
            心身を温め、<br />
            <span className="italic font-light">心地よい暮らしを。</span>
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8"
          >
            <div className="h-[1px] w-24 bg-neutral-300 hidden md:block" />
            <p className="text-lg md:text-xl font-serif italic text-neutral-600">
              Diamond Sweet Pea — kenkazu1105
            </p>
            <div className="h-[1px] w-24 bg-neutral-300 hidden md:block" />
          </motion.div>
        </motion.div>
        
        {/* Vertical Text Accent */}
        <div className="absolute right-8 bottom-24 hidden lg:block">
          <span className="writing-vertical text-[10px] uppercase tracking-[1em] text-neutral-400 font-medium">
            Est. 2019 / Diamond Sweet Pea
          </span>
        </div>
      </section>

      {/* My Story Section */}
      <section id="story" className="relative py-32 px-6 lg:px-24 bg-white/40 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="aspect-[3/4] bg-neutral-100 rounded-t-[200px] overflow-hidden relative shadow-2xl"
            >
              {/* 
                アップロードいただいた mk.png を使用しています。
              */}
              <img 
                src="/src/mk.png" 
                alt="kenkazu1105 - ENJO実演販売の様子"
                className="w-full h-full object-cover grayscale transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-sakura-pink/10 mix-blend-multiply" />
            </motion.div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-sakura-pink rounded-full -z-10 blur-3xl opacity-30" />
            <p className="mt-6 text-xs text-neutral-400 font-serif italic text-center">
              実演販売でENJOの魅力を伝える様子
            </p>
          </div>
          
          <div className="lg:col-span-7 pt-12">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-serif mb-12 leading-tight">
                25年の経験が紡ぐ、<br />
                <span className="italic font-light">癒やしの物語。</span>
              </h2>
              
              <div className="space-y-12 text-neutral-600 leading-relaxed max-w-2xl">
                <p className="text-lg">
                  1994年から2019年まで、菓子メーカーなどの企業で営業職として25年間勤務。
                  シングルマザーとして3人の子供たちを育て上げながら、仕事と家庭の両立に奔走してきました。
                </p>
                <p className="text-lg">
                  その経験の中で感じた「心身の健康」の大切さ。
                  2019年10月、自らの想いを形にするため、美容と健康のサービス業「Diamond Sweet Pea」を開業しました。
                </p>
                
                <div className="pt-8 border-t border-neutral-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-[1px] bg-sakura-deep" />
                    <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">Timeline</span>
                  </div>
                  <ul className="space-y-4 font-serif italic">
                    <li className="flex gap-4">
                      <span className="text-sakura-deep font-bold">1994-2019</span>
                      <span>営業職として多忙な日々を過ごす</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-sakura-deep font-bold">2019.10</span>
                      <span>Diamond Sweet Pea 開業</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-sakura-deep font-bold">2022-</span>
                      <span>「エンヨーLIFE」正規販売店として活動開始</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <h2 className="text-6xl md:text-8xl font-serif tracking-tighter">
              Services
            </h2>
            <p className="max-w-xs text-sm text-neutral-500 leading-relaxed">
              心身を芯から温めるYOSAと、地球に優しい暮らしを提案するエンヨー。
              二つのアプローチで、あなたの毎日を豊かに。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            {/* Service 1: YOSA */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-2xl mb-8 relative">
                <img 
                  src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1000" 
                  alt="YOSA"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-neutral-900/20 group-hover:bg-neutral-900/10 transition-colors" />
                <div className="absolute bottom-8 left-8 text-white">
                  <span className="text-xs uppercase tracking-[0.3em] font-bold mb-2 block">Relaxation</span>
                  <h3 className="text-3xl font-serif">YOSA PARK</h3>
                </div>
              </div>
              
              <div className="pl-4">
                <h4 className="text-2xl font-serif mb-4">Diamond Sweet Pea</h4>
                <p className="text-neutral-600 mb-8 leading-relaxed">
                  水素とよもぎを使った下半身からのスチームサウナ。
                  滝汗によるデトックス、ダイエット効果、そして何より深いリラックスを。
                  温かい雰囲気で皆様のお越しをお待ちしております。
                </p>
                <div className="flex flex-wrap gap-3 mb-10">
                  {["滝汗", "デトックス", "ダイエット", "温活"].map(tag => (
                    <span key={tag} className="px-4 py-1 rounded-full border border-neutral-200 text-xs text-neutral-500 italic">
                      #{tag}
                    </span>
                  ))}
                </div>
                <a 
                  href="#" 
                  className="inline-flex items-center gap-4 px-8 py-4 bg-sakura-deep text-white rounded-full hover:bg-sakura-pink transition-colors font-medium shadow-lg shadow-sakura-pink/20"
                >
                  U+WORD会員様 限定予約 <ArrowRight size={18} />
                </a>
              </div>
            </motion.div>

            {/* Service 2: ENJO */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group relative lg:mt-32"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-2xl mb-8 relative">
                <img 
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000" 
                  alt="ENJO"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-neutral-900/20 group-hover:bg-neutral-900/10 transition-colors" />
                <div className="absolute bottom-8 left-8 text-white">
                  <span className="text-xs uppercase tracking-[0.3em] font-bold mb-2 block">Clean the World</span>
                  <h3 className="text-3xl font-serif">エンヨーLIFE</h3>
                </div>
              </div>
              
              <div className="pl-4">
                <h4 className="text-2xl font-serif mb-4">オーストリア生まれの魔法の掃除</h4>
                <p className="text-neutral-600 mb-8 leading-relaxed">
                  水だけで汚れが落ちる、化学薬品を一切使わないお掃除用品「ENJO（エンヨー）」。
                  人と環境を思いやる、オーストリア生まれの画期的なブランドです。
                  対面販売にこだわり、皆様の暮らしに合わせた最適な使い方を直接お伝えしています。
                </p>
                <div className="flex flex-wrap gap-3 mb-10">
                  {["オーストリア製", "化学薬品不使用", "サステナブル", "対面販売"].map(tag => (
                    <span key={tag} className="px-4 py-1 rounded-full border border-neutral-200 text-xs text-neutral-500 italic">
                      #{tag}
                    </span>
                  ))}
                </div>
                <a 
                  href="https://www.enjo.co.jp/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 px-8 py-4 border border-neutral-800 text-neutral-800 rounded-full hover:bg-neutral-800 hover:text-white transition-all font-medium"
                >
                  日本ENJO公式サイト <ChevronRight size={18} />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="schedule" className="relative py-32 px-6 bg-neutral-900 text-white overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-6 mb-16">
            <h2 className="text-5xl md:text-7xl font-serif italic">Schedule</h2>
            <div className="h-[1px] flex-grow bg-white/20" />
          </div>
          
          <div className="space-y-0">
            {Array.isArray(schedule) && schedule.map((item, idx) => (
              item && (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group flex flex-col md:flex-row md:items-center justify-between py-10 border-b border-white/10 hover:bg-white/5 transition-colors px-4"
                >
                  <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-8 mb-4 md:mb-0">
                    <span className="text-sakura-pink font-serif text-xl whitespace-nowrap">{item.date}</span>
                    <div>
                      <h3 className="text-2xl font-serif">{item.event}</h3>
                      {item.time_range && (
                        <div className="flex items-center gap-2 text-neutral-400 text-xs mt-1 uppercase tracking-widest">
                          <Clock size={12} />
                          {item.time_range}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400 text-sm uppercase tracking-widest">
                    <MapPin size={14} />
                    {item.location}
                  </div>
                </motion.div>
              )
            ))}
          </div>
        </div>
        
        {/* Decorative Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-serif italic opacity-[0.02] pointer-events-none whitespace-nowrap">
          Event Info
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
          <div>
            <h2 className="text-6xl font-serif mb-12">Contact</h2>
            <p className="text-xl text-neutral-600 mb-16 leading-relaxed font-serif italic">
              ご予約やお問い合わせ、実演販売のご依頼など、<br />
              お気軽にご連絡ください。
            </p>
            
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400">
                  <Mail size={24} />
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">Email</span>
                  <a href="mailto:kenkazu1105@icloud.com" className="text-lg hover:text-sakura-deep transition-colors">kenkazu1105@icloud.com</a>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1">Official LINE</span>
                  <a href="https://line.me/ti/p/5f7sYjFlKG?_gl=1*1jdhff9*_gcl_au*NjU0MDI2NDY3LjE3NzU0Njg1NzE.*_ga*MjE0NzIwNDIyMS4xNzc1NDY4NTcx*_ga_0PV16Y9CZG*czE3NzU1MjMzOTYkbzMkZzEkdDE3NzU1MjM0NzEkajYwJGwwJGgw" target="_blank" rel="noopener noreferrer" className="text-lg hover:text-sakura-deep transition-colors">LINEでのお問い合わせ</a>
                </div>
              </div>
            </div>
            
            <div className="mt-16 flex gap-6">
              <a href="https://www.instagram.com/kenkazu1105/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-sakura-pink hover:text-white transition-all">
                <Instagram size={20} />
              </a>
              <a href="https://line.me/ti/p/5f7sYjFlKG?_gl=1*1jdhff9*_gcl_au*NjU0MDI2NDY3LjE3NzU0Njg1NzE.*_ga*MjE0NzIwNDIyMS4xNzc1NDY4NTcx*_ga_0PV16Y9CZG*czE3NzU1MjMzOTYkbzMkZzEkdDE3NzU1MjM0NzEkajYwJGwwJGgw" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-sakura-pink hover:text-white transition-all">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-sakura-pink/5 border border-sakura-pink/10"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-0 py-3 border-b border-neutral-200 focus:border-sakura-deep outline-none transition-colors bg-transparent" 
                    placeholder="お名前" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-0 py-3 border-b border-neutral-200 focus:border-sakura-deep outline-none transition-colors bg-transparent" 
                    placeholder="メールアドレス" 
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Subject</label>
                <select 
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-0 py-3 border-b border-neutral-200 focus:border-sakura-deep outline-none transition-colors bg-transparent appearance-none"
                >
                  <option>YOSAのご予約について</option>
                  <option>エンヨーLIFEについて</option>
                  <option>実演販売・出店依頼</option>
                  <option>その他</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4} 
                  className="w-full px-0 py-3 border-b border-neutral-200 focus:border-sakura-deep outline-none transition-colors bg-transparent resize-none" 
                  placeholder="メッセージ内容"
                  required
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full py-5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors font-medium tracking-widest uppercase text-xs"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-neutral-100 text-center">
        <div className="max-w-7xl mx-auto">
          <p className="font-serif italic text-neutral-400 text-sm">
            &copy; 2026 Diamond Sweet Pea. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
