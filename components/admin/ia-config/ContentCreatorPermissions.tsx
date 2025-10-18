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
    checkUserPermissions();
  }, []);

  const checkUserPermissions = async () => {
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

      // Verificar todos los permisos de una vez
      const permissionsToCheck = [
        PERMISSIONS.CONTENT_AI_VIEW,
        PERMISSIONS.CONTENT_AI_CREATE_BLOG,
        PERMISSIONS.CONTENT_AI_CREATE_DOCS,
        PERMISSIONS.CONTENT_AI_EDIT_INDICATORS,
        PERMISSIONS.CONTENT_AI_TRANSLATE,
        PERMISSIONS.CONTENT_AI_IMAGES,
        PERMISSIONS.CONTENT_AI_PUBLISH_AUTO,
      ];

      const results = await checkPermissions(user.email!, permissionsToCheck);

      const finalPermissions = {
        canView: results[PERMISSIONS.CONTENT_AI_VIEW] || false,
        canCreateBlog: results[PERMISSIONS.CONTENT_AI_CREATE_BLOG] || false,
        canCreateDocs: results[PERMISSIONS.CONTENT_AI_CREATE_DOCS] || false,
        canEditIndicators: results[PERMISSIONS.CONTENT_AI_EDIT_INDICATORS] || false,
        canTranslate: results[PERMISSIONS.CONTENT_AI_TRANSLATE] || false,
        canGenerateImages: results[PERMISSIONS.CONTENT_AI_IMAGES] || false,
        canPublishAuto: results[PERMISSIONS.CONTENT_AI_PUBLISH_AUTO] || false,
      };

      console.log('🎯 Final permissions:', finalPermissions);

      setPermissions(finalPermissions);
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async (email: string, permissions: string[]): Promise<Record<string, boolean>> => {
    try {
      console.log(`🔍 Checking permissions for user ${email}:`, permissions);
      
      const response = await fetch('/api/admin/check-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          permissions
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.warn(`❌ Error checking permissions:`, error);
        return {};
      }

      const { permissions: result } = await response.json();
      console.log(`✅ Permissions result:`, result);
      
      return result;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {};
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
