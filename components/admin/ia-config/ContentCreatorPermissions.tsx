'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

// Constantes de permisos para evitar importar utils/admin/permissions
const PERMISSIONS = {
  CONTENT_AI_VIEW: 'content.ai.view',
  CONTENT_AI_CREATE_BLOG: 'content.ai.create_blog',
  CONTENT_AI_CREATE_DOCS: 'content.ai.create_docs',
  CONTENT_AI_EDIT_INDICATORS: 'content.ai.edit_indicators',
  CONTENT_AI_TRANSLATE: 'content.ai.translate',
  CONTENT_AI_IMAGES: 'content.ai.images',
  CONTENT_AI_PUBLISH_AUTO: 'content.ai.publish_auto',
} as const;

interface ContentCreatorPermissions {
  canView: boolean;
  canCreateBlog: boolean;
  canCreateDocs: boolean;
  canEditIndicators: boolean;
  canTranslate: boolean;
  canGenerateImages: boolean;
  canPublishAuto: boolean;
}

interface Props {
  children: (permissions: ContentCreatorPermissions) => React.ReactNode;
}

export default function ContentCreatorPermissions({ children }: Props) {
  const [permissions, setPermissions] = useState<ContentCreatorPermissions>({
    canView: false,
    canCreateBlog: false,
    canCreateDocs: false,
    canEditIndicators: false,
    canTranslate: false,
    canGenerateImages: false,
    canPublishAuto: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      console.log('🚀 Starting permission check...');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      console.log('👤 Authenticated user:', user);

      if (!user) {
        console.log('❌ No authenticated user found');
        setLoading(false);
        return;
      }

      console.log('📧 User email:', user.email);

      // Verificar cada permiso individualmente
      const [
        canView,
        canCreateBlog,
        canCreateDocs,
        canEditIndicators,
        canTranslate,
        canGenerateImages,
        canPublishAuto,
      ] = await Promise.all([
        checkPermission(user.email!, PERMISSIONS.CONTENT_AI_VIEW),
        checkPermission(user.email!, PERMISSIONS.CONTENT_AI_CREATE_BLOG),
        checkPermission(user.email!, PERMISSIONS.CONTENT_AI_CREATE_DOCS),
        checkPermission(user.email!, PERMISSIONS.CONTENT_AI_EDIT_INDICATORS),
        checkPermission(user.email!, PERMISSIONS.CONTENT_AI_TRANSLATE),
        checkPermission(user.email!, PERMISSIONS.CONTENT_AI_IMAGES),
        checkPermission(user.email!, PERMISSIONS.CONTENT_AI_PUBLISH_AUTO),
      ]);

      const finalPermissions = {
        canView,
        canCreateBlog,
        canCreateDocs,
        canEditIndicators,
        canTranslate,
        canGenerateImages,
        canPublishAuto,
      };

      console.log('🎯 Final permissions:', finalPermissions);

      setPermissions(finalPermissions);
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async (email: string, permission: string): Promise<boolean> => {
    try {
      console.log(`🔍 Checking permission ${permission} for user ${email}`);
      const supabase = createClient();
      
      const { data: admin, error } = await (supabase as any)
        .from('admin_users')
        .select(`
          id,
          status,
          role_id,
          admin_roles!inner (
            slug,
            permissions
          )
        `)
        .eq('email', email)
        .eq('status', 'active')
        .single();

      console.log(`📊 Query result for ${email}:`, { admin, error });

      if (error || !admin) {
        console.warn(`❌ Admin user not found or error: ${email}`, error?.message);
        return false;
      }

      console.log(`👤 Admin found:`, {
        id: admin.id,
        status: admin.status,
        role_slug: admin.admin_roles?.slug,
        permissions: admin.admin_roles?.permissions
      });

      // Super Admin tiene todos los permisos
      if (admin.admin_roles?.slug === 'super-admin') {
        console.log(`✅ Super Admin detected - granting all permissions`);
        return true;
      }

      // Verificar permiso específico
      const userPermissions = admin.admin_roles?.permissions || {};
      const hasPermission = userPermissions[permission] === true;
      
      console.log(`🔐 Permission check: ${permission} = ${hasPermission}`, {
        userPermissions,
        requestedPermission: permission
      });
      
      if (!hasPermission) {
        console.warn(`⚠️ Permission denied for user ${email}: ${permission}`);
      }
      
      return hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apidevs-primary"></div>
      </div>
    );
  }

  return <>{children(permissions)}</>;
}
