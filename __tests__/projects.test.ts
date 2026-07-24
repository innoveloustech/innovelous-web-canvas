import fs from 'fs';
import path from 'path';

// Load env variables from .env.local before anything else
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        if (key && process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
    }
  }
} catch (e) {
  console.error('Error loading env variables:', e);
}

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { supabase } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import ProjectsPage from '@/app/projects/page';
import AdminDashboardPortal from '@/app/admin/page';

// ----------------------------------------------------
// Mock `@/lib/supabase` at the top level
// ----------------------------------------------------
vi.mock('@/lib/supabase', () => {
  const mockThenable = (val: unknown) => Promise.resolve(val);
  return {
    supabase: {
      from: vi.fn(() => {
        const chain: Record<string, unknown> = {};
        const methods = ['select', 'insert', 'update', 'delete', 'eq', 'order', 'ilike'];
        for (const m of methods) {
          chain[m] = vi.fn(() => chain);
        }
        chain.single = vi.fn(() => mockThenable({ data: null, error: null }));
        return chain;
      }),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
      functions: {
        invoke: vi.fn().mockResolvedValue({ data: { success: true, message: 'ok' }, error: null }),
      },
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn(),
          getPublicUrl: vi.fn(() => ({
            data: { publicUrl: 'https://example.com/image.png' },
          })),
          remove: vi.fn(),
        })),
      },
    },
  };
});

// ----------------------------------------------------
// Mock SiteSettingsProvider context hooks
// ----------------------------------------------------
vi.mock('@/components/SiteSettingsProvider', () => ({
  useSiteSettings: () => ({
    id: 1,
    email: 'info@innovelous.com',
    phone: '+92 333 2186309',
    office_location: 'Pakistan',
    office_address: 'DHA Phase 2 (Extension), Karachi',
    facebook_url: 'https://www.facebook.com/innoveloustech',
    github_url: 'https://github.com/innoveloustech',
    instagram_url: 'https://www.instagram.com/innoveloustech',
    whatsapp_url: 'https://wa.me/923349251936',
    logo_url: '/logo.png',
    favicon_url: '/favicon.ico',
    og_image_url: '/og-image.jpg',
    show_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }),
  useTestimonials: () => [],
  useFaqs: () => [],
  default: ({ children }: { children: React.ReactNode }) => children,
}));

// ----------------------------------------------------
// Mock @/lib/site-settings layout helpers
// ----------------------------------------------------
vi.mock('@/lib/site-settings', async () => {
  const actual = await vi.importActual<typeof import('@/lib/site-settings')>('@/lib/site-settings');
  return {
    ...actual,
    getFaqDefaultClass: (i: number) => ["md:col-span-2 md:row-span-1", "md:col-span-1 md:row-span-1", "md:col-span-1 md:row-span-2", "md:col-span-2 md:row-span-1"][i] ?? "",
    getFaqExpandedClass: () => "md:col-span-3 md:row-span-2",
  };
});

// ----------------------------------------------------
// Mock GSAP and ScrollTrigger to prevent layout errors
// ----------------------------------------------------
vi.mock('gsap', () => {
  const dummyFn = vi.fn().mockReturnThis();
  const dummyTimeline = vi.fn(() => ({
    to: dummyFn,
    fromTo: dummyFn,
  }));
  return {
    default: {
      from: dummyFn,
      to: dummyFn,
      fromTo: dummyFn,
      timeline: dummyTimeline,
      registerPlugin: vi.fn(),
      ticker: {
        add: vi.fn(),
        remove: vi.fn(),
        lagSmoothing: vi.fn(),
      },
    },
    gsap: {
      from: dummyFn,
      to: dummyFn,
      fromTo: dummyFn,
      timeline: dummyTimeline,
      registerPlugin: vi.fn(),
      ticker: {
        add: vi.fn(),
        remove: vi.fn(),
        lagSmoothing: vi.fn(),
      },
    },
  };
});

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    update: vi.fn(),
  },
}));

vi.mock('@gsap/react', () => ({
  useGSAP: (fn: () => void, config?: { dependencies?: unknown[] }) => {
    const deps = config?.dependencies || [];
    React.useEffect(fn, deps);
  },
}));

