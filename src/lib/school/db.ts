import { supabase, toUUID, fromUUID } from './supabase';

// --------------------------------------------------
// 1. 저장한 공지문 (saved_messages)
// --------------------------------------------------
export async function getSavedNotices(userId: string) {
  try {
    const { data, error } = await supabase
      .from('saved_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((item: any) => ({
      ...item,
      createdAt: item.created_at,
      content: item.message_text
    }));
  } catch (err) {
    console.warn('getSavedNotices 실패, localStorage로 우회합니다:', err);
    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem('cs_saved_notices') || '[]');
      return list;
    }
    return [];
  }
}

export async function saveNotice(userId: string, payload: {
  title: string;
  content: string;
  situation: string;
  target: string;
  tone: string;
}) {
  try {
    const { data, error } = await supabase
      .from('saved_messages')
      .insert([
        {
          user_id: userId,
          title: payload.title,
          message_text: payload.content,
          situation: payload.situation,
          target: payload.target,
          tone: payload.tone
        }
      ])
      .select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.warn('saveNotice 실패, localStorage에 임시 저장합니다:', err);
    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem('cs_saved_notices') || '[]');
      const newNotice = {
        id: 'sn_' + Date.now(),
        title: payload.title,
        content: payload.content,
        situation: payload.situation,
        target: payload.target,
        tone: payload.tone,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('cs_saved_notices', JSON.stringify([newNotice, ...list]));
      return newNotice;
    }
    return null;
  }
}

export async function deleteSavedNotice(id: string) {
  try {
    const { error } = await supabase
      .from('saved_messages')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.warn('deleteSavedNotice 실패, localStorage에서 삭제합니다:', err);
    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem('cs_saved_notices') || '[]');
      const updated = list.filter((n: any) => n.id !== id);
      localStorage.setItem('cs_saved_notices', JSON.stringify(updated));
    }
  }
}

// --------------------------------------------------
// 2. 즐겨찾기 (favorites)
// --------------------------------------------------
export async function getFavorites(userId: string) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        resource:resources(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map((f: any) => {
      if (!f.resource) return null;
      const res = f.resource as any;
      return {
        ...res,
        id: fromUUID(res.id),
        isFree: res.is_free,
        downloadCount: res.download_count || 0,
        viewCount: res.view_count || 0,
      };
    }).filter(Boolean) || [];
  } catch (err) {
    console.warn('getFavorites 실패, localStorage 즐겨찾기로 우회합니다:', err);
    if (typeof window !== 'undefined') {
      const list = JSON.parse(localStorage.getItem('cs_bookmarks') || '[]');
      return list;
    }
    return [];
  }
}

export async function toggleFavorite(userId: string, resourceId: string) {
  try {
    const uuid = toUUID(resourceId);
    const { data: existing, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('resource_id', uuid)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      const { error: delError } = await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);
      if (delError) throw delError;
      return false;
    } else {
      const { error: insError } = await supabase
        .from('favorites')
        .insert([{ user_id: userId, resource_id: uuid }]);
      if (insError) throw insError;
      return true;
    }
  } catch (err) {
    console.warn('toggleFavorite 실패:', err);
    return false;
  }
}

// --------------------------------------------------
// 3. 최근 본 자료 (recent_views)
// --------------------------------------------------
export async function getRecentViews(userId: string) {
  try {
    const { data, error } = await supabase
      .from('recent_views')
      .select(`
        id,
        viewed_at,
        resource:resources(*)
      `)
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data?.map((rv: any) => {
      if (!rv.resource) return null;
      const res = rv.resource as any;
      return {
        id: rv.id,
        viewedAt: new Date(rv.viewed_at).toLocaleDateString(),
        ...res,
        resourceId: fromUUID(res.id),
        id_original: fromUUID(res.id),
        isFree: res.is_free,
        downloadCount: res.download_count || 0,
        viewCount: res.view_count || 0,
      };
    }).filter(Boolean) || [];
  } catch (err) {
    console.warn('getRecentViews 실패, localStorage로 우회합니다:', err);
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('cs_recent_viewed') || '[]');
    }
    return [];
  }
}

export async function addRecentView(userId: string, resourceId: string) {
  try {
    const uuid = toUUID(resourceId);
    await supabase
      .from('recent_views')
      .delete()
      .eq('user_id', userId)
      .eq('resource_id', uuid);

    const { error } = await supabase
      .from('recent_views')
      .insert([{ user_id: userId, resource_id: uuid }]);
    if (error) throw error;
  } catch (err) {
    console.warn('addRecentView 실패:', err);
  }
}

export async function removeRecentView(id: string) {
  try {
    const { error } = await supabase
      .from('recent_views')
      .delete()
      .eq('id', id);
    if (error) throw error;
  } catch (err) {
    console.warn('removeRecentView 실패, localStorage에서 삭제합니다:', err);
    if (typeof window !== 'undefined') {
      const recent = JSON.parse(localStorage.getItem('cs_recent_viewed') || '[]');
      const updated = recent.filter((r: any) => r.id !== id);
      localStorage.setItem('cs_recent_viewed', JSON.stringify(updated));
    }
  }
}

// --------------------------------------------------
// 4. 구매/소장 목록 (purchases)
// --------------------------------------------------
export async function getPurchasedResources(userId: string) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        id,
        purchased_at,
        amount,
        status,
        resource:resources(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'paid');

    if (error) throw error;
    return data?.map((p: any) => {
      if (!p.resource) return null;
      const res = p.resource as any;
      return {
        purchaseId: p.id,
        purchasedAt: new Date(p.purchased_at).toLocaleDateString(),
        amount: p.amount,
        ...res,
        id: fromUUID(res.id),
        isFree: res.is_free,
        downloadCount: res.download_count || 0,
        viewCount: res.view_count || 0,
      };
    }).filter(Boolean) || [];
  } catch (err) {
    console.warn('getPurchasedResources 실패, localStorage 구매내역으로 우회합니다:', err);
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('cs_purchased_resources') || '[]');
    }
    return [];
  }
}

export async function addPurchase(userId: string, resourceId: string, amount: number) {
  try {
    const uuid = toUUID(resourceId);
    const { data, error } = await supabase
      .from('purchases')
      .insert([
        {
          user_id: userId,
          resource_id: uuid,
          amount,
          status: 'paid'
        }
      ])
      .select();
    if (error) throw error;
    return data?.[0];
  } catch (err) {
    console.warn('addPurchase 실패:', err);
    return null;
  }
}

// --------------------------------------------------
// 6. 요금제 구독 처리 (subscriptions & plan_type update)
// --------------------------------------------------
export async function upgradeToPremium(userId: string, months: number = 1) {
  try {
    const { error: userError } = await supabase
      .from('users')
      .update({ plan_type: 'subscriber' })
      .eq('id', userId);

    if (userError) throw userError;

    const start = new Date();
    const end = new Date();
    end.setMonth(start.getMonth() + months);

    const { error: subError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          product_id: '00000000-0000-0000-0000-000000000000',
          status: 'active',
          started_at: start.toISOString(),
          ended_at: end.toISOString()
        }
      ]);

    if (subError) throw subError;
  } catch (err) {
    console.warn('upgradeToPremium 실패, localStorage 구독 상태를 업데이트합니다:', err);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cs_user_plan', 'premium');
    }
  }
}
