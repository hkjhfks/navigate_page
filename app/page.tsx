'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, ExternalLink, Globe, Moon, Sun, Sparkles, Star, Zap } from 'lucide-react'

interface Bookmark {
  id: string
  name: string
  url: string
  icon?: string
  gradient?: string
}

// Gradient palette (stable order)
const GRADIENTS = [
  'from-purple-400 via-pink-500 to-red-500',
  'from-green-400 via-blue-500 to-purple-600', 
  'from-yellow-400 via-orange-500 to-red-500',
  'from-blue-400 via-purple-500 to-pink-500',
  'from-indigo-400 via-purple-500 to-pink-500',
  'from-pink-400 via-red-500 to-yellow-500'
]

const hashId = (id: string) =>
  Array.from(id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)

const pickGradientById = (id: string) => GRADIENTS[hashId(id) % GRADIENTS.length]

const ensureGradient = (b: Bookmark): Bookmark => (
  b.gradient ? b : { ...b, gradient: pickGradientById(b.id) }
)

const safeGetHostname = (rawUrl: string): string => {
  try {
    return new URL(rawUrl).hostname
  } catch {
    return ''
  }
}

const normalizeUrl = (raw: string): string | null => {
  const input = raw.trim()
  if (!input) return null
  const accept = (u: URL) => (u.protocol === 'http:' || u.protocol === 'https:')
  try {
    const u = new URL(input)
    if (accept(u)) return u.toString()
  } catch {}
  try {
    const u2 = new URL(`https://${input}`)
    if (accept(u2)) return u2.toString()
  } catch {}
  return null
}

