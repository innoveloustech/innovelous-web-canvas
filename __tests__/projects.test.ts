import { describe, it, expect, vi, beforeEach } from 'vitest';

// Track auth state for RLS simulation
let isAuthenticated = false;

// Mock the supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://example.com/image.png' },
        })),
        list: vi.fn(),
        remove: vi.fn(),
      })),
    },
    rpc: vi.fn(),
  },
}));

// Helper to simulate RLS policy enforcement
// In Supabase, RLS policies are enforced at the database level.
// When a policy rejects an operation, Supabase returns a 401/403 error.
function rlsRejectError(operation: string) {
  return {
    data: null,
    error: {
      code: '42501',
      message: `new row violates row-level security policy for "${operation}"`,
      details: `RLS policy violation: ${operation} operation rejected for unauthenticated user`,
      hint: null,
    },
  };
}

function rlsAllowResult(data: any) {
  return { data, error: null };
}

// Simulate a SELECT RLS policy check - public can always read
function simulateSelectRLS(): Promise<{ data: any; error: any }> {
  // Public users can SELECT (policy: USING (true))
  return Promise.resolve(rlsAllowResult([]));
}

// Simulate an INSERT RLS policy check - only authenticated users
function simulateInsertRLS(record: any): Promise<{ data: any; error: any }> {
  if (isAuthenticated) {
    return Promise.resolve(rlsAllowResult({ id: 1, ...record }));
  }
  // Policy: WITH CHECK (auth.role() = 'authenticated')
  return Promise.resolve(rlsRejectError('INSERT'));
}

// Simulate an UPDATE RLS policy check - only authenticated users
function simulateUpdateRLS(id: number, updates: any): Promise<{ data: any; error: any }> {
  if (isAuthenticated) {
    return Promise.resolve(rlsAllowResult({ id, ...updates }));
  }
  // Policy: USING (auth.role() = 'authenticated')
  return Promise.resolve(rlsRejectError('UPDATE'));
}

// Simulate a DELETE RLS policy check - only authenticated users
function simulateDeleteRLS(id: number): Promise<{ data: any; error: any }> {
  if (isAuthenticated) {
    return Promise.resolve(rlsAllowResult(null));
  }
  // Policy: USING (auth.role() = 'authenticated')
  return Promise.resolve(rlsRejectError('DELETE'));
}

// Simulate storage bucket RLS
function simulateStorageSelectRLS(): Promise<{ data: any; error: any }> {
  // Public can view images (policy: USING (bucket_id = 'projects_new-images'))
  return Promise.resolve(rlsAllowResult([]));
}

function simulateStorageUploadRLS(path: string, file: File): Promise<{ error: any }> {
  if (isAuthenticated) {
    return Promise.resolve({ error: null });
  }
  // Policy: WITH CHECK (bucket_id = 'projects_new-images' AND auth.role() = 'authenticated')
  return Promise.resolve({ error: { message: 'Row-level security policy violation: only authenticated users can upload', statusCode: '42501' } });
}

import { supabase } from '@/lib/supabase';

