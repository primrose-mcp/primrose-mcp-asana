/**
 * Asana API Client
 *
 * Comprehensive client for the Asana REST API.
 * Reference: https://developers.asana.com/reference/rest-api-reference
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials,
 * allowing a single server to serve multiple tenants with different access tokens.
 */

import type {
  Attachment,
  CustomField,
  Goal,
  GoalRelationship,
  PaginatedResponse,
  PaginationParams,
  Portfolio,
  Project,
  ProjectMembership,
  ProjectStatus,
  Section,
  Story,
  Tag,
  Task,
  TaskCreateInput,
  TaskSearchParams,
  TaskUpdateInput,
  Team,
  TeamMembership,
  TypeaheadResult,
  User,
  UserTaskList,
  Webhook,
  Workspace,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import { AsanaApiError, AuthenticationError, NotFoundError, RateLimitError } from './utils/errors.js';

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL = 'https://app.asana.com/api/1.0';

// =============================================================================
// Asana Client Interface
// =============================================================================

export interface AsanaClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string; user?: User }>;

  // Users
  getMe(): Promise<User>;
  getUser(userGid: string): Promise<User>;
  listUsers(workspaceGid: string, params?: PaginationParams): Promise<PaginatedResponse<User>>;
  listTeamUsers(teamGid: string, params?: PaginationParams): Promise<PaginatedResponse<User>>;

  // Workspaces
  listWorkspaces(params?: PaginationParams): Promise<PaginatedResponse<Workspace>>;
  getWorkspace(workspaceGid: string): Promise<Workspace>;
  updateWorkspace(workspaceGid: string, name: string): Promise<Workspace>;
  addUserToWorkspace(workspaceGid: string, userGid: string): Promise<User>;
  removeUserFromWorkspace(workspaceGid: string, userGid: string): Promise<void>;

  // Teams
  createTeam(organizationGid: string, name: string, description?: string, visibility?: 'secret' | 'request_to_join' | 'public'): Promise<Team>;
  getTeam(teamGid: string): Promise<Team>;
  updateTeam(teamGid: string, data: { name?: string; description?: string; visibility?: 'secret' | 'request_to_join' | 'public' }): Promise<Team>;
  listTeamsInWorkspace(workspaceGid: string, params?: PaginationParams): Promise<PaginatedResponse<Team>>;
  listUserTeams(userGid: string, organizationGid: string, params?: PaginationParams): Promise<PaginatedResponse<Team>>;
  addUserToTeam(teamGid: string, userGid: string): Promise<TeamMembership>;
  removeUserFromTeam(teamGid: string, userGid: string): Promise<void>;

  // Projects
  createProject(data: { name: string; workspace?: string; team?: string; public?: boolean; color?: string; notes?: string; due_on?: string; start_on?: string; default_view?: 'list' | 'board' | 'calendar' | 'timeline' }): Promise<Project>;
  getProject(projectGid: string): Promise<Project>;
  updateProject(projectGid: string, data: { name?: string; public?: boolean; color?: string; notes?: string; archived?: boolean; due_on?: string | null; start_on?: string | null }): Promise<Project>;
  deleteProject(projectGid: string): Promise<void>;
  duplicateProject(projectGid: string, name: string, options?: { include?: string[]; team?: string; schedule_dates?: { should_skip_weekends: boolean; due_on?: string; start_on?: string } }): Promise<{ new_project: Project }>;
  listProjects(params?: PaginationParams & { workspace?: string; team?: string; archived?: boolean }): Promise<PaginatedResponse<Project>>;
  listWorkspaceProjects(workspaceGid: string, params?: PaginationParams & { archived?: boolean }): Promise<PaginatedResponse<Project>>;
  listTeamProjects(teamGid: string, params?: PaginationParams & { archived?: boolean }): Promise<PaginatedResponse<Project>>;
  listTaskProjects(taskGid: string, params?: PaginationParams): Promise<PaginatedResponse<Project>>;
  addMembersToProject(projectGid: string, memberGids: string[]): Promise<Project>;
  removeMembersFromProject(projectGid: string, memberGids: string[]): Promise<Project>;
  addFollowersToProject(projectGid: string, followerGids: string[]): Promise<Project>;
  removeFollowersFromProject(projectGid: string, followerGids: string[]): Promise<Project>;
  getProjectTaskCounts(projectGid: string): Promise<{ num_tasks: number; num_incomplete_tasks: number; num_completed_tasks: number }>;

  // Project Memberships
  getProjectMembership(membershipGid: string): Promise<ProjectMembership>;
  listProjectMemberships(projectGid: string, params?: PaginationParams): Promise<PaginatedResponse<ProjectMembership>>;

  // Project Statuses
  createProjectStatus(projectGid: string, text: string, color: 'green' | 'yellow' | 'red' | 'blue', title?: string): Promise<ProjectStatus>;
  getProjectStatus(statusGid: string): Promise<ProjectStatus>;
  deleteProjectStatus(statusGid: string): Promise<void>;
  listProjectStatuses(projectGid: string, params?: PaginationParams): Promise<PaginatedResponse<ProjectStatus>>;

  // Sections
  createSection(projectGid: string, name: string, insertBefore?: string, insertAfter?: string): Promise<Section>;
  getSection(sectionGid: string): Promise<Section>;
  updateSection(sectionGid: string, name: string): Promise<Section>;
  deleteSection(sectionGid: string): Promise<void>;
  listProjectSections(projectGid: string, params?: PaginationParams): Promise<PaginatedResponse<Section>>;
  addTaskToSection(sectionGid: string, taskGid: string, insertBefore?: string, insertAfter?: string): Promise<void>;
  moveSection(projectGid: string, sectionGid: string, beforeSection?: string, afterSection?: string): Promise<void>;

  // Tasks
  createTask(data: TaskCreateInput): Promise<Task>;
  getTask(taskGid: string, optFields?: string[]): Promise<Task>;
  updateTask(taskGid: string, data: TaskUpdateInput): Promise<Task>;
  deleteTask(taskGid: string): Promise<void>;
  duplicateTask(taskGid: string, name: string, include?: string[]): Promise<Task>;
  listTasks(params?: PaginationParams & { project?: string; section?: string; workspace?: string; assignee?: string; completed_since?: string; modified_since?: string }): Promise<PaginatedResponse<Task>>;
  listProjectTasks(projectGid: string, params?: PaginationParams): Promise<PaginatedResponse<Task>>;
  listSectionTasks(sectionGid: string, params?: PaginationParams): Promise<PaginatedResponse<Task>>;
  listTagTasks(tagGid: string, params?: PaginationParams): Promise<PaginatedResponse<Task>>;
  listUserTaskListTasks(userTaskListGid: string, params?: PaginationParams & { completed_since?: string }): Promise<PaginatedResponse<Task>>;
  searchTasks(workspaceGid: string, params: TaskSearchParams & PaginationParams): Promise<PaginatedResponse<Task>>;

  // Subtasks
  createSubtask(parentTaskGid: string, data: TaskCreateInput): Promise<Task>;
  listSubtasks(taskGid: string, params?: PaginationParams): Promise<PaginatedResponse<Task>>;
  setParentTask(taskGid: string, parentGid: string | null, insertBefore?: string, insertAfter?: string): Promise<Task>;

  // Task Dependencies
  listTaskDependencies(taskGid: string, params?: PaginationParams): Promise<PaginatedResponse<Task>>;
  addTaskDependencies(taskGid: string, dependencyGids: string[]): Promise<void>;
  removeTaskDependencies(taskGid: string, dependencyGids: string[]): Promise<void>;
  listTaskDependents(taskGid: string, params?: PaginationParams): Promise<PaginatedResponse<Task>>;
  addTaskDependents(taskGid: string, dependentGids: string[]): Promise<void>;
  removeTaskDependents(taskGid: string, dependentGids: string[]): Promise<void>;

  // Task Associations
  addProjectToTask(taskGid: string, projectGid: string, sectionGid?: string, insertBefore?: string, insertAfter?: string): Promise<void>;
  removeProjectFromTask(taskGid: string, projectGid: string): Promise<void>;
  addTagToTask(taskGid: string, tagGid: string): Promise<void>;
  removeTagFromTask(taskGid: string, tagGid: string): Promise<void>;
  addFollowersToTask(taskGid: string, followerGids: string[]): Promise<Task>;
  removeFollowerFromTask(taskGid: string, followerGid: string): Promise<Task>;

  // User Task Lists
  getUserTaskList(userGid: string, workspaceGid: string): Promise<UserTaskList>;

  // Tags
  createTag(data: { name: string; workspace?: string; color?: string; notes?: string }): Promise<Tag>;
  getTag(tagGid: string): Promise<Tag>;
  updateTag(tagGid: string, data: { name?: string; color?: string; notes?: string }): Promise<Tag>;
  deleteTag(tagGid: string): Promise<void>;
  listTags(workspaceGid: string, params?: PaginationParams): Promise<PaginatedResponse<Tag>>;
  listTaskTags(taskGid: string, params?: PaginationParams): Promise<PaginatedResponse<Tag>>;

  // Stories (Comments & Activity)
  createStory(taskGid: string, text: string, isPinned?: boolean, stickerName?: string): Promise<Story>;
  getStory(storyGid: string): Promise<Story>;
  updateStory(storyGid: string, text: string, isPinned?: boolean, stickerName?: string): Promise<Story>;
  deleteStory(storyGid: string): Promise<void>;
  listTaskStories(taskGid: string, params?: PaginationParams): Promise<PaginatedResponse<Story>>;

  // Attachments
  getAttachment(attachmentGid: string): Promise<Attachment>;
  deleteAttachment(attachmentGid: string): Promise<void>;
  listTaskAttachments(taskGid: string, params?: PaginationParams): Promise<PaginatedResponse<Attachment>>;

  // Custom Fields
  createCustomField(data: { name: string; workspace: string; resource_subtype: 'text' | 'enum' | 'multi_enum' | 'number' | 'date' | 'people'; description?: string; precision?: number; enum_options?: Array<{ name: string; color?: string; enabled?: boolean }> }): Promise<CustomField>;
  getCustomField(customFieldGid: string): Promise<CustomField>;
  updateCustomField(customFieldGid: string, data: { name?: string; description?: string; enabled?: boolean }): Promise<CustomField>;
  deleteCustomField(customFieldGid: string): Promise<void>;
  listWorkspaceCustomFields(workspaceGid: string, params?: PaginationParams): Promise<PaginatedResponse<CustomField>>;
  addCustomFieldToProject(projectGid: string, customFieldGid: string, isImportant?: boolean): Promise<void>;
  removeCustomFieldFromProject(projectGid: string, customFieldGid: string): Promise<void>;

  // Portfolios
  createPortfolio(data: { name: string; workspace: string; color?: string; public?: boolean }): Promise<Portfolio>;
  getPortfolio(portfolioGid: string): Promise<Portfolio>;
  updatePortfolio(portfolioGid: string, data: { name?: string; color?: string; public?: boolean }): Promise<Portfolio>;
  deletePortfolio(portfolioGid: string): Promise<void>;
  listPortfolios(workspaceGid: string, ownerGid: string, params?: PaginationParams): Promise<PaginatedResponse<Portfolio>>;
  listPortfolioItems(portfolioGid: string, params?: PaginationParams): Promise<PaginatedResponse<Project>>;
  addItemToPortfolio(portfolioGid: string, itemGid: string): Promise<void>;
  removeItemFromPortfolio(portfolioGid: string, itemGid: string): Promise<void>;
  addMembersToPortfolio(portfolioGid: string, memberGids: string[]): Promise<Portfolio>;
  removeMembersFromPortfolio(portfolioGid: string, memberGids: string[]): Promise<Portfolio>;

  // Goals
  createGoal(data: { name: string; workspace?: string; team?: string; time_period?: string; owner?: string; notes?: string; due_on?: string; start_on?: string; status?: 'on_track' | 'at_risk' | 'off_track' | 'on_hold' | 'achieved' | 'partial' | 'missed' | 'dropped' }): Promise<Goal>;
  getGoal(goalGid: string): Promise<Goal>;
  updateGoal(goalGid: string, data: { name?: string; notes?: string; due_on?: string | null; start_on?: string | null; status?: 'on_track' | 'at_risk' | 'off_track' | 'on_hold' | 'achieved' | 'partial' | 'missed' | 'dropped' | null; owner?: string }): Promise<Goal>;
  deleteGoal(goalGid: string): Promise<void>;
  listGoals(params: PaginationParams & { workspace?: string; team?: string; is_workspace_level?: boolean; time_periods?: string; portfolio?: string }): Promise<PaginatedResponse<Goal>>;
  addFollowersToGoal(goalGid: string, followerGids: string[]): Promise<Goal>;
  removeFollowersFromGoal(goalGid: string, followerGids: string[]): Promise<Goal>;
  listGoalParentGoals(goalGid: string, params?: PaginationParams): Promise<PaginatedResponse<Goal>>;

  // Goal Relationships
  getGoalRelationship(relationshipGid: string): Promise<GoalRelationship>;
  updateGoalRelationship(relationshipGid: string, contributionWeight: number): Promise<GoalRelationship>;
  listGoalRelationships(goalGid: string, params?: PaginationParams): Promise<PaginatedResponse<GoalRelationship>>;
  addSupportingRelationship(goalGid: string, supportingResourceGid: string, contributionWeight?: number): Promise<GoalRelationship>;
  removeSupportingRelationship(goalGid: string, supportingRelationshipGid: string): Promise<void>;

  // Webhooks
  createWebhook(resourceGid: string, target: string, filters?: Array<{ action?: string; fields?: string[]; resource_subtype?: string; resource_type?: string }>): Promise<Webhook>;
  getWebhook(webhookGid: string): Promise<Webhook>;
  updateWebhook(webhookGid: string, filters: Array<{ action?: string; fields?: string[]; resource_subtype?: string; resource_type?: string }>): Promise<Webhook>;
  deleteWebhook(webhookGid: string): Promise<void>;
  listWebhooks(workspaceGid: string, resourceGid?: string, params?: PaginationParams): Promise<PaginatedResponse<Webhook>>;

  // Typeahead
  typeahead(workspaceGid: string, resourceType: 'custom_field' | 'goal' | 'portfolio' | 'project' | 'tag' | 'task' | 'team' | 'user', query: string, count?: number): Promise<TypeaheadResult[]>;
}