// ----------------------------------------------------
// Mock Next.js & UI components to isolate behavior tests
// ----------------------------------------------------
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => React.createElement('a', { href }, children),
}));

vi.mock('@/components/canvas-background', () => ({
  default: () => React.createElement('div', { 'data-testid': 'canvas-background' }),
}));

vi.mock('@/components/MouseFollower', () => ({
  default: () => React.createElement('div', { 'data-testid': 'mouse-follower' }),
}));

vi.mock('@/components/navbar', () => ({
  default: () => React.createElement('div', { 'data-testid': 'navbar' }),
}));

vi.mock('@/components/whatsapp-button', () => ({
  default: () => React.createElement('div', { 'data-testid': 'whatsapp-button' }),
}));

vi.mock('@/lib/lenis-provider', () => ({
  useLenis: () => ({
    stop: vi.fn(),
    start: vi.fn(),
  }),
}));

// ----------------------------------------------------
// Mock dnd-kit modules to bypass drag and drop requirements
// ----------------------------------------------------
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children?: React.ReactNode }) => React.createElement('div', { 'data-testid': 'dnd-context' }, children),
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children?: React.ReactNode }) => React.createElement('div', { 'data-testid': 'sortable-context' }, children),
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  verticalListSortingStrategy: {},
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ''),
    },
  },
}));

type MockQueryBuilder = ReturnType<typeof supabase.from>;
type MockAuthSessionResponse = Awaited<ReturnType<typeof supabase.auth.getSession>>;
type MockAuthTokenResponse = Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>;

