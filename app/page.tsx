'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, ExternalLink, Globe, Moon, Sun } from 'lucide-react'

interface Bookmark {
  id: string
  name: string
  url: string
  icon?: string
}

export default function HomePage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    icon: ''
  })

  // 加载书签数据
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('navigation-bookmarks')
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks))
    }
    
    const savedDarkMode = localStorage.getItem('dark-mode')
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
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

  // 添加书签
  const handleAddBookmark = () => {
    if (formData.name && formData.url) {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        name: formData.name,
        url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
        icon: formData.icon
      }
      saveBookmarks([...bookmarks, newBookmark])
      setFormData({ name: '', url: '', icon: '' })
      setShowAddForm(false)
    }
  }

  // 编辑书签
  const handleEditBookmark = () => {
    if (editingBookmark && formData.name && formData.url) {
      const updatedBookmarks = bookmarks.map(bookmark =>
        bookmark.id === editingBookmark.id
          ? {
              ...bookmark,
              name: formData.name,
              url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
              icon: formData.icon
            }
          : bookmark
      )
      saveBookmarks(updatedBookmarks)
      setEditingBookmark(null)
      setFormData({ name: '', url: '', icon: '' })
    }
  }

  // 删除书签
  const handleDeleteBookmark = (id: string) => {
    if (confirm('确定要删除这个书签吗？')) {
      saveBookmarks(bookmarks.filter(bookmark => bookmark.id !== id))
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            我的导航页面
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors shadow-md"
            >
              <Plus size={20} />
              添加网站
            </button>
          </div>
        </div>

        {/* 添加/编辑表单 */}
        {showAddForm && (
          <div className="glass p-6 mb-8 animate-slide-up">
            <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {editingBookmark ? '编辑网站' : '添加新网站'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="网站名称"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="text"
                placeholder="网站地址 (例: github.com)"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                }`}
              />
              <input
                type="text"
                placeholder="图标URL (可选)"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={cancelOperation}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                取消
              </button>
              <button
                onClick={editingBookmark ? handleEditBookmark : handleAddBookmark}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {editingBookmark ? '保存' : '添加'}
              </button>
            </div>
          </div>
        )}

        {/* 书签网格 */}
        {bookmarks.length === 0 ? (
          <div className={`text-center py-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <Globe size={64} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-medium mb-2">还没有添加任何网站</h3>
            <p>点击"添加网站"按钮来添加您的第一个网站</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className={`glass p-4 group hover:scale-105 transition-transform duration-200 animate-fade-in ${
                  darkMode ? 'hover:bg-gray-800/30' : 'hover:bg-white/40'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      {getFavicon(bookmark.url, bookmark.icon) ? (
                        <img
                          src={getFavicon(bookmark.url, bookmark.icon)!}
                          alt={bookmark.name}
                          className="w-8 h-8 rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            target.nextElementSibling!.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <Globe 
                        size={20} 
                        className={`${getFavicon(bookmark.url, bookmark.icon) ? 'hidden' : ''} ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} 
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => startEdit(bookmark)}
                        className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded text-xs"
                        title="编辑"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs"
                        title="删除"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-medium text-sm mb-2 hover:underline flex items-center gap-1 ${
                      darkMode ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {bookmark.name}
                    <ExternalLink size={12} />
                  </a>
                  <p className={`text-xs opacity-70 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {new URL(bookmark.url).hostname}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}