export default function HomePage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('dark-mode')
    return saved ? JSON.parse(saved) : false
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const particlesRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    icon: ''
  })

  // 初始化背景粒子效果
  useEffect(() => {
    const createParticle = () => {
      if (!particlesRef.current) return
      
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.left = Math.random() * 100 + '%'
      particle.style.width = Math.random() * 6 + 2 + 'px'
      particle.style.height = particle.style.width
      particle.style.animationDelay = Math.random() * 20 + 's'
      particle.style.animationDuration = (Math.random() * 10 + 15) + 's'
      
      particlesRef.current.appendChild(particle)
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      }, 25000)
    }
    
    const interval = setInterval(createParticle, 3000)
    
    // 初始创建几个粒子
    for (let i = 0; i < 5; i++) {
      setTimeout(createParticle, i * 1000)
    }
    
    return () => clearInterval(interval)
  }, [])

  // 加载书签数据（移除人为延时，并为旧数据补全渐变）
  useEffect(() => {
    const saved = localStorage.getItem('navigation-bookmarks')
    if (saved) {
      const parsed: Bookmark[] = JSON.parse(saved)
      const withGrad = parsed.map(ensureGradient)
      setBookmarks(withGrad)
      if (withGrad.some((b, i) => !parsed[i].gradient)) {
        localStorage.setItem('navigation-bookmarks', JSON.stringify(withGrad))
      }
    }
    setIsLoading(false)
  }, [])

  // 保存书签数据
  const saveBookmarks = (newBookmarks: Bookmark[]) => {
    setBookmarks(newBookmarks)
    localStorage.setItem('navigation-bookmarks', JSON.stringify(newBookmarks))
  }

  // 切换主题
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('dark-mode', JSON.stringify(newDarkMode))
    
    // 添加主题切换动画
    document.body.style.transition = 'all 0.5s ease'
  }

  // 获取网站图标
  const getFavicon = (url: string, customIcon?: string) => {
    if (customIcon) return customIcon
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return null
    }
  }

  // 添加书签（带 URL 校验与稳定渐变）
  const handleAddBookmark = () => {
    if (!formData.name || !formData.url) return
    const normalized = normalizeUrl(formData.url)
    if (!normalized) {
      alert('请输入合法的网址（仅支持 http/https）')
      return
    }
    const newBookmark: Bookmark = ensureGradient({
      id: Date.now().toString(),
      name: formData.name.trim(),
      url: normalized,
      icon: formData.icon.trim() || undefined,
    })
    saveBookmarks([...bookmarks, newBookmark])
    setFormData({ name: '', url: '', icon: '' })
    setShowAddForm(false)
  }

  // 编辑书签（带 URL 校验，保留原有渐变）
  const handleEditBookmark = () => {
    if (!editingBookmark || !formData.name || !formData.url) return
    const normalized = normalizeUrl(formData.url)
    if (!normalized) {
      alert('请输入合法的网址（仅支持 http/https）')
      return
    }
  const updatedBookmarks = bookmarks.map((bookmark: Bookmark) =>
      bookmark.id === editingBookmark.id
        ? {
            ...bookmark,
            name: formData.name.trim(),
            url: normalized,
            icon: formData.icon.trim() || undefined,
          }
        : bookmark
    )
    saveBookmarks(updatedBookmarks)
    setEditingBookmark(null)
    setFormData({ name: '', url: '', icon: '' })
  }

  // 删除书签
  const handleDeleteBookmark = (id: string) => {
    if (confirm('确定要删除这个书签吗？')) {
      saveBookmarks(bookmarks.filter((bookmark: Bookmark) => bookmark.id !== id))
    }
  }

  // 开始编辑
  const startEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark)
    setFormData({
      name: bookmark.name,
      url: bookmark.url,
      icon: bookmark.icon || ''
    })
    setShowAddForm(true)
  }

  // 取消操作
  const cancelOperation = () => {
    setShowAddForm(false)
    setEditingBookmark(null)
    setFormData({ name: '', url: '', icon: '' })
  }

  // 过滤书签
  const filteredBookmarks = bookmarks.filter((bookmark: Bookmark) =>
    bookmark.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bookmark.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 渐变颜色已通过 ensureGradient 保持稳定

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        <div className="text-center animate-bounce-in">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            正在加载您的导航页面...
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-500 relative overflow-hidden ${darkMode ? 'dark bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50'}`}>
      {/* 背景粒子效果 */}
      <div ref={particlesRef} className="bg-particles"></div>
      
      {/* 背景装饰 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className={`absolute top-10 right-10 w-64 h-64 rounded-full opacity-20 animate-pulse-slow ${darkMode ? 'bg-purple-500' : 'bg-gradient-to-r from-purple-400 to-pink-400'}`}></div>
        <div className={`absolute bottom-20 left-10 w-48 h-48 rounded-full opacity-20 animate-wave ${darkMode ? 'bg-blue-500' : 'bg-gradient-to-r from-blue-400 to-cyan-400'}`}></div>
        <div className={`absolute top-1/2 left-1/3 w-32 h-32 rounded-full opacity-10 animate-bounce ${darkMode ? 'bg-pink-500' : 'bg-gradient-to-r from-pink-400 to-red-400'}`}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* 头部 */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center lg:text-left">
            <h1 className={`text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent animate-wave ${
              darkMode 
                ? 'from-white via-purple-200 to-pink-200' 
                : 'from-gray-800 via-purple-600 to-pink-600'
            }`}>
              <Sparkles className="inline-block mr-3 text-yellow-400 animate-pulse" size={40} />
              我的导航页面
              <Star className="inline-block ml-3 text-blue-400 animate-bounce" size={32} />
            </h1>
            <p className={`text-lg opacity-80 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              打造专属于你的精美导航体验
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <input
                type="text"
                placeholder="搜索网站..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all ${
                  darkMode 
                    ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm' 
                    : 'bg-white/70 border-gray-200 backdrop-blur-sm'
                }`}
              />
              <Globe className={`absolute left-3 top-2.5 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
            
            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? '切换为浅色模式' : '切换为深色模式'}
              className={`p-3 rounded-xl transition-all duration-300 backdrop-blur-sm transform hover:scale-110 ${
                darkMode 
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 shadow-lg shadow-yellow-500/25' 
                  : 'bg-purple-500/20 text-purple-600 hover:bg-purple-500/30 shadow-lg shadow-purple-500/25'
              }`}
            >
              {darkMode ? <Sun size={20} className="animate-rotate-slow" /> : <Moon size={20} className="animate-pulse" />}
            </button>
            
            <button
              onClick={() => setShowAddForm(true)}
              aria-label="添加网站"
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm ${
                darkMode
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25 hover:shadow-purple-500/40'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40'
              }`}
            >
              <Plus size={20} className="animate-pulse" />
              添加网站
              <Zap size={16} className="animate-bounce" />
            </button>
          </div>
        </div>

        {/* 添加/编辑表单 */}
        {showAddForm && (
          <div className="glass p-8 mb-12 animate-slide-up backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${editingBookmark ? 'bg-orange-500/20 text-orange-500' : 'bg-green-500/20 text-green-500'}`}>
                {editingBookmark ? <Edit size={20} /> : <Plus size={20} />}
              </div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {editingBookmark ? '✨ 编辑网站' : '🚀 添加新网站'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="网站名称"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all backdrop-blur-sm ${
                    darkMode 
                      ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white/70 border-gray-200'
                  }`}
                />
                <Star className={`absolute right-3 top-3.5 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="网站地址 (例: github.com)"
                  value={formData.url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, url: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all backdrop-blur-sm ${
                    darkMode 
                      ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white/70 border-gray-200'
                  }`}
                />
                <Globe className={`absolute right-3 top-3.5 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="图标URL (可选)"
                  value={formData.icon}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, icon: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all backdrop-blur-sm ${
                    darkMode 
                      ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white/70 border-gray-200'
                  }`}
                />
                <Sparkles className={`absolute right-3 top-3.5 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={cancelOperation}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  darkMode 
                    ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 backdrop-blur-sm' 
                    : 'bg-gray-200/70 text-gray-600 hover:bg-gray-300/70 backdrop-blur-sm'
                }`}
              >
                取消
              </button>
              <button
                onClick={editingBookmark ? handleEditBookmark : handleAddBookmark}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm ${
                  darkMode
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25 hover:shadow-purple-500/40'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40'
                }`}
              >
                {editingBookmark ? '💾 保存' : '✨ 添加'}
              </button>
            </div>
          </div>
        )}

        {/* 书签网格 */}
        {filteredBookmarks.length === 0 ? (
          <div className="text-center py-20">
            {bookmarks.length === 0 ? (
              <div className="animate-bounce-in">
                <div className={`mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm`}>
                  <Globe size={48} className={`animate-pulse ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  🌟 开始您的导航之旅
                </h3>
                <p className={`text-lg mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  点击"添加网站"按钮来添加您的第一个网站
                </p>
                <div className="flex justify-center gap-4 text-sm opacity-60">
                  <span>💡 支持自定义图标</span>
                  <span>🔍 智能搜索功能</span>
                  <span>🎨 精美动画效果</span>
                </div>
              </div>
            ) : (
              <div className="animate-bounce-in">
                <div className={`mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm`}>
                  <Globe size={48} className={`animate-pulse ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  🔍 没有找到匹配的网站
                </h3>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  尝试修改搜索关键词
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
            {filteredBookmarks.map((bookmark: Bookmark, index: number) => {
              const gradient = bookmark.gradient ?? pickGradientById(bookmark.id)
              const favicon = getFavicon(bookmark.url, bookmark.icon)
              const host = safeGetHostname(bookmark.url)
              return (
                <div
                  key={bookmark.id}
                  className={`glass bookmark-card p-6 group transition-all duration-500 animate-fade-in backdrop-blur-xl`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col items-center text-center relative">
                    <div className="relative mb-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                        darkMode ? 'bg-gradient-to-br from-gray-700 to-gray-800' : `bg-gradient-to-br ${gradient}`
                      } shadow-lg group-hover:shadow-2xl`}>
                        {favicon ? (
                          <img
                            src={favicon}
                            alt={bookmark.name}
                            className="w-10 h-10 rounded-lg transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.nextElementSibling!.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <Globe 
                          size={24} 
                          className={`${favicon ? 'hidden' : 'animate-pulse'} text-white`}
                        />
                      </div>
                      
                      {/* 悬浮操作按钮 */}
                      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(bookmark)}
                            aria-label={`编辑 ${bookmark.name}`}
                            className="bg-blue-500/90 hover:bg-blue-500 text-white p-1.5 rounded-lg text-xs backdrop-blur-sm transition-all duration-300 transform hover:scale-110 shadow-lg"
                            title="编辑"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteBookmark(bookmark.id)}
                            aria-label={`删除 ${bookmark.name}`}
                            className="bg-red-500/90 hover:bg-red-500 text-white p-1.5 rounded-lg text-xs backdrop-blur-sm transition-all duration-300 transform hover:scale-110 shadow-lg"
                            title="删除"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      
                      {/* 装饰性光环 */}
                      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 bg-gradient-to-r ${gradient} blur-xl`}></div>
                    </div>
                    
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`font-semibold text-sm mb-2 hover:underline flex items-center gap-1 transition-colors duration-300 group-hover:scale-105 ${
                        darkMode ? 'text-white group-hover:text-blue-300' : 'text-gray-800 group-hover:text-blue-600'
                      }`}
                    >
                      <span className="line-clamp-2">{bookmark.name}</span>
                      <ExternalLink size={12} className="flex-shrink-0 opacity-60 group-hover:opacity-100" />
                    </a>
                    
                    {host && (
                      <p className={`text-xs opacity-60 group-hover:opacity-80 transition-opacity duration-300 truncate w-full ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {host}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {/* 底部装饰 */}
        {filteredBookmarks.length > 0 && (
          <div className="text-center mt-16 py-8">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full backdrop-blur-sm ${
              darkMode 
                ? 'bg-white/5 text-gray-300 border border-white/10' 
                : 'bg-white/50 text-gray-600 border border-white/20'
            }`}>
              <Star className="animate-pulse" size={16} />
              <span className="font-medium">共收藏了 {bookmarks.length} 个精彩网站</span>
              <Sparkles className="animate-bounce" size={16} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}