// ----------------------------------------------------
// ProjectsPage Component Tests
// ------------------------------------
describe('ProjectsPage Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the loading state initially', () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnValue(new Promise(() => {})), // Never resolves
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    } as unknown as MockQueryBuilder);

    render(React.createElement(ProjectsPage));
    expect(screen.getByText('Loading Projects...')).toBeInTheDocument();
  });

  it('should render projects on successful data fetch', async () => {
    const mockProjects = [
      { id: 1, title: 'Project One', category: 'Web Development', description: 'Web Desc', link: 'https://one.com', image_url: 'https://one.com/img.png', color: '#a855f7', is_featured: false, sort_order: 0 },
      { id: 2, title: 'Project Two', category: 'Mobile Development', description: 'Mobile Desc', link: 'https://two.com', image_url: 'https://two.com/img.png', color: '#a855f7', is_featured: true, sort_order: 1 },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockProjects, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    } as unknown as MockQueryBuilder);

    render(React.createElement(ProjectsPage));

    await waitFor(() => {
      expect(screen.queryByText('Loading Projects...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
  });

  it('should render empty state when no projects are returned', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    } as unknown as MockQueryBuilder);

    render(React.createElement(ProjectsPage));

    await waitFor(() => {
      expect(screen.queryByText('Loading Projects...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/No Projects Available/i)).toBeInTheDocument();
  });

  it('should render error state when database sync fails', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database query failed' } }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    } as unknown as MockQueryBuilder);

    render(React.createElement(ProjectsPage));

    await waitFor(() => {
      expect(screen.queryByText('Loading Projects...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Database Sync Exception')).toBeInTheDocument();
  });
});

// ----------------------------------------------------
// AdminDashboardPortal Component Tests
// ----------------------------------------------------
describe('AdminDashboardPortal Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should enforce auth gate when session is null', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as unknown as MockAuthSessionResponse);

    render(React.createElement(AdminDashboardPortal));

    await waitFor(() => {
      expect(screen.getByText('Internal Access Authorization')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Identifier Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Key Verification Token')).toBeInTheDocument();
    });
  });

  it('should process login submission correctly', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as unknown as MockAuthSessionResponse);

    const signInMock = vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: {} },
      error: null,
    } as unknown as MockAuthTokenResponse);

    render(React.createElement(AdminDashboardPortal));

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText('Identifier Email'), 'admin@innovelous.com');
    await user.type(screen.getByPlaceholderText('Key Verification Token'), 'secretpassword');
    await user.click(screen.getByRole('button', { name: /Connect Workspace/i }));

    expect(signInMock).toHaveBeenCalledWith({
      email: 'admin@innovelous.com',
      password: 'secretpassword',
    });
  });

  it('should block create submission and show warning alert when image asset is missing', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: 'admin-id' } } },
      error: null,
    } as unknown as MockAuthSessionResponse);

    const insertMock = vi.fn().mockResolvedValue({ data: null, error: null });
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: insertMock,
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    } as unknown as MockQueryBuilder);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(React.createElement(AdminDashboardPortal));

    await waitFor(() => {
      expect(screen.getByText('Welcome back, Admin')).toBeInTheDocument();
    });

    // Navigate to Projects tab
    const user = userEvent.setup();
    await user.click(screen.getByText('Projects'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create Object/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Create Object/i }));

    expect(screen.getByText('Initialize Data Object')).toBeInTheDocument();

    const nameInput = screen.getByText('Project Name').closest('div')?.querySelector('input');
    const descInput = screen.getByText('Description Context').closest('div')?.querySelector('textarea');
    expect(nameInput).not.toBeNull();
    expect(descInput).not.toBeNull();

    await user.type(nameInput!, 'New Dynamic Project');
    await user.type(descInput!, 'Dynamic Project Description');

    const form = screen.getByText('Initialize Data Object').closest('div')?.querySelector('form');
    expect(form).not.toBeNull();
    
    // Direct submit form event triggers form handler asynchronously
    fireEvent.submit(form!);

    // Wait for the async alert message to be called
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('An image asset file is required for initial project creations.');
    });
    expect(insertMock).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  it('should debounce query filter input by 300ms', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: { id: 'admin-id' } } },
      error: null,
    } as unknown as MockAuthSessionResponse);

    const mockProjects = [
      { id: 1, title: 'React Web Canvas', category: 'Web Development', description: 'desc', link: '', image_url: '', color: '#111', is_featured: false, sort_order: 0 },
      { id: 2, title: 'Vue Dashboard Tool', category: 'Web Development', description: 'desc', link: '', image_url: '', color: '#222', is_featured: false, sort_order: 1 },
    ];

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockProjects, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    } as unknown as MockQueryBuilder);

    render(React.createElement(AdminDashboardPortal));

    // Wait for dashboard then navigate to Projects tab
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Admin')).toBeInTheDocument();
    });
    const user = userEvent.setup();
    await user.click(screen.getByText('Projects'));

    // 1. Wait for projects to load with real timers
    await waitFor(() => {
      expect(screen.getByText('React Web Canvas')).toBeInTheDocument();
      expect(screen.getByText('Vue Dashboard Tool')).toBeInTheDocument();
    });

    // 2. Enable fake timers ONLY after initial wait is resolved
    vi.useFakeTimers();

    const searchInput = screen.getByPlaceholderText('Search projects by title, category, or description...');

    // 3. Update search input
    fireEvent.change(searchInput, { target: { value: 'React' } });

    // 4. Verify both remain visible before debounce fires
    expect(screen.getByText('React Web Canvas')).toBeInTheDocument();
    expect(screen.getByText('Vue Dashboard Tool')).toBeInTheDocument();

    // 5. Advance timers by 300ms inside act() to flush the state update
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // 6. Verify Vue project is filtered out
    expect(screen.getByText('React Web Canvas')).toBeInTheDocument();
    expect(screen.queryByText('Vue Dashboard Tool')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});

