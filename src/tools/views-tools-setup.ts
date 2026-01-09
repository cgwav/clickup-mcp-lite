import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ViewsEnhancedClient } from '../clickup-client/views-enhanced.js';
import {
  GetViewsFilterSchema,
  ViewTypeSchema,
  ViewAccessSchema
} from '../schemas/views-schemas.js';

// Create clients
const viewsClient = new ViewsEnhancedClient(process.env.CLICKUP_API_TOKEN!);

export function setupViewsTools(server: McpServer): void {

  // ========================================
  // LITE: Only get_views and get_view kept
  // ========================================

  server.tool(
    'clickup_get_views',
    'Get all views for a space, folder, or list with optional filtering by type and access level.',
    {
      parent_id: z.string().min(1).describe('The ID of the parent (space, folder, or list)'),
      parent_type: z.enum(['space', 'folder', 'list']).describe('The type of parent container'),
      type: ViewTypeSchema.optional().describe('Filter views by type'),
      access: ViewAccessSchema.optional().describe('Filter views by access level')
    },
    async (args) => {
      try {
        const filter = GetViewsFilterSchema.parse(args);
        const result = await viewsClient.getViews(filter);

        return {
          content: [{
            type: 'text',
            text: `Views for ${args.parent_type} ${args.parent_id}:\n\n${JSON.stringify(result, null, 2)}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error getting views: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'clickup_get_view',
    'Get detailed information about a specific view by its ID.',
    {
      view_id: z.string().min(1).describe('The ID of the view to get')
    },
    async (args) => {
      try {
        const result = await viewsClient.getView(args.view_id);

        return {
          content: [{
            type: 'text',
            text: `View details:\n\n${JSON.stringify(result, null, 2)}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error getting view: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  // LITE: The following tools are disabled in lite version:
  // - clickup_create_view
  // - clickup_update_view
  // - clickup_delete_view
  // - clickup_set_view_filters
  // - clickup_set_view_grouping
  // - clickup_set_view_sorting
  // - clickup_update_view_settings
  // - clickup_get_view_tasks
  // - clickup_duplicate_view
  // - clickup_update_view_sharing
  // - clickup_get_view_fields
}
