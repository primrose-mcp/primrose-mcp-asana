/**
 * Asana Entity Types
 *
 * Type definitions for Asana API resources.
 * Based on https://developers.asana.com/reference/rest-api-reference
 */

// =============================================================================
// Pagination
// =============================================================================

export interface PaginationParams {
  /** Number of items to return (max 100) */
  limit?: number;
  /** Pagination offset token */
  offset?: string;
}

export interface PaginatedResponse<T> {
  /** Array of items */
  data: T[];
  /** Pagination info */
  nextPage?: {
    offset: string;
    path: string;
    uri: string;
  };
}

// =============================================================================
// Common Types
// =============================================================================

/** Compact representation with just GID and name */
export interface AsanaCompact {
  gid: string;
  resource_type: string;
  name?: string;
}

/** User compact representation */
export interface UserCompact {
  gid: string;
  resource_type: 'user';
  name: string;
}

/** Full user object */
export interface User extends UserCompact {
  email?: string;
  photo?: {
    image_21x21?: string;
    image_27x27?: string;
    image_36x36?: string;
    image_60x60?: string;
    image_128x128?: string;
  };
  workspaces?: WorkspaceCompact[];
}

/** Workspace compact representation */
export interface WorkspaceCompact {
  gid: string;
  resource_type: 'workspace';
  name: string;
}

/** Full workspace object */
export interface Workspace extends WorkspaceCompact {
  email_domains?: string[];
  is_organization?: boolean;
}

// =============================================================================
// Teams
// =============================================================================

/** Team compact representation */
export interface TeamCompact {
  gid: string;
  resource_type: 'team';
  name: string;
}

/** Full team object */
export interface Team extends TeamCompact {
  description?: string;
  html_description?: string;
  organization?: WorkspaceCompact;
  permalink_url?: string;
  visibility?: 'secret' | 'request_to_join' | 'public';
}

export interface TeamMembership {
  gid: string;
  resource_type: 'team_membership';
  user: UserCompact;
  team: TeamCompact;
  is_admin?: boolean;
  is_guest?: boolean;
  is_limited_access?: boolean;
}

// =============================================================================
// Projects
// =============================================================================

/** Project compact representation */
export interface ProjectCompact {
  gid: string;
  resource_type: 'project';
  name: string;
}

/** Full project object */
export interface Project extends ProjectCompact {
  archived?: boolean;
  color?: string;
  created_at?: string;
  current_status?: ProjectStatus | null;
  current_status_update?: StatusUpdate | null;
  custom_field_settings?: CustomFieldSetting[];
  custom_fields?: CustomFieldValue[];
  default_view?: 'list' | 'board' | 'calendar' | 'timeline';
  due_date?: string | null;
  due_on?: string | null;
  followers?: UserCompact[];
  html_notes?: string;
  icon?: string;
  members?: UserCompact[];
  modified_at?: string;
  notes?: string;
  owner?: UserCompact | null;
  permalink_url?: string;
  public?: boolean;
  start_on?: string | null;
  team?: TeamCompact;
  workspace?: WorkspaceCompact;
}

export interface ProjectStatus {
  gid: string;
  resource_type: 'project_status';
  author?: UserCompact;
  color: 'green' | 'yellow' | 'red' | 'blue';
  created_at?: string;
  created_by?: UserCompact;
  html_text?: string;
  modified_at?: string;
  text: string;
  title?: string;
}

export interface StatusUpdate {
  gid: string;
  resource_type: 'status_update';
  title: string;
  status_type: 'on_track' | 'at_risk' | 'off_track' | 'on_hold' | 'complete' | 'achieved' | 'partial' | 'missed' | 'dropped';
  text?: string;
  html_text?: string;
  author?: UserCompact;
  created_at?: string;
  created_by?: UserCompact;
}

export interface ProjectMembership {
  gid: string;
  resource_type: 'project_membership';
  user: UserCompact;
  project: ProjectCompact;
  access_level?: 'admin' | 'editor' | 'commenter';
  write_access?: 'full_write' | 'comment_only';
}

// =============================================================================
// Sections
// =============================================================================

