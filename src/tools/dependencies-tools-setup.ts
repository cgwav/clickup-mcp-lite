import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DependenciesEnhancedClient } from '../clickup-client/dependencies-enhanced.js';
import {
  CreateDependencySchema,
  UpdateDependencySchema,
  GetDependenciesFilterSchema,
  DependencyTypeSchema,
  DependencyStatusSchema
} from '../schemas/dependencies-schemas.js';

// Create clients
const dependenciesClient = new DependenciesEnhancedClient(process.env.CLICKUP_API_TOKEN!);

export function setupDependenciesTools(server: McpServer): void {

  // ========================================
  // LITE: Only CRUD operations kept
  // ========================================

  server.tool(
    'clickup_create_dependency',
    'Create a new dependency relationship between two tasks. Dependencies define task execution order and blocking relationships.',
    {
      task_id: z.string().min(1).describe('The ID of the task that depends on another'),
      depends_on: z.string().min(1).describe('The ID of the task that this task depends on'),
      type: DependencyTypeSchema.default('blocking').describe('The type of dependency relationship'),
      link_id: z.string().optional().describe('Optional link ID for grouping related dependencies')
    },
    async (args) => {
      try {
        const request = CreateDependencySchema.parse(args);
        const result = await dependenciesClient.createDependency(request);

        return {
          content: [{
            type: 'text',
            text: `Dependency created successfully:\n\n${JSON.stringify(result, null, 2)}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error creating dependency: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'clickup_get_task_dependencies',
    'Get all dependencies for a specific task with optional filtering by type and status.',
    {
      task_id: z.string().min(1).describe('The ID of the task to get dependencies for'),
      type: DependencyTypeSchema.optional().describe('Filter by dependency type'),
      status: DependencyStatusSchema.optional().describe('Filter by dependency status'),
      include_resolved: z.boolean().default(false).describe('Whether to include resolved dependencies')
    },
    async (args) => {
      try {
        const filter = GetDependenciesFilterSchema.parse(args);
        const result = await dependenciesClient.getTaskDependencies(filter);

        return {
          content: [{
            type: 'text',
            text: `Dependencies for task ${args.task_id}:\n\n${JSON.stringify(result, null, 2)}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error getting task dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'clickup_update_dependency',
    'Update an existing dependency\'s type or status.',
    {
      dependency_id: z.string().min(1).describe('The ID of the dependency to update'),
      type: DependencyTypeSchema.optional().describe('New dependency type'),
      status: DependencyStatusSchema.optional().describe('New dependency status')
    },
    async (args) => {
      try {
        const request = UpdateDependencySchema.parse(args);
        const result = await dependenciesClient.updateDependency(request);

        return {
          content: [{
            type: 'text',
            text: `Dependency updated successfully:\n\n${JSON.stringify(result, null, 2)}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error updating dependency: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'clickup_delete_dependency',
    'Delete a dependency relationship between tasks.',
    {
      dependency_id: z.string().min(1).describe('The ID of the dependency to delete')
    },
    async (args) => {
      try {
        const result = await dependenciesClient.deleteDependency(args.dependency_id);

        return {
          content: [{
            type: 'text',
            text: `Dependency deleted successfully: ${JSON.stringify(result, null, 2)}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error deleting dependency: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  // LITE: The following tools are disabled in lite version:
  // - clickup_get_dependency_graph
  // - clickup_check_dependency_conflicts
  // - clickup_get_workspace_dependencies
  // - clickup_get_dependency_stats
  // - clickup_resolve_dependency_conflicts
  // - clickup_get_dependency_timeline_impact
  // - clickup_bulk_dependency_operations
  // - clickup_export_dependency_graph
}