describe('Projects Database Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Fetching Projects', () => {
    it('should fetch all projects ordered by sort_order ascending', async () => {
      const mockProjects = [
        { id: 1, title: 'Project A', sort_order: 0, is_featured: false },
        { id: 2, title: 'Project B', sort_order: 1, is_featured: true },
        { id: 3, title: 'Project C', sort_order: 2, is_featured: false },
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockProjects, error: null });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as any) = mockFrom;

      const { data, error } = await supabase
        .from('projects_new')
        .select('*')
        .order('sort_order', { ascending: true });

      expect(mockFrom).toHaveBeenCalledWith('projects_new');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('sort_order', { ascending: true });
      expect(data).toEqual(mockProjects);
      expect(error).toBeNull();
    });

    it('should fetch only featured projects', async () => {
      const mockFeaturedProjects = [
        { id: 2, title: 'Project B', sort_order: 1, is_featured: true },
        { id: 5, title: 'Project E', sort_order: 4, is_featured: true },
      ];

      const mockOrder = vi.fn().mockResolvedValue({ data: mockFeaturedProjects, error: null });
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as any) = mockFrom;

      const { data, error } = await supabase
        .from('projects_new')
        .select('*')
        .eq('is_featured', true)
        .order('sort_order', { ascending: true });

      expect(mockFrom).toHaveBeenCalledWith('projects_new');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('is_featured', true);
      expect(mockOrder).toHaveBeenCalledWith('sort_order', { ascending: true });
      expect(data).toEqual(mockFeaturedProjects);
      expect(error).toBeNull();
    });

    it('should handle empty projects list', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as any) = mockFrom;

      const { data, error } = await supabase
        .from('projects_new')
        .select('*')
        .order('sort_order', { ascending: true });

      expect(data).toEqual([]);
      expect(error).toBeNull();
    });

    it('should handle database connection error', async () => {
      const mockError = new Error('Database connection failed');
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError });
      const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
      (supabase.from as any) = mockFrom;

      const { data, error } = await supabase
        .from('projects_new')
        .select('*')
        .order('sort_order', { ascending: true });

      expect(data).toBeNull();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('Database connection failed');
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new project', async () => {
      const newProject = {
        title: 'New Project',
        category: 'Web Development',
        description: 'A test project',
        link: 'https://example.com',
        color: '#a855f7',
        image_url: 'https://example.com/image.png',
        is_featured: true,
        sort_order: 0,
      };

      const mockInsert = vi.fn().mockResolvedValue({ data: { id: 1, ...newProject }, error: null });
      const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
      (supabase.from as any) = mockFrom;

      const { data, error } = await supabase.from('projects_new').insert([newProject]);

      expect(mockFrom).toHaveBeenCalledWith('projects_new');
      expect(mockInsert).toHaveBeenCalledWith([newProject]);
      expect(data).toEqual({ id: 1, ...newProject });
      expect(error).toBeNull();
    });

    it('should update an existing project', async () => {
      const updateData = {
        title: 'Updated Title',
        is_featured: true,
        sort_order: 5,
      };

      const mockEq = vi.fn().mockResolvedValue({ data: { id: 1, ...updateData }, error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });
      (supabase.from as any) = mockFrom;

      const { data, error } = await supabase
        .from('projects_new')
        .update(updateData)
        .eq('id', 1);

      expect(mockFrom).toHaveBeenCalledWith('projects_new');
      expect(mockUpdate).toHaveBeenCalledWith(updateData);
      expect(mockEq).toHaveBeenCalledWith('id', 1);
      expect(data).toEqual({ id: 1, ...updateData });
      expect(error).toBeNull();
    });

    it('should delete a project', async () => {
      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete });
      (supabase.from as any) = mockFrom;

      const { data, error } = await supabase.from('projects_new').delete().eq('id', 1);

      expect(mockFrom).toHaveBeenCalledWith('projects_new');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 1);
      expect(data).toBeNull();
      expect(error).toBeNull();
    });
  });

  describe('Sort Order Management', () => {
    it('should batch update sort_order on reorder', async () => {
      const reorderedProjects = [
        { id: 3, sort_order: 0 },
        { id: 1, sort_order: 1 },
        { id: 2, sort_order: 2 },
      ];

      const mockEq = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });
      (supabase.from as any) = mockFrom;

      // Simulate batch update
      const updates = reorderedProjects.map((p) =>
        supabase.from('projects_new').update({ sort_order: p.sort_order }).eq('id', p.id)
      );
      await Promise.all(updates);

      expect(mockFrom).toHaveBeenCalledTimes(3);
      expect(mockUpdate).toHaveBeenCalledTimes(3);
      expect(mockEq).toHaveBeenCalledTimes(3);

      // Verify each project was updated with correct sort_order
      reorderedProjects.forEach((p, i) => {
        expect(mockUpdate.mock.calls[i][0]).toEqual({ sort_order: p.sort_order });
        expect(mockEq.mock.calls[i][0]).toBe('id');
        expect(mockEq.mock.calls[i][1]).toBe(p.id);
      });
    });
  });

  describe('Image Upload', () => {
    it('should upload an image to storage bucket', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockUpload = vi.fn().mockResolvedValue({ error: null });
      const mockGetPublicUrl = vi.fn(() => ({
        data: { publicUrl: 'https://example.com/storage/test.png' },
      }));
      const mockStorageFrom = vi.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }));
      (supabase.storage.from as any) = mockStorageFrom;

      const path = `portfolio-assets/test.png`;
      const { error: uploadError } = await supabase.storage.from('projects_new-images').upload(path, mockFile);
      const { data: { publicUrl } } = supabase.storage.from('projects_new-images').getPublicUrl(path);

      expect(mockStorageFrom).toHaveBeenCalledWith('projects_new-images');
      expect(mockUpload).toHaveBeenCalledWith(path, mockFile);
      expect(uploadError).toBeNull();
      expect(publicUrl).toBe('https://example.com/storage/test.png');
    });
  });

  describe('RLS Policy Enforcement', () => {
    describe('Table: projects_new', () => {
      it('should allow SELECT for unauthenticated users (public read policy)', async () => {
        isAuthenticated = false;
        const result = await simulateSelectRLS();
        expect(result.error).toBeNull();
        expect(result.data).toEqual([]);
      });

      it('should allow SELECT for authenticated users (public read policy)', async () => {
        isAuthenticated = true;
        const result = await simulateSelectRLS();
        expect(result.error).toBeNull();
        expect(result.data).toEqual([]);
      });

      it('should reject INSERT for unauthenticated users', async () => {
        isAuthenticated = false;
        const result = await simulateInsertRLS({
          title: 'Unauthorized Project',
          category: 'Web Development',
          description: 'Should be rejected',
        });
        expect(result.data).toBeNull();
        expect(result.error).not.toBeNull();
        expect(result.error.code).toBe('42501');
        expect(result.error.message).toContain('row-level security policy');
        expect(result.error.message).toContain('INSERT');
      });

      it('should allow INSERT for authenticated users', async () => {
        isAuthenticated = true;
        const newProject = {
          title: 'Authorized Project',
          category: 'AI Integration',
          description: 'Should be allowed',
          is_featured: true,
          sort_order: 0,
        };
        const result = await simulateInsertRLS(newProject);
        expect(result.error).toBeNull();
        expect(result.data).not.toBeNull();
        expect(result.data.id).toBe(1);
        expect(result.data.title).toBe('Authorized Project');
      });

      it('should reject UPDATE for unauthenticated users', async () => {
        isAuthenticated = false;
        const result = await simulateUpdateRLS(1, { title: 'Hacked Title' });
        expect(result.data).toBeNull();
        expect(result.error).not.toBeNull();
        expect(result.error.code).toBe('42501');
        expect(result.error.message).toContain('row-level security policy');
        expect(result.error.message).toContain('UPDATE');
      });

      it('should allow UPDATE for authenticated users', async () => {
        isAuthenticated = true;
        const result = await simulateUpdateRLS(1, { title: 'Updated Title', is_featured: false });
        expect(result.error).toBeNull();
        expect(result.data).not.toBeNull();
        expect(result.data.id).toBe(1);
        expect(result.data.title).toBe('Updated Title');
      });

      it('should reject DELETE for unauthenticated users', async () => {
        isAuthenticated = false;
        const result = await simulateDeleteRLS(1);
        expect(result.data).toBeNull();
        expect(result.error).not.toBeNull();
        expect(result.error.code).toBe('42501');
        expect(result.error.message).toContain('row-level security policy');
        expect(result.error.message).toContain('DELETE');
      });

      it('should allow DELETE for authenticated users', async () => {
        isAuthenticated = true;
        const result = await simulateDeleteRLS(1);
        expect(result.error).toBeNull();
        expect(result.data).toBeNull(); // delete returns null data on success
      });
    });

    describe('Storage Bucket: projects_new-images', () => {
      it('should allow viewing images for unauthenticated users (public read)', async () => {
        isAuthenticated = false;
        const result = await simulateStorageSelectRLS();
        expect(result.error).toBeNull();
        expect(result.data).toEqual([]);
      });

      it('should reject image upload for unauthenticated users', async () => {
        isAuthenticated = false;
        const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
        const result = await simulateStorageUploadRLS('portfolio-assets/test.png', mockFile);
        expect(result.error).not.toBeNull();
        expect(result.error.statusCode).toBe('42501');
        expect(result.error.message).toContain('only authenticated users can upload');
      });

      it('should allow image upload for authenticated users', async () => {
        isAuthenticated = true;
        const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
        const result = await simulateStorageUploadRLS('portfolio-assets/test.png', mockFile);
        expect(result.error).toBeNull();
      });
    });
  });
});
