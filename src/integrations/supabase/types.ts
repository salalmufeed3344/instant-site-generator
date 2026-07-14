export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_departments: {
        Row: {
          confidence: number
          created_at: string
          description: string | null
          icon: string | null
          id: string
          knowledge_source_ids: string[]
          name: string
          organization_id: string
          policy_ids: string[]
          purpose: string | null
          responsibilities: string[]
          slug: string
          status: string
          updated_at: string
          workflows: string[]
        }
        Insert: {
          confidence?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          knowledge_source_ids?: string[]
          name: string
          organization_id: string
          policy_ids?: string[]
          purpose?: string | null
          responsibilities?: string[]
          slug: string
          status?: string
          updated_at?: string
          workflows?: string[]
        }
        Update: {
          confidence?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          knowledge_source_ids?: string[]
          name?: string
          organization_id?: string
          policy_ids?: string[]
          purpose?: string | null
          responsibilities?: string[]
          slug?: string
          status?: string
          updated_at?: string
          workflows?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "ai_departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analysis_logs: {
        Row: {
          analysis_id: string | null
          created_at: string
          id: string
          level: string
          message: string
          metadata: Json
          organization_id: string
          stage: string | null
          updated_at: string
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          id?: string
          level?: string
          message: string
          metadata?: Json
          organization_id: string
          stage?: string | null
          updated_at?: string
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          id?: string
          level?: string
          message?: string
          metadata?: Json
          organization_id?: string
          stage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_logs_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "document_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_chains: {
        Row: {
          confidence: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          source_document_id: string | null
          steps: Json
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          source_document_id?: string | null
          steps?: Json
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          source_document_id?: string | null
          steps?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_chains_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_chains_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          approver_role: string | null
          approver_user_id: string | null
          created_at: string
          decided_at: string | null
          id: string
          organization_id: string
          reason: string | null
          status: string
          task_id: string
          updated_at: string
        }
        Insert: {
          approver_role?: string | null
          approver_user_id?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          organization_id: string
          reason?: string | null
          status?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          approver_role?: string | null
          approver_user_id?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          organization_id?: string
          reason?: string | null
          status?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      department_configs: {
        Row: {
          allowed_actions: string[]
          allowed_knowledge_sources: string[]
          approval_requirements: Json
          available_tools: string[]
          created_at: string
          department_id: string
          escalation_rules: Json
          id: string
          model_config: Json
          organization_id: string
          system_prompt: string
          updated_at: string
        }
        Insert: {
          allowed_actions?: string[]
          allowed_knowledge_sources?: string[]
          approval_requirements?: Json
          available_tools?: string[]
          created_at?: string
          department_id: string
          escalation_rules?: Json
          id?: string
          model_config?: Json
          organization_id: string
          system_prompt?: string
          updated_at?: string
        }
        Update: {
          allowed_actions?: string[]
          allowed_knowledge_sources?: string[]
          approval_requirements?: Json
          available_tools?: string[]
          created_at?: string
          department_id?: string
          escalation_rules?: Json
          id?: string
          model_config?: Json
          organization_id?: string
          system_prompt?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_configs_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: true
            referencedRelation: "ai_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_analysis: {
        Row: {
          confidence: number | null
          created_at: string
          document_id: string
          error: string | null
          id: string
          model: string | null
          organization_id: string
          progress: number
          result: Json | null
          stage: string | null
          status: string
          summary: string | null
          tokens_used: number | null
          updated_at: string
          warnings: Json
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          document_id: string
          error?: string | null
          id?: string
          model?: string | null
          organization_id: string
          progress?: number
          result?: Json | null
          stage?: string | null
          status?: string
          summary?: string | null
          tokens_used?: number | null
          updated_at?: string
          warnings?: Json
        }
        Update: {
          confidence?: number | null
          created_at?: string
          document_id?: string
          error?: string | null
          id?: string
          model?: string | null
          organization_id?: string
          progress?: number
          result?: Json | null
          stage?: string | null
          status?: string
          summary?: string | null
          tokens_used?: number | null
          updated_at?: string
          warnings?: Json
        }
        Relationships: [
          {
            foreignKeyName: "document_analysis_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_analysis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_size: number | null
          file_url: string | null
          id: string
          mime_type: string | null
          organization_id: string
          storage_path: string | null
          title: string
          updated_at: string
          upload_status: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          organization_id: string
          storage_path?: string | null
          title: string
          updated_at?: string
          upload_status?: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          mime_type?: string | null
          organization_id?: string
          storage_path?: string | null
          title?: string
          updated_at?: string
          upload_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_answers: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          organization_id: string
          question: string
          question_key: string
          updated_at: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          organization_id: string
          question: string
          question_key: string
          updated_at?: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          question?: string
          question_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_answers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_entities: {
        Row: {
          confidence: number | null
          created_at: string
          description: string | null
          entity_type: string
          id: string
          metadata: Json
          name: string
          organization_id: string
          source_document_id: string | null
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          name: string
          organization_id: string
          source_document_id?: string | null
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string
          source_document_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_entities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_entities_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_relationships: {
        Row: {
          created_at: string
          from_entity_id: string
          id: string
          metadata: Json
          organization_id: string
          relationship_type: string
          to_entity_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_entity_id: string
          id?: string
          metadata?: Json
          organization_id: string
          relationship_type: string
          to_entity_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_entity_id?: string
          id?: string
          metadata?: Json
          organization_id?: string
          relationship_type?: string
          to_entity_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_relationships_from_entity_id_fkey"
            columns: ["from_entity_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_relationships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_relationships_to_entity_id_fkey"
            columns: ["to_entity_id"]
            isOneToOne: false
            referencedRelation: "knowledge_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          category: string
          created_at: string
          id: string
          metadata: Json
          organization_id: string
          reference_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          metadata?: Json
          organization_id: string
          reference_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          metadata?: Json
          organization_id?: string
          reference_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_templates: {
        Row: {
          applied_at: string
          created_at: string
          id: string
          organization_id: string
          template_key: string
          template_name: string
          updated_at: string
        }
        Insert: {
          applied_at?: string
          created_at?: string
          id?: string
          organization_id: string
          template_key: string
          template_name: string
          updated_at?: string
        }
        Update: {
          applied_at?: string
          created_at?: string
          id?: string
          organization_id?: string
          template_key?: string
          template_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          company_size: string | null
          contact_email: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          mission: string | null
          name: string
          setup_completed: boolean
          setup_method: string | null
          timezone: string | null
          updated_at: string
          vision: string | null
          website: string | null
        }
        Insert: {
          company_size?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          mission?: string | null
          name: string
          setup_completed?: boolean
          setup_method?: string | null
          timezone?: string | null
          updated_at?: string
          vision?: string | null
          website?: string | null
        }
        Update: {
          company_size?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          mission?: string | null
          name?: string
          setup_completed?: boolean
          setup_method?: string | null
          timezone?: string | null
          updated_at?: string
          vision?: string | null
          website?: string | null
        }
        Relationships: []
      }
      policies: {
        Row: {
          category: string | null
          confidence: number | null
          created_at: string
          description: string | null
          id: string
          organization_id: string
          rules: Json
          source_document_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          confidence?: number | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id: string
          rules?: Json
          source_document_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          confidence?: number | null
          created_at?: string
          description?: string | null
          id?: string
          organization_id?: string
          rules?: Json
          source_document_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policies_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      processes: {
        Row: {
          confidence: number | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          outputs: Json
          source_document_id: string | null
          steps: Json
          triggers: Json
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          outputs?: Json
          source_document_id?: string | null
          steps?: Json
          triggers?: Json
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          outputs?: Json
          source_document_id?: string | null
          steps?: Json
          triggers?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "processes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processes_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          organization_id: string | null
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          confidence: number | null
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          organization_id: string
          responsibilities: Json
          source_document_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          organization_id: string
          responsibilities?: Json
          source_document_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          organization_id?: string
          responsibilities?: Json
          source_document_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roles_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      task_executions: {
        Row: {
          confidence: number | null
          created_at: string
          department_id: string | null
          department_name: string | null
          duration_ms: number | null
          id: string
          order_index: number
          organization_id: string
          reason: string | null
          response: string | null
          task_id: string
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          department_id?: string | null
          department_name?: string | null
          duration_ms?: number | null
          id?: string
          order_index?: number
          organization_id: string
          reason?: string | null
          response?: string | null
          task_id: string
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          department_id?: string | null
          department_name?: string | null
          duration_ms?: number | null
          id?: string
          order_index?: number
          organization_id?: string
          reason?: string | null
          response?: string | null
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_executions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "ai_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_executions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_sources: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          snippet: string | null
          source_id: string | null
          source_type: string
          task_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          snippet?: string | null
          source_id?: string | null
          source_type: string
          task_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          snippet?: string | null
          source_id?: string | null
          source_type?: string
          task_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_sources_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_steps: {
        Row: {
          created_at: string
          id: string
          message: string | null
          order_index: number
          organization_id: string
          stage: string
          status: string
          task_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          order_index?: number
          organization_id: string
          stage: string
          status?: string
          task_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          order_index?: number
          organization_id?: string
          stage?: string
          status?: string
          task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_steps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_steps_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          approval_status: string | null
          confidence: number | null
          created_at: string
          created_by: string | null
          final_response: string | null
          id: string
          organization_id: string
          request: string
          requires_approval: boolean
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approval_status?: string | null
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          final_response?: string | null
          id?: string
          organization_id: string
          request: string
          requires_approval?: boolean
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approval_status?: string | null
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          final_response?: string | null
          id?: string
          organization_id?: string
          request?: string
          requires_approval?: boolean
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_organization_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
