export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      hashtags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          usage_count: number
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          usage_count?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          usage_count?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hashtags_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      linkedin_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: string
          linkedin_profile_url: string | null
          linkedin_user_id: string | null
          refresh_token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: string
          linkedin_profile_url?: string | null
          linkedin_user_id?: string | null
          refresh_token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          linkedin_profile_url?: string | null
          linkedin_user_id?: string | null
          refresh_token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "linkedin_tokens_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_hashtags: {
        Row: {
          hashtag_id: string
          post_id: string
        }
        Insert: {
          hashtag_id: string
          post_id: string
        }
        Update: {
          hashtag_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_hashtags_post_id_fkey"
            columns: ["post_id"]
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          platform: string | null
          recording_id: string | null
          scheduled_for: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          hook: string | null
          body: string | null
          call_to_action: string | null
          hashtags: string[] | null
          is_posted: boolean | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          platform?: string | null
          recording_id?: string | null
          scheduled_for?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          hook?: string | null
          body?: string | null
          call_to_action?: string | null
          hashtags?: string[] | null
          is_posted?: boolean | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          platform?: string | null
          recording_id?: string | null
          scheduled_for?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          hook?: string | null
          body?: string | null
          call_to_action?: string | null
          hashtags?: string[] | null
          is_posted?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_recording_id_fkey"
            columns: ["recording_id"]
            referencedRelation: "recordings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recordings: {
        Row: {
          audio_url: string | null
          created_at: string | null
          duration: number | null
          id: string
          status: string | null
          title: string | null
          transcript: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          status?: string | null
          title?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          status?: string | null
          title?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recordings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Recording = Database["public"]["Tables"]["recordings"]["Row"]
export type Post = Database["public"]["Tables"]["posts"]["Row"]
export type Hashtag = Database["public"]["Tables"]["hashtags"]["Row"]
export type PostHashtag = Database["public"]["Tables"]["post_hashtags"]["Row"]
export type LinkedInToken = Database["public"]["Tables"]["linkedin_tokens"]["Row"]

export type RecordingStatus = "pending" | "processing" | "completed" | "failed" | "transcribing" | "generating"
export type PostStatus = "draft" | "scheduled" | "posted" | "archived"
export type Platform = "linkedin" | "twitter" | "facebook" | "instagram"