export interface Section {
  gid: string;
  resource_type: 'section';
  name: string;
  created_at?: string;
  project?: ProjectCompact;
  projects?: ProjectCompact[];
}

// =============================================================================
// Tasks
// =============================================================================

/** Task compact representation */
export interface TaskCompact {
  gid: string;
  resource_type: 'task';
  name: string;
  resource_subtype?: 'default_task' | 'milestone' | 'section' | 'approval';
}

/** Full task object */
export interface Task extends TaskCompact {
  actual_time_minutes?: number | null;
  approval_status?: 'pending' | 'approved' | 'rejected' | 'changes_requested' | null;
  assignee?: UserCompact | null;
  assignee_section?: Section | null;
  assignee_status?: 'today' | 'upcoming' | 'later' | 'new' | 'inbox';
  completed?: boolean;
  completed_at?: string | null;
  completed_by?: UserCompact | null;
  created_at?: string;
  custom_fields?: CustomFieldValue[];
  dependencies?: TaskCompact[];
  dependents?: TaskCompact[];
  due_at?: string | null;
  due_on?: string | null;
  external?: {
    gid?: string;
    data?: string;
  };
  followers?: UserCompact[];
  hearted?: boolean;
  hearts?: Array<{ gid: string; user: UserCompact }>;
  html_notes?: string;
  is_rendered_as_separator?: boolean;
  liked?: boolean;
  likes?: Array<{ gid: string; user: UserCompact }>;
  memberships?: Array<{
    project: ProjectCompact;
    section: Section | null;
  }>;
  modified_at?: string;
  notes?: string;
  num_hearts?: number;
  num_likes?: number;
  num_subtasks?: number;
  parent?: TaskCompact | null;
  permalink_url?: string;
  projects?: ProjectCompact[];
  start_at?: string | null;
  start_on?: string | null;
  tags?: TagCompact[];
  workspace?: WorkspaceCompact;
}

export interface TaskCreateInput {
  name: string;
  workspace?: string;
  approval_status?: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  assignee?: string;
  assignee_section?: string;
  assignee_status?: 'today' | 'upcoming' | 'later' | 'new' | 'inbox';
  completed?: boolean;
  custom_fields?: Record<string, string | number | boolean>;
  due_at?: string;
  due_on?: string;
  external?: { gid?: string; data?: string };
  followers?: string[];
  html_notes?: string;
  liked?: boolean;
  notes?: string;
  parent?: string;
  projects?: string[];
  resource_subtype?: 'default_task' | 'milestone' | 'section' | 'approval';
  start_at?: string;
  start_on?: string;
  tags?: string[];
}

export interface TaskUpdateInput {
  name?: string;
  approval_status?: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  assignee?: string | null;
  assignee_section?: string;
  assignee_status?: 'today' | 'upcoming' | 'later' | 'new' | 'inbox';
  completed?: boolean;
  custom_fields?: Record<string, string | number | boolean | null>;
  due_at?: string | null;
  due_on?: string | null;
  external?: { gid?: string; data?: string };
  html_notes?: string;
  liked?: boolean;
  notes?: string;
  start_at?: string | null;
  start_on?: string | null;
}

// =============================================================================
// Tags
// =============================================================================

/** Tag compact representation */
export interface TagCompact {
  gid: string;
  resource_type: 'tag';
  name: string;
}

/** Full tag object */
export interface Tag extends TagCompact {
  color?: string;
  created_at?: string;
  followers?: UserCompact[];
  notes?: string;
  permalink_url?: string;
  workspace?: WorkspaceCompact;
}

// =============================================================================
// Custom Fields
// =============================================================================

export interface CustomFieldCompact {
  gid: string;
  resource_type: 'custom_field';
  name: string;
  resource_subtype: 'text' | 'enum' | 'multi_enum' | 'number' | 'date' | 'people';
  type: 'text' | 'enum' | 'multi_enum' | 'number' | 'date' | 'people';
}

