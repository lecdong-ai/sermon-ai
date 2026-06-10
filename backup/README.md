# Supabase Database Backup
Date: Wed Jun 10 10:35:29 KST 2026

## Tables
| Table | Records |
|-------|---------|
| user_profiles | 3 |
| user_usage | 1 |
| subscriptions | 1 |
| sermons | 18 |
| usage_logs | 4 |
| payment_history | 1 |
| study_guides | 4 |
| sermon_notes | 0 |
| sermon_outlines | 0 |
| sermon_manuscripts | 0 |
| deleted_users | 6 |

## Restore 방법
1. Supabase Dashboard → Table Editor → 각 테이블 선택
2. Import → JSON 파일 업로드
3. 또는 SQL Editor에서 INSERT 문 실행

## Environment Variables
- NEXT_PUBLIC_SUPABASE_URL=https://xtknqtdidyujuamskbpo.supabase.co
- SUPABASE_SERVICE_ROLE_KEY= (.env.local 참조)
- OPENAI_API_KEY= (.env.local 참조)
