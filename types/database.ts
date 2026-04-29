export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          credits: number
          average_rating: number | null
          total_sessions: number | null
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          credits?: number
          average_rating?: number | null
          total_sessions?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          credits?: number
          average_rating?: number | null
          total_sessions?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      skills: {
        Row: {
          id: string
          user_id: string
          skill_name: string
          type: Database["public"]["Enums"]["skill_type"]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skill_name: string
          type: Database["public"]["Enums"]["skill_type"]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skill_name?: string
          type?: Database["public"]["Enums"]["skill_type"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      sessions: {
        Row: {
          id: string
          teacher_id: string
          learner_id: string
          status: Database["public"]["Enums"]["session_status"]
          created_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          teacher_id: string
          learner_id: string
          status?: Database["public"]["Enums"]["session_status"]
          created_at?: string
          ended_at?: string | null
        }
        Update: {
          id?: string
          teacher_id?: string
          learner_id?: string
          status?: Database["public"]["Enums"]["session_status"]
          created_at?: string
          ended_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          session_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          feedback?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      skill_type: "offered" | "desired"
      session_status: "pending" | "active" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
