# Hierarchical Category System Migration Guide

This document provides step-by-step instructions for migrating from the flat category system to a hierarchical (Main Category → Sub-Category) system for projects.

## Overview

**Status**: ✅ **COMPLETED** - Migration executed successfully on production database

**What Changed:**
- Migrated from flat `category` text field to hierarchical `main_category_id` → `sub_category_id` foreign keys
- Added two new tables: `main_categories` and `sub_categories`
- All 3 existing projects migrated to "Uncategorized" category
- Old `category` text column preserved for admin reference during re-categorization

## Pre-Migration Checklist

- [x] ✅ Database backup created (`backup.sql`)
- [x] ✅ Migration scripts tested locally
- [x] ✅ Production database schema verified

## Migration Summary (Already Completed)

### Step 1: Database Backup ✅
**Status**: Completed
- Backup file: `backup.sql`
- Backup date: [Date of migration]

### Step 2: Schema Migration ✅
**Status**: Completed - All tables and policies created successfully

**Tables Created:**
1. `main_categories` (id=1: "Uncategorized")
2. `sub_categories` (id=1: "Uncategorized")
3. Added `main_category_id` and `sub_category_id` columns to `projects_new`

**Verification Query:**
```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('main_categories', 'sub_categories');

-- Verify projects_new has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects_new' 
AND column_name IN ('main_category_id', 'sub_category_id');
```

### Step 3: Data Migration ✅
**Status**: Completed - All 3 projects migrated to "Uncategorized"

**Projects Migrated:**
1. Project ID 1: "test" (was "Web Development")
2. Project ID 20: "Second Project updated" (was "Web Development")  
3. Project ID 21: "testing" (was "AI Integration")

**Verification Query:**
```sql
-- Verify all projects have category assignments
SELECT 
  p.id,
  p.title,
  p.category as old_category,
  mc.name as main_category_name,
  sc.name as sub_category_name
FROM projects_new p
LEFT JOIN main_categories mc ON p.main_category_id = mc.id
LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
ORDER BY p.sort_order;
```

### Step 4: Code Deployment ✅
**Status**: Completed

**Files Modified:**
- ✅ Database schema: `supabase/migrations/20260816000000_init.sql`
- ✅ TypeScript types: `lib/types/categories.ts`
- ✅ Admin components: `components/admin/CategoriesTab.tsx`, `components/admin/ProjectsTab.tsx`
- ✅ Admin navigation: `components/admin/AdminSidebar.tsx`, `app/admin/page.tsx`
- ✅ Public pages: `app/projects/page.tsx`, `app/page.tsx`

## Post-Migration Tasks

### For Administrators

#### 1. Create Main Categories
Navigate to **Admin Dashboard → Categories Tab** and create main categories:

**Suggested Categories:**
- Hardware
- Software
- Design
- AI/ML

**Steps:**
1. Click "Add Main Category"
2. Enter category name (max 50 characters)
3. Choose a color (used for visual display)
4. Set sort order (lower numbers appear first)
5. Click "Create"

#### 2. Create Sub-Categories
For each main category, create relevant sub-categories:

**Example for "Software" Main Category:**
- Web Development
- Mobile Development
- Backend Services
- DevOps

**Steps:**
1. Click "Add Sub-Category"
2. Select parent main category
3. Enter sub-category name (max 50 characters)
4. Choose a color
5. Set sort order within parent
6. Click "Create"

#### 3. Re-Categorize Existing Projects
Navigate to **Admin Dashboard → Projects Tab**:

1. Click "Modify" on each project
2. You'll see the old category displayed as "Legacy: [category name]"
3. Select appropriate Main Category from first dropdown
4. Select appropriate Sub-Category from second dropdown (filtered by main category)
5. Click "Save Structural Shift"

**Current Projects to Re-Categorize:**
- ✅ Project "test" - Currently in Uncategorized
- ✅ Project "Second Project updated" - Currently in Uncategorized
- ✅ Project "testing" - Currently in Uncategorized

#### 4. Verify Public Pages
After re-categorizing projects:
1. Visit `/projects` page
2. Test category filter dropdown
3. Verify projects display with correct "Main → Sub" category format
4. Check homepage featured projects show correct categories