export interface CustomField extends CustomFieldCompact {
  asana_created_field?: string;
  created_by?: UserCompact;
  currency_code?: string;
  custom_label?: string;
  custom_label_position?: 'prefix' | 'suffix';
  date_value?: { date: string; date_time?: string } | null;
  description?: string;
  display_value?: string;
  enabled?: boolean;
  enum_options?: EnumOption[];
  enum_value?: EnumOption | null;
  format?: string;
  has_notifications_enabled?: boolean;
  is_formula_field?: boolean;
  is_global_to_workspace?: boolean;
  is_value_read_only?: boolean;
  multi_enum_values?: EnumOption[];
  number_value?: number | null;
  people_value?: UserCompact[];
  precision?: number;
  text_value?: string;
}

export interface CustomFieldValue {
  gid: string;
  resource_type: 'custom_field';
  name: string;
  resource_subtype: string;
  type: string;
  display_value?: string;
  enabled?: boolean;
  number_value?: number | null;
  text_value?: string | null;
  enum_value?: EnumOption | null;
  multi_enum_values?: EnumOption[];
  date_value?: { date: string; date_time?: string } | null;
  people_value?: UserCompact[];
}

export interface CustomFieldSetting {
  gid: string;
  resource_type: 'custom_field_setting';
  custom_field: CustomFieldCompact;
  is_important?: boolean;
  parent?: ProjectCompact | PortfolioCompact;
  project?: ProjectCompact;
}

export interface EnumOption {
  gid: string;
  resource_type: 'enum_option';
  color?: string;
  enabled?: boolean;
  name: string;
}

// =============================================================================
// Stories (Comments & Activity)
// =============================================================================

export interface Story {
  gid: string;
  resource_type: 'story';
  resource_subtype: string;
  created_at?: string;
  created_by?: UserCompact;
  html_text?: string;
  is_editable?: boolean;
  is_edited?: boolean;
  is_pinned?: boolean;
  liked?: boolean;
  likes?: Array<{ gid: string; user: UserCompact }>;
  num_likes?: number;
  previews?: Array<{
    fallback?: string;
    footer?: string;
    header?: string;
    header_link?: string;
    html_text?: string;
    text?: string;
    title?: string;
    title_link?: string;
  }>;
  source?: 'web' | 'email' | 'mobile' | 'api' | 'unknown';
  sticker_name?: string;
  target?: TaskCompact;
  text?: string;
  type?: 'comment' | 'system';
}

// =============================================================================
// Attachments
// =============================================================================

export interface Attachment {
  gid: string;
  resource_type: 'attachment';
  name: string;
  created_at?: string;
  download_url?: string | null;
  host?: 'asana' | 'dropbox' | 'gdrive' | 'onedrive' | 'box' | 'vimeo' | 'external';
  parent?: TaskCompact;
  permanent_url?: string;
  resource_subtype?: string;
  size?: number;
  view_url?: string | null;
}

// =============================================================================
// Portfolios
// =============================================================================

export interface PortfolioCompact {
  gid: string;
  resource_type: 'portfolio';
  name: string;
}

export interface Portfolio extends PortfolioCompact {
  color?: string;
  created_at?: string;
  created_by?: UserCompact;
  current_status_update?: StatusUpdate | null;
  custom_field_settings?: CustomFieldSetting[];
  custom_fields?: CustomFieldValue[];
  due_on?: string | null;
  members?: UserCompact[];
  owner?: UserCompact;
  permalink_url?: string;
  public?: boolean;
  start_on?: string | null;
  workspace?: WorkspaceCompact;
}

// =============================================================================
// Goals
// =============================================================================

export interface GoalCompact {
  gid: string;
  resource_type: 'goal';
  name: string;
  owner?: UserCompact;
}

export interface Goal extends GoalCompact {
  due_on?: string | null;
  followers?: UserCompact[];
  html_notes?: string;
  is_workspace_level?: boolean;
  liked?: boolean;
  likes?: Array<{ gid: string; user: UserCompact }>;
  metric?: GoalMetric | null;
  notes?: string;
  num_likes?: number;
  start_on?: string | null;
  status?: 'on_track' | 'at_risk' | 'off_track' | 'on_hold' | 'achieved' | 'partial' | 'missed' | 'dropped' | null;
  status_update?: StatusUpdate | null;
  team?: TeamCompact | null;
  time_period?: TimePeriod | null;
  workspace?: WorkspaceCompact;
}

