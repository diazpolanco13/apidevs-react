'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PERMISSIONS } from '@/utils/admin/permissions';

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
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

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
        checkPermission(user.id, PERMISSIONS.CONTENT_AI_VIEW),
        checkPermission(user.id, PERMISSIONS.CONTENT_AI_CREATE_BLOG),
        checkPermission(user.id, PERMISSIONS.CONTENT_AI_CREATE_DOCS),
        checkPermission(user.id, PERMISSIONS.CONTENT_AI_EDIT_INDICATORS),
        checkPermission(user.id, PERMISSIONS.CONTENT_AI_TRANSLATE),
        checkPermission(user.id, PERMISSIONS.CONTENT_AI_IMAGES),
        checkPermission(user.id, PERMISSIONS.CONTENT_AI_PUBLISH_AUTO),
      ]);

      setPermissions({
        canView,
        canCreateBlog,
        canCreateDocs,
        canEditIndicators,
        canTranslate,
        canGenerateImages,
        canPublishAuto,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermission = async (userId: string, permission: string): Promise<boolean> => {
    try {
      const supabase = createClient();
      
      const { data: admin, error } = await (supabase as any)
        .from('admin_users')
        .select(`
          id,
          status,
          role_id,
          admin_roles (
            slug,
            permissions
          )
        `)
        .eq('id', userId)
        .eq('status', 'active')
        .single();

      if (error || !admin) {
        return false;
      }

      // Super Admin tiene todos los permisos
      if (admin.admin_roles?.slug === 'super-admin') {
        return true;
      }

      // Verificar permiso específico
      const userPermissions = admin.admin_roles?.permissions || {};
      return userPermissions[permission] === true;
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