// =============================================================================
// Asana Client Implementation
// =============================================================================

class AsanaClientImpl implements AsanaClient {
  private credentials: TenantCredentials;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
  }

  // ===========================================================================
  // HTTP Request Helper
  // ===========================================================================

  private getAuthHeaders(): Record<string, string> {
    if (!this.credentials.accessToken) {
      throw new AuthenticationError(
        'No access token provided. Include X-Asana-Access-Token header.'
      );
    }

    return {
      Authorization: `Bearer ${this.credentials.accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 60);
    }

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('Authentication failed. Check your Asana access token.');
    }

    // Handle not found
    if (response.status === 404) {
      throw new NotFoundError('Resource', endpoint);
    }

    // Handle other errors
    if (!response.ok) {
      const errorBody = await response.text();
      let message = `Asana API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        message = errorJson.errors?.[0]?.message || errorJson.message || message;
      } catch {
        // Use default message
      }
      throw new AsanaApiError(message, response.status);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const json = (await response.json()) as { data: T };
    return json.data;
  }

  private async requestPaginated<T>(
    endpoint: string,
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.offset) queryParams.set('offset', params.offset);

    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${endpoint}${queryParams.toString() ? `${separator}${queryParams}` : ''}`;

    const fullUrl = `${API_BASE_URL}${url}`;
    const response = await fetch(fullUrl, {
      headers: this.getAuthHeaders(),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 60);
    }

    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError('Authentication failed. Check your Asana access token.');
    }

    if (!response.ok) {
      const errorBody = await response.text();
      let message = `Asana API error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        message = errorJson.errors?.[0]?.message || errorJson.message || message;
      } catch {
        // Use default message
      }
      throw new AsanaApiError(message, response.status);
    }

    const json = (await response.json()) as { data: T[]; next_page?: { offset: string; path: string; uri: string } };
    return {
      data: json.data,
      nextPage: json.next_page,
    };
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string; user?: User }> {
    try {
      const user = await this.getMe();
      return {
        connected: true,
        message: `Connected as ${user.name} (${user.email || 'no email'})`,
        user,
      };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Users
  // ===========================================================================

  async getMe(): Promise<User> {
    return this.request<User>('/users/me');
  }

  async getUser(userGid: string): Promise<User> {
    return this.request<User>(`/users/${userGid}`);
  }

  async listUsers(workspaceGid: string, params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return this.requestPaginated<User>(`/workspaces/${workspaceGid}/users`, params);
  }

  async listTeamUsers(teamGid: string, params?: PaginationParams): Promise<PaginatedResponse<User>> {
    return this.requestPaginated<User>(`/teams/${teamGid}/users`, params);
  }

  // ===========================================================================
  // Workspaces
  // ===========================================================================

  async listWorkspaces(params?: PaginationParams): Promise<PaginatedResponse<Workspace>> {
    return this.requestPaginated<Workspace>('/workspaces', params);
  }

  async getWorkspace(workspaceGid: string): Promise<Workspace> {
    return this.request<Workspace>(`/workspaces/${workspaceGid}`);
  }

  async updateWorkspace(workspaceGid: string, name: string): Promise<Workspace> {
    return this.request<Workspace>(`/workspaces/${workspaceGid}`, {
      method: 'PUT',
      body: JSON.stringify({ data: { name } }),
    });
  }

  async addUserToWorkspace(workspaceGid: string, userGid: string): Promise<User> {
    return this.request<User>(`/workspaces/${workspaceGid}/addUser`, {
      method: 'POST',
      body: JSON.stringify({ data: { user: userGid } }),
    });
  }

  async removeUserFromWorkspace(workspaceGid: string, userGid: string): Promise<void> {
    await this.request<void>(`/workspaces/${workspaceGid}/removeUser`, {
      method: 'POST',
      body: JSON.stringify({ data: { user: userGid } }),
    });
  }

  // ===========================================================================
  // Teams
  // ===========================================================================

  async createTeam(
    organizationGid: string,
    name: string,
    description?: string,
    visibility?: 'secret' | 'request_to_join' | 'public'
  ): Promise<Team> {
    return this.request<Team>('/teams', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          organization: organizationGid,
          name,
          description,
          visibility,
        },
      }),
    });
  }

  async getTeam(teamGid: string): Promise<Team> {
    return this.request<Team>(`/teams/${teamGid}`);
  }

  async updateTeam(
    teamGid: string,
    data: { name?: string; description?: string; visibility?: 'secret' | 'request_to_join' | 'public' }
  ): Promise<Team> {
    return this.request<Team>(`/teams/${teamGid}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async listTeamsInWorkspace(workspaceGid: string, params?: PaginationParams): Promise<PaginatedResponse<Team>> {
    return this.requestPaginated<Team>(`/organizations/${workspaceGid}/teams`, params);
  }

  async listUserTeams(
    userGid: string,
    organizationGid: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Team>> {
    return this.requestPaginated<Team>(`/users/${userGid}/teams?organization=${organizationGid}`, params);
  }

  async addUserToTeam(teamGid: string, userGid: string): Promise<TeamMembership> {
    return this.request<TeamMembership>(`/teams/${teamGid}/addUser`, {
      method: 'POST',
      body: JSON.stringify({ data: { user: userGid } }),
    });
  }

  async removeUserFromTeam(teamGid: string, userGid: string): Promise<void> {
    await this.request<void>(`/teams/${teamGid}/removeUser`, {
      method: 'POST',
      body: JSON.stringify({ data: { user: userGid } }),
    });
  }

  // ===========================================================================
  // Projects
  // ===========================================================================

  async createProject(data: {
    name: string;
    workspace?: string;
    team?: string;
    public?: boolean;
    color?: string;
    notes?: string;
    due_on?: string;
    start_on?: string;
    default_view?: 'list' | 'board' | 'calendar' | 'timeline';
  }): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async getProject(projectGid: string): Promise<Project> {
    return this.request<Project>(`/projects/${projectGid}`);
  }

  async updateProject(
    projectGid: string,
    data: {
      name?: string;
      public?: boolean;
      color?: string;
      notes?: string;
      archived?: boolean;
      due_on?: string | null;
      start_on?: string | null;
    }
  ): Promise<Project> {
    return this.request<Project>(`/projects/${projectGid}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async deleteProject(projectGid: string): Promise<void> {
    await this.request<void>(`/projects/${projectGid}`, { method: 'DELETE' });
  }

  async duplicateProject(
    projectGid: string,
    name: string,
    options?: {
      include?: string[];
      team?: string;
      schedule_dates?: { should_skip_weekends: boolean; due_on?: string; start_on?: string };
    }
  ): Promise<{ new_project: Project }> {
    return this.request<{ new_project: Project }>(`/projects/${projectGid}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ data: { name, ...options } }),
    });
  }

  async listProjects(
    params?: PaginationParams & { workspace?: string; team?: string; archived?: boolean }
  ): Promise<PaginatedResponse<Project>> {
    const queryParams = new URLSearchParams();
    if (params?.workspace) queryParams.set('workspace', params.workspace);
    if (params?.team) queryParams.set('team', params.team);
    if (params?.archived !== undefined) queryParams.set('archived', String(params.archived));
    const query = queryParams.toString();
    return this.requestPaginated<Project>(`/projects${query ? `?${query}` : ''}`, params);
  }

  async listWorkspaceProjects(
    workspaceGid: string,
    params?: PaginationParams & { archived?: boolean }
  ): Promise<PaginatedResponse<Project>> {
    const queryParams = new URLSearchParams();
    if (params?.archived !== undefined) queryParams.set('archived', String(params.archived));
    const query = queryParams.toString();
    return this.requestPaginated<Project>(
      `/workspaces/${workspaceGid}/projects${query ? `?${query}` : ''}`,
      params
    );
  }

  async listTeamProjects(
    teamGid: string,
    params?: PaginationParams & { archived?: boolean }
  ): Promise<PaginatedResponse<Project>> {
    const queryParams = new URLSearchParams();
    if (params?.archived !== undefined) queryParams.set('archived', String(params.archived));
    const query = queryParams.toString();
    return this.requestPaginated<Project>(
      `/teams/${teamGid}/projects${query ? `?${query}` : ''}`,
      params
    );
  }

  async listTaskProjects(taskGid: string, params?: PaginationParams): Promise<PaginatedResponse<Project>> {
    return this.requestPaginated<Project>(`/tasks/${taskGid}/projects`, params);
  }

  async addMembersToProject(projectGid: string, memberGids: string[]): Promise<Project> {
    return this.request<Project>(`/projects/${projectGid}/addMembers`, {
      method: 'POST',
      body: JSON.stringify({ data: { members: memberGids.join(',') } }),
    });
  }

  async removeMembersFromProject(projectGid: string, memberGids: string[]): Promise<Project> {
    return this.request<Project>(`/projects/${projectGid}/removeMembers`, {
      method: 'POST',
      body: JSON.stringify({ data: { members: memberGids.join(',') } }),
    });
  }

  async addFollowersToProject(projectGid: string, followerGids: string[]): Promise<Project> {
    return this.request<Project>(`/projects/${projectGid}/addFollowers`, {
      method: 'POST',
      body: JSON.stringify({ data: { followers: followerGids.join(',') } }),
    });
  }

  async removeFollowersFromProject(projectGid: string, followerGids: string[]): Promise<Project> {
    return this.request<Project>(`/projects/${projectGid}/removeFollowers`, {
      method: 'POST',
      body: JSON.stringify({ data: { followers: followerGids.join(',') } }),
    });
  }

  async getProjectTaskCounts(projectGid: string): Promise<{
    num_tasks: number;
    num_incomplete_tasks: number;
    num_completed_tasks: number;
  }> {
    return this.request<{
      num_tasks: number;
      num_incomplete_tasks: number;
      num_completed_tasks: number;
    }>(`/projects/${projectGid}/task_counts`);
  }

  // ===========================================================================
  // Project Memberships
  // ===========================================================================

  async getProjectMembership(membershipGid: string): Promise<ProjectMembership> {
    return this.request<ProjectMembership>(`/project_memberships/${membershipGid}`);
  }

  async listProjectMemberships(
    projectGid: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<ProjectMembership>> {
    return this.requestPaginated<ProjectMembership>(`/projects/${projectGid}/project_memberships`, params);
  }

  // ===========================================================================
  // Project Statuses
  // ===========================================================================

  async createProjectStatus(
    projectGid: string,
    text: string,
    color: 'green' | 'yellow' | 'red' | 'blue',
    title?: string
  ): Promise<ProjectStatus> {
    return this.request<ProjectStatus>(`/projects/${projectGid}/project_statuses`, {
      method: 'POST',
      body: JSON.stringify({ data: { text, color, title } }),
    });
  }

  async getProjectStatus(statusGid: string): Promise<ProjectStatus> {
    return this.request<ProjectStatus>(`/project_statuses/${statusGid}`);
  }

  async deleteProjectStatus(statusGid: string): Promise<void> {
    await this.request<void>(`/project_statuses/${statusGid}`, { method: 'DELETE' });
  }

  async listProjectStatuses(
    projectGid: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<ProjectStatus>> {
    return this.requestPaginated<ProjectStatus>(`/projects/${projectGid}/project_statuses`, params);
  }

  // ===========================================================================
  // Sections
  // ===========================================================================

  async createSection(
    projectGid: string,
    name: string,
    insertBefore?: string,
    insertAfter?: string
  ): Promise<Section> {
    return this.request<Section>(`/projects/${projectGid}/sections`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          name,
          insert_before: insertBefore,
          insert_after: insertAfter,
        },
      }),
    });
  }

  async getSection(sectionGid: string): Promise<Section> {
    return this.request<Section>(`/sections/${sectionGid}`);
  }

  async updateSection(sectionGid: string, name: string): Promise<Section> {
    return this.request<Section>(`/sections/${sectionGid}`, {
      method: 'PUT',
      body: JSON.stringify({ data: { name } }),
    });
  }

  async deleteSection(sectionGid: string): Promise<void> {
    await this.request<void>(`/sections/${sectionGid}`, { method: 'DELETE' });
  }

  async listProjectSections(
    projectGid: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Section>> {
    return this.requestPaginated<Section>(`/projects/${projectGid}/sections`, params);
  }

  async addTaskToSection(
    sectionGid: string,
    taskGid: string,
    insertBefore?: string,
    insertAfter?: string
  ): Promise<void> {
    await this.request<void>(`/sections/${sectionGid}/addTask`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          task: taskGid,
          insert_before: insertBefore,
          insert_after: insertAfter,
        },
      }),
    });
  }

  async moveSection(
    projectGid: string,
    sectionGid: string,
    beforeSection?: string,
    afterSection?: string
  ): Promise<void> {
    await this.request<void>(`/projects/${projectGid}/sections/insert`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          section: sectionGid,
          before_section: beforeSection,
          after_section: afterSection,
        },
      }),
    });
  }

  // ===========================================================================
  // Tasks
  // ===========================================================================

  async createTask(data: TaskCreateInput): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async getTask(taskGid: string, optFields?: string[]): Promise<Task> {
    const queryParams = new URLSearchParams();
    if (optFields?.length) {
      queryParams.set('opt_fields', optFields.join(','));
    }
    const query = queryParams.toString();
    return this.request<Task>(`/tasks/${taskGid}${query ? `?${query}` : ''}`);
  }

  async updateTask(taskGid: string, data: TaskUpdateInput): Promise<Task> {
    return this.request<Task>(`/tasks/${taskGid}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async deleteTask(taskGid: string): Promise<void> {
    await this.request<void>(`/tasks/${taskGid}`, { method: 'DELETE' });
  }

  async duplicateTask(taskGid: string, name: string, include?: string[]): Promise<Task> {
    return this.request<Task>(`/tasks/${taskGid}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ data: { name, include: include?.join(',') } }),
    });
  }

  async listTasks(
    params?: PaginationParams & {
      project?: string;
      section?: string;
      workspace?: string;
      assignee?: string;
      completed_since?: string;
      modified_since?: string;
    }
  ): Promise<PaginatedResponse<Task>> {
    const queryParams = new URLSearchParams();
    if (params?.project) queryParams.set('project', params.project);
    if (params?.section) queryParams.set('section', params.section);
    if (params?.workspace) queryParams.set('workspace', params.workspace);
    if (params?.assignee) queryParams.set('assignee', params.assignee);
    if (params?.completed_since) queryParams.set('completed_since', params.completed_since);
    if (params?.modified_since) queryParams.set('modified_since', params.modified_since);
    const query = queryParams.toString();
    return this.requestPaginated<Task>(`/tasks${query ? `?${query}` : ''}`, params);
  }

  async listProjectTasks(projectGid: string, params?: PaginationParams): Promise<PaginatedResponse<Task>> {
    return this.requestPaginated<Task>(`/projects/${projectGid}/tasks`, params);
  }

  async listSectionTasks(sectionGid: string, params?: PaginationParams): Promise<PaginatedResponse<Task>> {
    return this.requestPaginated<Task>(`/sections/${sectionGid}/tasks`, params);
  }

  async listTagTasks(tagGid: string, params?: PaginationParams): Promise<PaginatedResponse<Task>> {
    return this.requestPaginated<Task>(`/tags/${tagGid}/tasks`, params);
  }

  async listUserTaskListTasks(
    userTaskListGid: string,
    params?: PaginationParams & { completed_since?: string }
  ): Promise<PaginatedResponse<Task>> {
    const queryParams = new URLSearchParams();
    if (params?.completed_since) queryParams.set('completed_since', params.completed_since);
    const query = queryParams.toString();
    return this.requestPaginated<Task>(
      `/user_task_lists/${userTaskListGid}/tasks${query ? `?${query}` : ''}`,
      params
    );
  }

  async searchTasks(
    workspaceGid: string,
    params: TaskSearchParams & PaginationParams
  ): Promise<PaginatedResponse<Task>> {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParams.set(key, String(value));
      }
    }
    return this.requestPaginated<Task>(
      `/workspaces/${workspaceGid}/tasks/search?${queryParams}`,
      params
    );
  }

  // ===========================================================================
  // Subtasks
  // ===========================================================================

  async createSubtask(parentTaskGid: string, data: TaskCreateInput): Promise<Task> {
    return this.request<Task>(`/tasks/${parentTaskGid}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async listSubtasks(taskGid: string, params?: PaginationParams): Promise<PaginatedResponse<Task>> {
    return this.requestPaginated<Task>(`/tasks/${taskGid}/subtasks`, params);
  }

  async setParentTask(
    taskGid: string,
    parentGid: string | null,
    insertBefore?: string,
    insertAfter?: string
  ): Promise<Task> {
    return this.request<Task>(`/tasks/${taskGid}/setParent`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          parent: parentGid,
          insert_before: insertBefore,
          insert_after: insertAfter,
        },
      }),
    });
  }

  // ===========================================================================
  // Task Dependencies
  // ===========================================================================

  async listTaskDependencies(taskGid: string, params?: PaginationParams): Promise<PaginatedResponse<Task>> {
    return this.requestPaginated<Task>(`/tasks/${taskGid}/dependencies`, params);
  }

  async addTaskDependencies(taskGid: string, dependencyGids: string[]): Promise<void> {
    await this.request<void>(`/tasks/${taskGid}/addDependencies`, {
      method: 'POST',
      body: JSON.stringify({ data: { dependencies: dependencyGids } }),
    });
  }

  async removeTaskDependencies(taskGid: string, dependencyGids: string[]): Promise<void> {
    await this.request<void>(`/tasks/${taskGid}/removeDependencies`, {
      method: 'POST',
      body: JSON.stringify({ data: { dependencies: dependencyGids } }),
    });
  }

  async listTaskDependents(taskGid: string, params?: PaginationParams): Promise<PaginatedResponse<Task>> {
    return this.requestPaginated<Task>(`/tasks/${taskGid}/dependents`, params);
  }

  async addTaskDependents(taskGid: string, dependentGids: string[]): Promise<void> {
    await this.request<void>(`/tasks/${taskGid}/addDependents`, {
      method: 'POST',
      body: JSON.stringify({ data: { dependents: dependentGids } }),
    });
  }

  async removeTaskDependents(taskGid: string, dependentGids: string[]): Promise<void> {
    await this.request<void>(`/tasks/${taskGid}/removeDependents`, {
      method: 'POST',
      body: JSON.stringify({ data: { dependents: dependentGids } }),
    });
  }

  // ===========================================================================
  // Task Associations
  // ===========================================================================

  async addProjectToTask(
    taskGid: string,
    projectGid: string,
    sectionGid?: string,
    insertBefore?: string,
    insertAfter?: string
  ): Promise<void> {
    await this.request<void>(`/tasks/${taskGid}/addProject`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          project: projectGid,
          section: sectionGid,
          insert_before: insertBefore,
          insert_after: insertAfter,
        },
      }),
    });
  }

  async removeProjectFromTask(taskGid: string, projectGid: string): Promise<void> {
    await this.request<void>(`/tasks/${taskGid}/removeProject`, {
      method: 'POST',
      body: JSON.stringify({ data: { project: projectGid } }),
    });
  }

  async addTagToTask(taskGid: string, tagGid: string): Promise<void> {
    await this.request<void>(`/tasks/${taskGid}/addTag`, {
      method: 'POST',
      body: JSON.stringify({ data: { tag: tagGid } }),
    });
  }

  async removeTagFromTask(taskGid: string, tagGid: string): Promise<void> {
    await this.request<void>(`/tasks/${taskGid}/removeTag`, {
      method: 'POST',
      body: JSON.stringify({ data: { tag: tagGid } }),
    });
  }

  async addFollowersToTask(taskGid: string, followerGids: string[]): Promise<Task> {
    return this.request<Task>(`/tasks/${taskGid}/addFollowers`, {
      method: 'POST',
      body: JSON.stringify({ data: { followers: followerGids } }),
    });
  }

  async removeFollowerFromTask(taskGid: string, followerGid: string): Promise<Task> {
    return this.request<Task>(`/tasks/${taskGid}/removeFollower`, {
      method: 'POST',
      body: JSON.stringify({ data: { follower: followerGid } }),
    });
  }

  // ===========================================================================
  // User Task Lists
  // ===========================================================================

  async getUserTaskList(userGid: string, workspaceGid: string): Promise<UserTaskList> {
    return this.request<UserTaskList>(`/users/${userGid}/user_task_list?workspace=${workspaceGid}`);
  }

  // ===========================================================================
  // Tags
  // ===========================================================================

  async createTag(data: { name: string; workspace?: string; color?: string; notes?: string }): Promise<Tag> {
    return this.request<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async getTag(tagGid: string): Promise<Tag> {
    return this.request<Tag>(`/tags/${tagGid}`);
  }

  async updateTag(
    tagGid: string,
    data: { name?: string; color?: string; notes?: string }
  ): Promise<Tag> {
    return this.request<Tag>(`/tags/${tagGid}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async deleteTag(tagGid: string): Promise<void> {
    await this.request<void>(`/tags/${tagGid}`, { method: 'DELETE' });
  }

  async listTags(workspaceGid: string, params?: PaginationParams): Promise<PaginatedResponse<Tag>> {
    return this.requestPaginated<Tag>(`/workspaces/${workspaceGid}/tags`, params);
  }

  async listTaskTags(taskGid: string, params?: PaginationParams): Promise<PaginatedResponse<Tag>> {
    return this.requestPaginated<Tag>(`/tasks/${taskGid}/tags`, params);
  }

  // ===========================================================================
  // Stories (Comments & Activity)
  // ===========================================================================

  async createStory(
    taskGid: string,
    text: string,
    isPinned?: boolean,
    stickerName?: string
  ): Promise<Story> {
    return this.request<Story>(`/tasks/${taskGid}/stories`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          text,
          is_pinned: isPinned,
          sticker_name: stickerName,
        },
      }),
    });
  }

  async getStory(storyGid: string): Promise<Story> {
    return this.request<Story>(`/stories/${storyGid}`);
  }

  async updateStory(
    storyGid: string,
    text: string,
    isPinned?: boolean,
    stickerName?: string
  ): Promise<Story> {
    return this.request<Story>(`/stories/${storyGid}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          text,
          is_pinned: isPinned,
          sticker_name: stickerName,
        },
      }),
    });
  }

  async deleteStory(storyGid: string): Promise<void> {
    await this.request<void>(`/stories/${storyGid}`, { method: 'DELETE' });
  }

  async listTaskStories(taskGid: string, params?: PaginationParams): Promise<PaginatedResponse<Story>> {
    return this.requestPaginated<Story>(`/tasks/${taskGid}/stories`, params);
  }

  // ===========================================================================
  // Attachments
  // ===========================================================================

  async getAttachment(attachmentGid: string): Promise<Attachment> {
    return this.request<Attachment>(`/attachments/${attachmentGid}`);
  }

  async deleteAttachment(attachmentGid: string): Promise<void> {
    await this.request<void>(`/attachments/${attachmentGid}`, { method: 'DELETE' });
  }

  async listTaskAttachments(
    taskGid: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Attachment>> {
    return this.requestPaginated<Attachment>(`/tasks/${taskGid}/attachments`, params);
  }

  // ===========================================================================
  // Custom Fields
  // ===========================================================================

  async createCustomField(data: {
    name: string;
    workspace: string;
    resource_subtype: 'text' | 'enum' | 'multi_enum' | 'number' | 'date' | 'people';
    description?: string;
    precision?: number;
    enum_options?: Array<{ name: string; color?: string; enabled?: boolean }>;
  }): Promise<CustomField> {
    return this.request<CustomField>('/custom_fields', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async getCustomField(customFieldGid: string): Promise<CustomField> {
    return this.request<CustomField>(`/custom_fields/${customFieldGid}`);
  }

  async updateCustomField(
    customFieldGid: string,
    data: { name?: string; description?: string; enabled?: boolean }
  ): Promise<CustomField> {
    return this.request<CustomField>(`/custom_fields/${customFieldGid}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async deleteCustomField(customFieldGid: string): Promise<void> {
    await this.request<void>(`/custom_fields/${customFieldGid}`, { method: 'DELETE' });
  }

  async listWorkspaceCustomFields(
    workspaceGid: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<CustomField>> {
    return this.requestPaginated<CustomField>(`/workspaces/${workspaceGid}/custom_fields`, params);
  }

  async addCustomFieldToProject(
    projectGid: string,
    customFieldGid: string,
    isImportant?: boolean
  ): Promise<void> {
    await this.request<void>(`/projects/${projectGid}/addCustomFieldSetting`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          custom_field: customFieldGid,
          is_important: isImportant,
        },
      }),
    });
  }

  async removeCustomFieldFromProject(projectGid: string, customFieldGid: string): Promise<void> {
    await this.request<void>(`/projects/${projectGid}/removeCustomFieldSetting`, {
      method: 'POST',
      body: JSON.stringify({ data: { custom_field: customFieldGid } }),
    });
  }

  // ===========================================================================
  // Portfolios
  // ===========================================================================

  async createPortfolio(data: {
    name: string;
    workspace: string;
    color?: string;
    public?: boolean;
  }): Promise<Portfolio> {
    return this.request<Portfolio>('/portfolios', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async getPortfolio(portfolioGid: string): Promise<Portfolio> {
    return this.request<Portfolio>(`/portfolios/${portfolioGid}`);
  }

  async updatePortfolio(
    portfolioGid: string,
    data: { name?: string; color?: string; public?: boolean }
  ): Promise<Portfolio> {
    return this.request<Portfolio>(`/portfolios/${portfolioGid}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async deletePortfolio(portfolioGid: string): Promise<void> {
    await this.request<void>(`/portfolios/${portfolioGid}`, { method: 'DELETE' });
  }

  async listPortfolios(
    workspaceGid: string,
    ownerGid: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Portfolio>> {
    return this.requestPaginated<Portfolio>(
      `/portfolios?workspace=${workspaceGid}&owner=${ownerGid}`,
      params
    );
  }

  async listPortfolioItems(
    portfolioGid: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Project>> {
    return this.requestPaginated<Project>(`/portfolios/${portfolioGid}/items`, params);
  }

  async addItemToPortfolio(portfolioGid: string, itemGid: string): Promise<void> {
    await this.request<void>(`/portfolios/${portfolioGid}/items`, {
      method: 'POST',
      body: JSON.stringify({ data: { item: itemGid } }),
    });
  }

  async removeItemFromPortfolio(portfolioGid: string, itemGid: string): Promise<void> {
    await this.request<void>(`/portfolios/${portfolioGid}/removeItem`, {
      method: 'POST',
      body: JSON.stringify({ data: { item: itemGid } }),
    });
  }

  async addMembersToPortfolio(portfolioGid: string, memberGids: string[]): Promise<Portfolio> {
    return this.request<Portfolio>(`/portfolios/${portfolioGid}/addMembers`, {
      method: 'POST',
      body: JSON.stringify({ data: { members: memberGids.join(',') } }),
    });
  }

  async removeMembersFromPortfolio(portfolioGid: string, memberGids: string[]): Promise<Portfolio> {
    return this.request<Portfolio>(`/portfolios/${portfolioGid}/removeMembers`, {
      method: 'POST',
      body: JSON.stringify({ data: { members: memberGids.join(',') } }),
    });
  }

  // ===========================================================================
  // Goals
  // ===========================================================================

  async createGoal(data: {
    name: string;
    workspace?: string;
    team?: string;
    time_period?: string;
    owner?: string;
    notes?: string;
    due_on?: string;
    start_on?: string;
    status?: 'on_track' | 'at_risk' | 'off_track' | 'on_hold' | 'achieved' | 'partial' | 'missed' | 'dropped';
  }): Promise<Goal> {
    return this.request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  async getGoal(goalGid: string): Promise<Goal> {
    return this.request<Goal>(`/goals/${goalGid}`);
  }

  async updateGoal(
    goalGid: string,
    data: {
      name?: string;
      notes?: string;
      due_on?: string | null;
      start_on?: string | null;
      status?: 'on_track' | 'at_risk' | 'off_track' | 'on_hold' | 'achieved' | 'partial' | 'missed' | 'dropped' | null;
      owner?: string;
    }
  ): Promise<Goal> {
    return this.request<Goal>(`/goals/${goalGid}`, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
  }

  async deleteGoal(goalGid: string): Promise<void> {
    await this.request<void>(`/goals/${goalGid}`, { method: 'DELETE' });
  }

  async listGoals(
    params: PaginationParams & {
      workspace?: string;
      team?: string;
      is_workspace_level?: boolean;
      time_periods?: string;
      portfolio?: string;
    }
  ): Promise<PaginatedResponse<Goal>> {
    const queryParams = new URLSearchParams();
    if (params.workspace) queryParams.set('workspace', params.workspace);
    if (params.team) queryParams.set('team', params.team);
    if (params.is_workspace_level !== undefined)
      queryParams.set('is_workspace_level', String(params.is_workspace_level));
    if (params.time_periods) queryParams.set('time_periods', params.time_periods);
    if (params.portfolio) queryParams.set('portfolio', params.portfolio);
    const query = queryParams.toString();
    return this.requestPaginated<Goal>(`/goals${query ? `?${query}` : ''}`, params);
  }

  async addFollowersToGoal(goalGid: string, followerGids: string[]): Promise<Goal> {
    return this.request<Goal>(`/goals/${goalGid}/addFollowers`, {
      method: 'POST',
      body: JSON.stringify({ data: { followers: followerGids.join(',') } }),
    });
  }

  async removeFollowersFromGoal(goalGid: string, followerGids: string[]): Promise<Goal> {
    return this.request<Goal>(`/goals/${goalGid}/removeFollowers`, {
      method: 'POST',
      body: JSON.stringify({ data: { followers: followerGids.join(',') } }),
    });
  }

  async listGoalParentGoals(goalGid: string, params?: PaginationParams): Promise<PaginatedResponse<Goal>> {
    return this.requestPaginated<Goal>(`/goals/${goalGid}/parentGoals`, params);
  }

  // ===========================================================================
  // Goal Relationships
  // ===========================================================================

  async getGoalRelationship(relationshipGid: string): Promise<GoalRelationship> {
    return this.request<GoalRelationship>(`/goal_relationships/${relationshipGid}`);
  }

  async updateGoalRelationship(
    relationshipGid: string,
    contributionWeight: number
  ): Promise<GoalRelationship> {
    return this.request<GoalRelationship>(`/goal_relationships/${relationshipGid}`, {
      method: 'PUT',
      body: JSON.stringify({ data: { contribution_weight: contributionWeight } }),
    });
  }

  async listGoalRelationships(
    goalGid: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<GoalRelationship>> {
    return this.requestPaginated<GoalRelationship>(
      `/goals/${goalGid}/goal_relationships`,
      params
    );
  }

  async addSupportingRelationship(
    goalGid: string,
    supportingResourceGid: string,
    contributionWeight?: number
  ): Promise<GoalRelationship> {
    return this.request<GoalRelationship>(`/goals/${goalGid}/addSupportingRelationship`, {
      method: 'POST',
      body: JSON.stringify({
        data: {
          supporting_resource: supportingResourceGid,
          contribution_weight: contributionWeight,
        },
      }),
    });
  }

  async removeSupportingRelationship(
    goalGid: string,
    supportingRelationshipGid: string
  ): Promise<void> {
    await this.request<void>(`/goals/${goalGid}/removeSupportingRelationship`, {
      method: 'POST',
      body: JSON.stringify({ data: { supporting_relationship: supportingRelationshipGid } }),
    });
  }

  // ===========================================================================
  // Webhooks
  // ===========================================================================

  async createWebhook(
    resourceGid: string,
    target: string,
    filters?: Array<{
      action?: string;
      fields?: string[];
      resource_subtype?: string;
      resource_type?: string;
    }>
  ): Promise<Webhook> {
    return this.request<Webhook>('/webhooks', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          resource: resourceGid,
          target,
          filters,
        },
      }),
    });
  }

  async getWebhook(webhookGid: string): Promise<Webhook> {
    return this.request<Webhook>(`/webhooks/${webhookGid}`);
  }

  async updateWebhook(
    webhookGid: string,
    filters: Array<{
      action?: string;
      fields?: string[];
      resource_subtype?: string;
      resource_type?: string;
    }>
  ): Promise<Webhook> {
    return this.request<Webhook>(`/webhooks/${webhookGid}`, {
      method: 'PUT',
      body: JSON.stringify({ data: { filters } }),
    });
  }

  async deleteWebhook(webhookGid: string): Promise<void> {
    await this.request<void>(`/webhooks/${webhookGid}`, { method: 'DELETE' });
  }

  async listWebhooks(
    workspaceGid: string,
    resourceGid?: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Webhook>> {
    const queryParams = new URLSearchParams({ workspace: workspaceGid });
    if (resourceGid) queryParams.set('resource', resourceGid);
    return this.requestPaginated<Webhook>(`/webhooks?${queryParams}`, params);
  }

  // ===========================================================================
  // Typeahead
  // ===========================================================================

  async typeahead(
    workspaceGid: string,
    resourceType:
      | 'custom_field'
      | 'goal'
      | 'portfolio'
      | 'project'
      | 'tag'
      | 'task'
      | 'team'
      | 'user',
    query: string,
    count?: number
  ): Promise<TypeaheadResult[]> {
    const queryParams = new URLSearchParams({
      resource_type: resourceType,
      query,
    });
    if (count) queryParams.set('count', String(count));
    return this.request<TypeaheadResult[]>(
      `/workspaces/${workspaceGid}/typeahead?${queryParams}`
    );
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create an Asana client instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides its own credentials via headers,
 * allowing a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createAsanaClient(credentials: TenantCredentials): AsanaClient {
  return new AsanaClientImpl(credentials);
}
