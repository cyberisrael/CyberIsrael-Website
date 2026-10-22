import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FaDiscord, FaWhatsapp, FaInstagram, FaTiktok, FaEnvelope, FaGoogleDrive } from 'react-icons/fa'
import Logo from '@/components/ui/Logo'
import { useTheme } from '@/context/ThemeContext'
import { socialLinks } from '@/services/socialLinks'
import { navLinks } from '@/services/navLinks'

const socialItems = [
  { icon: FaDiscord, href: socialLinks.discord, label: 'Discord', color: '#5865F2' },
  { icon: FaWhatsapp, href: socialLinks.whatsapp, label: 'WhatsApp', color: '#25D366' },
  { icon: FaGoogleDrive, href: socialLinks.drive, label: 'Drive', color: '#A855F7' },
  { icon: FaInstagram, href: socialLinks.instagram, label: 'Instagram', color: '#E1306C' },
  { icon: FaTiktok, href: socialLinks.tiktok, label: 'TikTok', color: '#FF0050' },
  { icon: FaEnvelope, href: socialLinks.email, label: 'Email', color: '#00D4FF' },
]

const Footer: React.FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()

  return (
    <footer className={`relative z-10 border-t ${theme === 'dark' ? 'border-cyber-border/40 bg-cyber-black/90' : 'border-light-border bg-white/90'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo size={48} />
            <p className={`mt-4 text-sm max-w-xs leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-light-muted'
              }`}>
              {t('footer.tagline')}
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {socialItems.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`p-2.5 rounded-lg border transition-all duration-200 group ${theme === 'dark'
                    ? 'border-cyber-border/50 text-slate-400 hover:border-transparent'
                    : 'border-light-border text-light-muted hover:border-transparent'
                    }`}
                  style={{
                    ['--hover-color' as string]: color,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = color
                    el.style.boxShadow = `0 0 15px ${color}40`
                    el.style.borderColor = `${color}40`
                    el.style.background = `${color}10`
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = ''
                    el.style.boxShadow = ''
                    el.style.borderColor = ''
                    el.style.background = ''
                  }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={`font-display text-xs tracking-widest uppercase mb-4 ${theme === 'dark' ? 'text-cyber-teal' : 'text-light-teal'
              }`}>
              {t('footer.links')}
            </h3>
            <ul className="space-y-2">
              {navLinks.map(({ to, labelKey }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`text-sm transition-colors duration-200 ${theme === 'dark'
                      ? 'text-slate-400 hover:text-cyber-green'
                      : 'text-light-muted hover:text-light-blue'
                      }`}
                  >
                    {t(labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className={`font-display text-xs tracking-widest uppercase mb-4 ${theme === 'dark' ? 'text-cyber-teal' : 'text-light-teal'
              }`}>
              {t('footer.community')}
            </h3>
            <ul className="space-y-2">
              {socialItems.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm transition-colors duration-200 ${theme === 'dark'
                      ? 'text-slate-400 hover:text-cyber-green'
                      : 'text-light-muted hover:text-light-blue'
                      }`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={`mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'border-cyber-border/40' : 'border-light-border'
          }`}>
          <p className={`text-xs font-display tracking-wide ${theme === 'dark' ? 'text-slate-500' : 'text-light-muted'
            }`}>
            {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4">
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