export interface GoalMetric {
  gid: string;
  resource_type: 'goal_metric';
  currency_code?: string | null;
  current_display_value?: string;
  current_number_value?: number;
  initial_number_value?: number;
  precision?: number;
  progress_source?: 'manual' | 'subgoal_progress' | 'project_task_completion' | 'project_milestone_completion' | 'external';
  resource_subtype?: 'number' | 'percentage' | 'currency';
  target_number_value?: number;
  unit?: 'none' | 'currency' | 'percentage';
}

export interface GoalRelationship {
  gid: string;
  resource_type: 'goal_relationship';
  contribution_weight?: number;
  resource_subtype?: 'subgoal' | 'supporting_work';
  supported_goal?: GoalCompact;
  supporting_resource?: GoalCompact | ProjectCompact | PortfolioCompact;
}

export interface TimePeriod {
  gid: string;
  resource_type: 'time_period';
  display_name?: string;
  end_on?: string;
  period?: 'FY' | 'H1' | 'H2' | 'Q1' | 'Q2' | 'Q3' | 'Q4';
  start_on?: string;
}

// =============================================================================
// Webhooks
// =============================================================================

export interface Webhook {
  gid: string;
  resource_type: 'webhook';
  active?: boolean;
  created_at?: string;
  filters?: WebhookFilter[];
  last_failure_at?: string | null;
  last_failure_content?: string | null;
  last_success_at?: string | null;
  resource?: AsanaCompact;
  target?: string;
}

export interface WebhookFilter {
  action?: 'changed' | 'added' | 'removed' | 'deleted' | 'undeleted';
  fields?: string[];
  resource_subtype?: string;
  resource_type?: string;
}

// =============================================================================
// User Task Lists
// =============================================================================

export interface UserTaskList {
  gid: string;
  resource_type: 'user_task_list';
  name: string;
  owner?: UserCompact;
  workspace?: WorkspaceCompact;
}

// =============================================================================
// Typeahead
// =============================================================================

export interface TypeaheadResult {
  gid: string;
  resource_type: string;
  name: string;
}

// =============================================================================
// Search
// =============================================================================

export interface TaskSearchParams {
  text?: string;
  'resource_subtype'?: 'default_task' | 'milestone';
  'assignee.any'?: string;
  'assignee.not'?: string;
  'portfolios.any'?: string;
  'projects.any'?: string;
  'projects.not'?: string;
  'projects.all'?: string;
  'sections.any'?: string;
  'sections.not'?: string;
  'sections.all'?: string;
  'tags.any'?: string;
  'tags.not'?: string;
  'tags.all'?: string;
  'teams.any'?: string;
  'followers.not'?: string;
  'created_by.any'?: string;
  'created_by.not'?: string;
  'assigned_by.any'?: string;
  'assigned_by.not'?: string;
  'liked_by.not'?: string;
  'commented_on_by.not'?: string;
  'due_on.before'?: string;
  'due_on.after'?: string;
  'due_on'?: string;
  'due_at.before'?: string;
  'due_at.after'?: string;
  'start_on.before'?: string;
  'start_on.after'?: string;
  'start_on'?: string;
  'created_on.before'?: string;
  'created_on.after'?: string;
  'created_on'?: string;
  'created_at.before'?: string;
  'created_at.after'?: string;
  'completed_on.before'?: string;
  'completed_on.after'?: string;
  'completed_on'?: string;
  'completed_at.before'?: string;
  'completed_at.after'?: string;
  'modified_on.before'?: string;
  'modified_on.after'?: string;
  'modified_on'?: string;
  'modified_at.before'?: string;
  'modified_at.after'?: string;
  'is_blocked'?: boolean;
  'is_blocking'?: boolean;
  'is_subtask'?: boolean;
  'has_attachment'?: boolean;
  'completed'?: boolean;
  'sort_by'?: 'due_date' | 'created_at' | 'completed_at' | 'likes' | 'modified_at';
  'sort_ascending'?: boolean;
}

// =============================================================================
// Response Format
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';
