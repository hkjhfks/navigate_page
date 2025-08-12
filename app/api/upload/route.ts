import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'

const MAX_SIZE = 1_000_000 // 1MB
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

export async function POST(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: '未配置存储凭证' }, { status: 501 })
    }
    const formData = await request.formData()
    const file = formData.get('file') as unknown as File | null
    if (!file) return NextResponse.json({ error: '缺少文件' }, { status: 400 })

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: '仅支持 PNG/JPEG/WEBP/GIF' }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '文件过大，最大 1MB' }, { status: 400 })
    }

    const safe = (file.name || 'icon').replace(/[^a-zA-Z0-9_.-]/g, '_')
    const key = `icons/${Date.now()}-${safe}`
    const blob = await put(key, file, { access: 'public', addRandomSuffix: false })
    return NextResponse.json({ url: blob.url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || '上传失败' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: '未配置存储凭证' }, { status: 501 })
    }
    const body = await request.json().catch(() => null) as { url?: string } | null
    const url = body?.url
    if (!url) return NextResponse.json({ error: '缺少 URL' }, { status: 400 })
    await del(url)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || '删除失败' }, { status: 500 })
  }
}