## Features Available

### Admin Dashboard

**Categories Tab** (New)
- Create, edit, and delete main categories
- Create, edit, and delete sub-categories  
- Drag-and-drop reordering within each level
- Color picker for visual customization
- Dependency checking (prevents deletion if categories have projects assigned)

**Projects Tab** (Updated)
- Cascading category dropdowns (Main → Sub)
- Visual display of hierarchical categories
- Legacy category indicator for unmigrated projects
- Search works across both category levels

### Public Pages

**Projects Page** (`/projects`)
- Category filter dropdown (All + Main Categories)
- Projects display with "Main → Sub" format
- Clear filter button
- Project count indicator

**Homepage** (`/`)
- Featured projects show hierarchical categories
- Category colors from main category

## Rollback Procedure

**⚠️ Important**: Only execute if critical issues discovered

### 1. Restore Database Backup
```bash
# Using Supabase CLI
supabase db reset

# Or restore from backup.sql file
psql -h [host] -U [user] -d [database] < backup.sql
```

### 2. Revert Code Changes
```bash
git revert [commit-hash]
```

### 3. Verify Rollback
```sql
-- Verify old schema is restored
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'projects_new' 
AND column_name = 'category';

-- Should return 'category' column
```

## Troubleshooting

### Issue: Projects not showing on public page
**Solution**: Check browser console for errors. Verify all projects have valid category assignments.

### Issue: Cannot delete category
**Solution**: This is expected behavior. Reassign or delete all projects using that category first.

### Issue: Dropdown shows no sub-categories
**Solution**: Ensure you've selected a main category first. Sub-categories filter based on main category selection.

### Issue: Old category field showing in admin
**Solution**: This is intentional during migration. The old category field helps admins see what category projects had before migration.

## Database Schema Reference

### main_categories Table
```sql
id               bigint (PK, auto-increment)
name             text (unique, max 50 chars)
color            text (hex color, default '#a855f7')
sort_order       integer (default 0)
created_at       timestamptz (default now())
```

### sub_categories Table
```sql
id               bigint (PK, auto-increment)
main_category_id bigint (FK to main_categories, ON DELETE RESTRICT)
name             text (max 50 chars)
color            text (hex color, default '#a855f7')
sort_order       integer (default 0)
created_at       timestamptz (default now())
UNIQUE(main_category_id, name)
```

### projects_new Table (Updated Columns)
```sql
-- New columns
main_category_id bigint (FK to main_categories, ON DELETE RESTRICT, indexed)
sub_category_id  bigint (FK to sub_categories, ON DELETE RESTRICT, indexed)

-- Preserved column (for reference during migration)
category         text (old flat category)
```

## Performance Considerations

- ✅ Indexes created on foreign key columns for optimal query performance
- ✅ RLS policies configured for security (public read, authenticated write)
- ✅ Queries use joins instead of N+1 queries

## Security Notes

- All category tables have Row Level Security (RLS) enabled
- Public users can read categories
- Only authenticated users (admins) can create, update, or delete categories
- Category deletion blocked if dependencies exist (prevents orphaned projects)

## Support & Questions

For questions or issues:
1. Check the troubleshooting section above
2. Verify database state with provided SQL queries
3. Review browser console for client-side errors
4. Check Supabase logs for server-side issues

## Migration Checklist Summary

- [x] Database backup created
- [x] main_categories table created with RLS
- [x] sub_categories table created with RLS
- [x] projects_new table updated with foreign keys
- [x] Default "Uncategorized" category created
- [x] Existing projects migrated
- [x] Local migration file updated
- [x] TypeScript types created
- [x] CategoriesTab component created
- [x] Admin sidebar updated
- [x] ProjectsTab updated with cascading dropdowns
- [x] Public projects page updated
- [x] Homepage updated
- [ ] Admin re-categorizes all projects (ongoing)
- [ ] Monitor for any issues (ongoing)

---

**Migration Date**: [Insert actual migration date]
**Migrated By**: [Insert name]
**Database**: Production Supabase (project ref: lwxsuhmbreawotqdvwnt)
**Status**: ✅ Successfully Deployed
