import { NextResponse } from 'next/server';
import { supabase, toUUID } from '@/lib/supabase';
import { resources } from '@/data/resources';
import { noticeTemplates } from '@/data/notice-templates';

export async function GET() {
  try {
    // 1. Resources Seeding
    const formattedResources = resources.map((r) => ({
      id: toUUID(r.id),
      title: r.title,
      slug: r.id, // 간단하게 id를 slug로 대용
      category: r.category,
      description: r.description,
      content: r.content,
      preview_text: r.content.substring(0, 100) + '...',
      tags: r.tags,
      is_free: r.isFree,
      price: r.price,
      file_url: `/files/${r.id}.zip`, // 임시 다운로드 파일
      thumbnail_url: null,
      status: 'published',
      created_at: new Date(r.createdAt).toISOString()
    }));

    // 기존 데이터 충돌 방지를 위해 upsert 수행
    const { error: resError } = await supabase
      .from('resources')
      .upsert(formattedResources, { onConflict: 'id' });

    if (resError) throw resError;

    // 2. Notice Templates Seeding
    const formattedTemplates = noticeTemplates.map((t, idx) => ({
      // templates는 id가 string 숫자 형식이 아니므로 MD5 해시나 순차 임시 UUID 사용
      id: `22222222-2222-2222-2222-${String(idx + 1).padStart(12, '0')}`,
      title: t.title,
      situation: t.situation,
      target: t.target,
      tone: t.tone,
      short_version: t.shortVersion,
      kakao_version: t.kakaoVersion,
      detail_version: t.detailVersion,
      remind_version: t.remindVersion,
      is_active: t.isActive
    }));

    const { error: tempError } = await supabase
      .from('templates')
      .upsert(formattedTemplates, { onConflict: 'id' });

    if (tempError) throw tempError;

    return NextResponse.json({
      success: true,
      message: `성공적으로 ${resources.length}개의 리소스와 ${noticeTemplates.length}개의 템플릿을 데이터베이스에 동기화(upsert)했습니다.`
    });
  } catch (err: any) {
    console.error('시딩 중 에러 발생:', err);
    return NextResponse.json({
      success: false,
      error: err.message || '데이터베이스 시딩에 실패했습니다.'
    }, { status: 500 });
  }
}