// ----------------------------------------------------
// Integration Test: Real DB CRUD & Cleanup
// ----------------------------------------------------
describe('Integration Test: Real DB CRUD & Cleanup', () => {
  let realSupabase: SupabaseClient;
  let testProjectTitle: string;
  const hasPassword = !!(process.env.PASSWORD);

  beforeAll(async () => {
    // Dynamically fetch the actual unmocked client instance
    const actualModule = await vi.importActual<typeof import('@/lib/supabase')>('@/lib/supabase');
    realSupabase = actualModule.supabase;
  });

  beforeEach(() => {
    testProjectTitle = `TEST_PROJECT_${Date.now()}`;
  });

  afterEach(async () => {
    try {
      if (realSupabase) {
        await realSupabase.from('projects_new').delete().ilike('title', 'TEST_PROJECT_%');
      }
    } catch (err) {
      console.error('Integration Test Cleanup Error:', err);
    }
  });

  // Verify that Row-Level Security (RLS) restricts unauthenticated inserts on the real database
  it('should enforce RLS and reject insert for unauthenticated users', async () => {
    // Only call signOut if there is an active session to save network calls
    const { data: { session } } = await realSupabase.auth.getSession();
    if (session) {
      await realSupabase.auth.signOut();
    }

    const testProject = {
      title: testProjectTitle,
      category: 'Web Development',
      description: 'Automated RLS validation integration test project.',
      link: 'https://innovelous.com',
      image_url: 'https://example.com/mock-asset.png',
      color: '#8b5cf6',
      is_featured: false,
      sort_order: 9999,
    };

    const { data, error } = await realSupabase
      .from('projects_new')
      .insert([testProject])
      .select();

    expect(data).toBeNull();
    expect(error).not.toBeNull();
    // 42501 PostgreSQL error code for policy violations / permission errors
    expect(error!.code).toBe('42501');
  }, 20000); // 20 seconds timeout to prevent transient network timeout failures

  // RLS test: Verify unauthenticated SELECT is allowed on site_settings
  it('should allow unauthenticated SELECT on site_settings', async () => {
    const { data: { session } } = await realSupabase.auth.getSession();
    if (session) {
      await realSupabase.auth.signOut();
    }
    const { data, error } = await realSupabase.from('site_settings').select('*').eq('id', 1).single();
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.id).toBe(1);
  }, 15000);

  // RLS test: Verify unauthenticated UPDATE silently affects 0 rows
  it('should enforce RLS and silently block unauthenticated UPDATE on site_settings (0 rows affected)', async () => {
    const { data: { session } } = await realSupabase.auth.getSession();
    if (session) {
      await realSupabase.auth.signOut();
    }
    // Record original value
    const { data: before } = await realSupabase.from('site_settings').select('email').eq('id', 1).single();
    const originalEmail = before!.email;
    // Attempt unauthenticated update
    const { error } = await realSupabase.from('site_settings').update({ email: 'hacker@evil.com' }).eq('id', 1);
    expect(error).toBeNull(); // RLS silently blocks, no error thrown
    // Verify value is unchanged
    const { data: after } = await realSupabase.from('site_settings').select('email').eq('id', 1).single();
    expect(after!.email).toBe(originalEmail);
  }, 15000);

  // RLS test: Verify unauthenticated SELECT is allowed on testimonials
  it('should allow unauthenticated SELECT on testimonials', async () => {
    const { data: { session } } = await realSupabase.auth.getSession();
    if (session) {
      await realSupabase.auth.signOut();
    }
    const { data, error } = await realSupabase.from('testimonials').select('*').order('sort_order', { ascending: true });
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(4);
  }, 15000);

  // RLS test: Verify unauthenticated UPDATE silently affects 0 rows on testimonials
  it('should enforce RLS and silently block unauthenticated UPDATE on testimonials (0 rows affected)', async () => {
    const { data: { session } } = await realSupabase.auth.getSession();
    if (session) {
      await realSupabase.auth.signOut();
    }
    const { data: before } = await realSupabase.from('testimonials').select('text').eq('id', 1).single();
    const originalText = before!.text;
    const { error } = await realSupabase.from('testimonials').update({ text: 'HACKED' }).eq('id', 1);
    expect(error).toBeNull();
    const { data: after } = await realSupabase.from('testimonials').select('text').eq('id', 1).single();
    expect(after!.text).toBe(originalText);
  }, 15000);

  // RLS test: Verify unauthenticated SELECT is allowed on faqs
  it('should allow unauthenticated SELECT on faqs', async () => {
    const { data: { session } } = await realSupabase.auth.getSession();
    if (session) {
      await realSupabase.auth.signOut();
    }
    const { data, error } = await realSupabase.from('faqs').select('*').order('sort_order', { ascending: true });
    expect(error).toBeNull();
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThanOrEqual(4);
  }, 15000);

  // RLS test: Verify unauthenticated UPDATE silently affects 0 rows on faqs
  it('should enforce RLS and silently block unauthenticated UPDATE on faqs (0 rows affected)', async () => {
    const { data: { session } } = await realSupabase.auth.getSession();
    if (session) {
      await realSupabase.auth.signOut();
    }
    const { data: before } = await realSupabase.from('faqs').select('question').eq('id', 1).single();
    const originalQuestion = before!.question;
    const { error } = await realSupabase.from('faqs').update({ question: 'HACKED?' }).eq('id', 1);
    expect(error).toBeNull();
    const { data: after } = await realSupabase.from('faqs').select('question').eq('id', 1).single();
    expect(after!.question).toBe(originalQuestion);
  }, 15000);

  // RLS test: Verify unauthenticated upload is rejected on storage bucket projects_new-images
  it('should enforce RLS and reject unauthenticated upload to projects_new-images bucket', async () => {
    const { data: { session } } = await realSupabase.auth.getSession();
    if (session) {
      await realSupabase.auth.signOut();
    }
    const { error } = await realSupabase.storage
      .from('projects_new-images')
      .upload(`unauthorized_test_${Date.now()}.png`, 'fake png content', {
        contentType: 'image/png',
        upsert: false,
      });
    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/row-level security|unauthorized|permission denied|forbidden|signature verification/i);
  }, 20000);

  // RLS test: Verify unauthenticated upload is rejected on storage bucket site-assets
  it('should enforce RLS and reject unauthenticated upload to site-assets bucket', async () => {
    const { data: { session } } = await realSupabase.auth.getSession();
    if (session) {
      await realSupabase.auth.signOut();
    }
    const { error } = await realSupabase.storage
      .from('site-assets')
      .upload(`unauthorized_test_${Date.now()}.png`, 'fake png content', {
        contentType: 'image/png',
        upsert: false,
      });
    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/row-level security|unauthorized|permission denied|forbidden|signature verification/i);
  }, 20000);

  // Skip the authenticated integration test block dynamically if password is not configured
  it.skipIf(!hasPassword)('should safely execute INSERT and UPDATE actions against the database when authenticated, then purge data', async () => {
    // Authenticate using env variables
    const email = 'admin@innovelous.com';
    const password = process.env.PASSWORD || '';
    const { error: signInError } = await realSupabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      throw new Error(`Authentication failed for integration test: ${signInError.message}`);
    }

    try {
      const testProject = {
        title: testProjectTitle,
        category: 'Web Development',
        description: 'Automated integration test object representation.',
        link: 'https://innovelous.com',
        image_url: 'https://example.com/mock-asset.png',
        color: '#8b5cf6',
        is_featured: false,
        sort_order: 9999,
      };

      // 1. Insert data row
      const { data: insertData, error: insertError } = await realSupabase
        .from('projects_new')
        .insert([testProject])
        .select();

      expect(insertError).toBeNull();
      expect(insertData).not.toBeNull();
      expect(insertData!.length).toBe(1);
      expect(insertData![0].title).toBe(testProjectTitle);

      const insertedId = insertData![0].id;

      // 2. Modify value updates
      const updatedTitle = `${testProjectTitle}_UPDATED`;
      const { data: updateData, error: updateError } = await realSupabase
        .from('projects_new')
        .update({ title: updatedTitle })
        .eq('id', insertedId)
        .select();

      expect(updateError).toBeNull();
      expect(updateData).not.toBeNull();
      expect(updateData!.length).toBe(1);
      expect(updateData![0].title).toBe(updatedTitle);
    } finally {
      // Double check cleanup is run for this specific test case immediately
      await realSupabase.from('projects_new').delete().ilike('title', 'TEST_PROJECT_%');
      
      // Restore clean state
      const { data: { session } } = await realSupabase.auth.getSession();
      if (session) {
        await realSupabase.auth.signOut();
      }
    }
  }, 20000); // 20 seconds timeout to prevent transient network timeout failures
});
