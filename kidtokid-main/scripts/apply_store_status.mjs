import fs from 'fs';

// FOOTER
{
  const p = 'src/components/Footer.tsx';
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/import { doc, setDoc, Timestamp } from "firebase\/firestore"/,
      'import { doc, setDoc, Timestamp } from "firebase/firestore"\nimport { useStoreStatus } from "@/src/hooks/useStoreStatus"');

    c = c.replace(/const \[isSubscribing, setIsSubscribing\] = useState\(false\)/,
      'const [isSubscribing, setIsSubscribing] = useState(false)\n  const { isOpen } = useStoreStatus(settings.weekdayHours, settings.saturdayHours, settings.sundayHours)');

    c = c.replace(/<br \/>Dom: {settings.sundayHours}<\/span>/,
      '<br />Dom: {settings.sundayHours}</span>\n                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">\n                  <span className={w-2 h-2 rounded-full mr-1.5 }></span>\n                  {isOpen ? "Aberto Agora" : "Fechado Agora"}\n                </div>');
    fs.writeFileSync(p, c, 'utf8');
  }
}

// ABOUT PAGE
{
  const p = 'src/pages/AboutPage.tsx';
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/import { MapPin, Phone, Clock, Mail } from "lucide-react"/,
      'import { MapPin, Phone, Clock, Mail } from "lucide-react"\nimport { useStoreStatus } from "@/src/hooks/useStoreStatus"');

    c = c.replace(/export default function AboutPage\(\) \{/,
      'export default function AboutPage() {\n  const [settings, setSettings] = useState<StoreSettings>(defaultSettings)\n  const { isOpen } = useStoreStatus(settings.weekdayHours, settings.saturdayHours, settings.sundayHours)');

    // need more imports in aboutpage
    c = c.replace(/import { Header } from "@\/src\/components\/layout\/Header"/,
      'import { useState, useEffect } from "react"\nimport { getStoreSettings, type StoreSettings, defaultSettings } from "@/src/services/settingsService"\nimport { Header } from "@/src/components/layout/Header"');

    c = c.replace(/usePageTitle\("Sobre Nós"\)/,
      'usePageTitle("Sobre Nós")\n  useEffect(() => {\n    getStoreSettings().then(setSettings)\n  }, [])');

    c = c.replace(/<span className="text-gray-700 dark:text-gray-300">10:00 – 19:00<\/span>/,
      '<span className="text-gray-700 dark:text-gray-300">{settings.weekdayHours}</span>');

    c = c.replace(/<span className="text-red-500">Fechado<\/span>/g,
      '<span className="text-gray-700 dark:text-gray-300">{settings.sundayHours}</span>');

    c = c.replace(/<p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1\.5">Horário<\/p>/,
      '<p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5 flex items-center justify-between">Horário\n                    <span className={inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium }>\n                      <span className={w-1.5 h-1.5 rounded-full mr-1 }></span>\n                      {isOpen ? "Aberto Agora" : "Fechado Agora"}\n                    </span>\n                  </p>');
    fs.writeFileSync(p, c, 'utf8');
  }
}

// CONTACT PAGE
{
  const p = 'src/pages/ContactPage.tsx';
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/import { toast } from "sonner"/,
      'import { toast } from "sonner"\nimport { useStoreStatus } from "@/src/hooks/useStoreStatus"');

    c = c.replace(/const \[form, setForm\] = useState\(\{/,
      'const { isOpen } = useStoreStatus(settings.weekdayHours, settings.saturdayHours, settings.sundayHours)\n    const [form, setForm] = useState({');

    c = c.replace(/Dom: {settings.sundayHours}<\/p>/,
      'Dom: {settings.sundayHours}</p>\n                                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-xs font-medium">\n                                            <span className={w-2 h-2 rounded-full mr-1.5 }></span>\n                                            {isOpen ? "Aberto Agora" : "Fechado Agora"}\n                                        </div>');
    fs.writeFileSync(p, c, 'utf8');
  }
}

console.log("Feito.")
