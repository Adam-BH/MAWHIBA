
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "ai_bio_requests": {
                  Row: {
                    "coach_id": string,"created_at": string,"id": number
                  }
                  Insert: {
                    "coach_id": string,"created_at"?: string,"id"?: never
                  }
                  Update: {
                    "coach_id"?: string,"created_at"?: string,"id"?: never
                  }
                  Relationships: [
                    {
      foreignKeyName: "ai_bio_requests_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "ai_bio_requests_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"athletic_achievements": {
                  Row: {
                    "coach_id": string,"competition": string,"id": string,"level": Database["public"]['Enums']["achievement_level"],"proof_path": string | null,"result": string,"sort": number,"sport": string,"title": string,"verified": boolean,"year": number
                  }
                  Insert: {
                    "coach_id": string,"competition"?: string,"id"?: string,"level": Database["public"]['Enums']["achievement_level"],"proof_path"?: string | null,"result"?: string,"sort"?: number,"sport": string,"title": string,"verified"?: boolean,"year": number
                  }
                  Update: {
                    "coach_id"?: string,"competition"?: string,"id"?: string,"level"?: Database["public"]['Enums']["achievement_level"],"proof_path"?: string | null,"result"?: string,"sort"?: number,"sport"?: string,"title"?: string,"verified"?: boolean,"year"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "athletic_achievements_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_cv_stats"
      referencedColumns: ["coach_id"]
    },{
      foreignKeyName: "athletic_achievements_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"bookings": {
                  Row: {
                    "client_id": string,"coach_id": string,"created_at": string,"id": string,"insurance_fee": number,"note": string | null,"offer_id": string | null,"price": number,"proposal_id": string | null,"request_id": string | null,"slot_id": string,"status": Database["public"]['Enums']["booking_status"],"updated_at": string
                  }
                  Insert: {
                    "client_id": string,"coach_id": string,"created_at"?: string,"id"?: string,"insurance_fee": number,"note"?: string | null,"offer_id"?: string | null,"price": number,"proposal_id"?: string | null,"request_id"?: string | null,"slot_id": string,"status"?: Database["public"]['Enums']["booking_status"],"updated_at"?: string
                  }
                  Update: {
                    "client_id"?: string,"coach_id"?: string,"created_at"?: string,"id"?: string,"insurance_fee"?: number,"note"?: string | null,"offer_id"?: string | null,"price"?: number,"proposal_id"?: string | null,"request_id"?: string | null,"slot_id"?: string,"status"?: Database["public"]['Enums']["booking_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "bookings_client_id_fkey"
      columns: ["client_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bookings_client_id_fkey"
      columns: ["client_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bookings_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bookings_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bookings_offer_id_fkey"
      columns: ["offer_id"]
isOneToOne: false
      referencedRelation: "offers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bookings_proposal_id_fkey"
      columns: ["proposal_id"]
isOneToOne: false
      referencedRelation: "proposals"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bookings_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "request_board"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bookings_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bookings_slot_id_fkey"
      columns: ["slot_id"]
isOneToOne: false
      referencedRelation: "slots"
      referencedColumns: ["id"]
    }
                  ]
                },"certifications": {
                  Row: {
                    "answer_key": (number)[],"description": string,"id": string,"lessons": NonNullable<Json>,"pass_score": number,"quiz": NonNullable<Json>,"slug": string,"title": string
                  }
                  Insert: {
                    "answer_key"?: (number)[],"description"?: string,"id"?: string,"lessons"?: NonNullable<Json>,"pass_score": number,"quiz"?: NonNullable<Json>,"slug": string,"title": string
                  }
                  Update: {
                    "answer_key"?: (number)[],"description"?: string,"id"?: string,"lessons"?: NonNullable<Json>,"pass_score"?: number,"quiz"?: NonNullable<Json>,"slug"?: string,"title"?: string
                  }
                  Relationships: [
                    
                  ]
                },"coach_certifications": {
                  Row: {
                    "certification_id": string,"coach_id": string,"completed_at": string,"passed": boolean,"score": number
                  }
                  Insert: {
                    "certification_id": string,"coach_id": string,"completed_at"?: string,"passed": boolean,"score": number
                  }
                  Update: {
                    "certification_id"?: string,"coach_id"?: string,"completed_at"?: string,"passed"?: boolean,"score"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "coach_certifications_certification_id_fkey"
      columns: ["certification_id"]
isOneToOne: false
      referencedRelation: "certifications"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "coach_certifications_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "coach_certifications_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"coach_profiles": {
                  Row: {
                    "achievements": string | null,"athlete_status": Database["public"]['Enums']["athlete_status"] | null,"bio": string | null,"builder_step": number,"cover_path": string | null,"cv_public": boolean,"cv_template": string,"headline": string | null,"highest_level": Database["public"]['Enums']["achievement_level"] | null,"languages": (string)[],"price_per_session": number,"primary_sport": string | null,"proof_path": string | null,"published_at": string | null,"rating_avg": number,"rating_count": number,"session_duration_min": number,"slug": string | null,"socials": NonNullable<Json>,"specialties": (string)[],"sports": (string)[],"tagline": string | null,"user_id": string,"verified": boolean,"video_url": string | null,"years_coaching": number | null,"years_practice": number | null,"zones": (string)[]
                  }
                  Insert: {
                    "achievements"?: string | null,"athlete_status"?: Database["public"]['Enums']["athlete_status"] | null,"bio"?: string | null,"builder_step"?: number,"cover_path"?: string | null,"cv_public"?: boolean,"cv_template"?: string,"headline"?: string | null,"highest_level"?: Database["public"]['Enums']["achievement_level"] | null,"languages"?: (string)[],"price_per_session"?: number,"primary_sport"?: string | null,"proof_path"?: string | null,"published_at"?: string | null,"rating_avg"?: number,"rating_count"?: number,"session_duration_min"?: number,"slug"?: string | null,"socials"?: NonNullable<Json>,"specialties"?: (string)[],"sports"?: (string)[],"tagline"?: string | null,"user_id": string,"verified"?: boolean,"video_url"?: string | null,"years_coaching"?: number | null,"years_practice"?: number | null,"zones"?: (string)[]
                  }
                  Update: {
                    "achievements"?: string | null,"athlete_status"?: Database["public"]['Enums']["athlete_status"] | null,"bio"?: string | null,"builder_step"?: number,"cover_path"?: string | null,"cv_public"?: boolean,"cv_template"?: string,"headline"?: string | null,"highest_level"?: Database["public"]['Enums']["achievement_level"] | null,"languages"?: (string)[],"price_per_session"?: number,"primary_sport"?: string | null,"proof_path"?: string | null,"published_at"?: string | null,"rating_avg"?: number,"rating_count"?: number,"session_duration_min"?: number,"slug"?: string | null,"socials"?: NonNullable<Json>,"specialties"?: (string)[],"sports"?: (string)[],"tagline"?: string | null,"user_id"?: string,"verified"?: boolean,"video_url"?: string | null,"years_coaching"?: number | null,"years_practice"?: number | null,"zones"?: (string)[]
                  }
                  Relationships: [
                    {
      foreignKeyName: "coach_profiles_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "coach_profiles_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"coaching_experiences": {
                  Row: {
                    "coach_id": string,"description": string,"end_date": string | null,"id": string,"organization": string,"role": string,"sort": number,"start_date": string
                  }
                  Insert: {
                    "coach_id": string,"description"?: string,"end_date"?: string | null,"id"?: string,"organization": string,"role": string,"sort"?: number,"start_date": string
                  }
                  Update: {
                    "coach_id"?: string,"description"?: string,"end_date"?: string | null,"id"?: string,"organization"?: string,"role"?: string,"sort"?: number,"start_date"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "coaching_experiences_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_cv_stats"
      referencedColumns: ["coach_id"]
    },{
      foreignKeyName: "coaching_experiences_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"education": {
                  Row: {
                    "coach_id": string,"degree": string,"id": string,"school": string,"year": number
                  }
                  Insert: {
                    "coach_id": string,"degree": string,"id"?: string,"school": string,"year": number
                  }
                  Update: {
                    "coach_id"?: string,"degree"?: string,"id"?: string,"school"?: string,"year"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "education_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_cv_stats"
      referencedColumns: ["coach_id"]
    },{
      foreignKeyName: "education_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"external_certifications": {
                  Row: {
                    "coach_id": string,"created_at": string,"file_path": string | null,"id": string,"issuer": string,"title": string,"verified": boolean,"year": number
                  }
                  Insert: {
                    "coach_id": string,"created_at"?: string,"file_path"?: string | null,"id"?: string,"issuer": string,"title": string,"verified"?: boolean,"year": number
                  }
                  Update: {
                    "coach_id"?: string,"created_at"?: string,"file_path"?: string | null,"id"?: string,"issuer"?: string,"title"?: string,"verified"?: boolean,"year"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "external_certifications_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_cv_stats"
      referencedColumns: ["coach_id"]
    },{
      foreignKeyName: "external_certifications_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"offers": {
                  Row: {
                    "audience": Database["public"]['Enums']["offer_audience"],"coach_id": string,"created_at": string,"description": string,"duration_min": number,"id": string,"is_active": boolean,"is_inclusive": boolean,"price": number,"sport": string,"title": string,"updated_at": string
                  }
                  Insert: {
                    "audience"?: Database["public"]['Enums']["offer_audience"],"coach_id": string,"created_at"?: string,"description"?: string,"duration_min": number,"id"?: string,"is_active"?: boolean,"is_inclusive"?: boolean,"price": number,"sport": string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "audience"?: Database["public"]['Enums']["offer_audience"],"coach_id"?: string,"created_at"?: string,"description"?: string,"duration_min"?: number,"id"?: string,"is_active"?: boolean,"is_inclusive"?: boolean,"price"?: number,"sport"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "offers_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_cv_stats"
      referencedColumns: ["coach_id"]
    },{
      foreignKeyName: "offers_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"city": string | null,"created_at": string,"email": string | null,"full_name": string,"id": string,"phone": string | null,"role": Database["public"]['Enums']["user_role"]
                  }
                  Insert: {
                    "avatar_url"?: string | null,"city"?: string | null,"created_at"?: string,"email"?: string | null,"full_name"?: string,"id": string,"phone"?: string | null,"role"?: Database["public"]['Enums']["user_role"]
                  }
                  Update: {
                    "avatar_url"?: string | null,"city"?: string | null,"created_at"?: string,"email"?: string | null,"full_name"?: string,"id"?: string,"phone"?: string | null,"role"?: Database["public"]['Enums']["user_role"]
                  }
                  Relationships: [
                    
                  ]
                },"proposals": {
                  Row: {
                    "coach_id": string,"created_at": string,"id": string,"message": string,"price": number,"request_id": string,"slot_id": string,"status": Database["public"]['Enums']["proposal_status"],"updated_at": string
                  }
                  Insert: {
                    "coach_id": string,"created_at"?: string,"id"?: string,"message"?: string,"price": number,"request_id": string,"slot_id": string,"status"?: Database["public"]['Enums']["proposal_status"],"updated_at"?: string
                  }
                  Update: {
                    "coach_id"?: string,"created_at"?: string,"id"?: string,"message"?: string,"price"?: number,"request_id"?: string,"slot_id"?: string,"status"?: Database["public"]['Enums']["proposal_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "proposals_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_cv_stats"
      referencedColumns: ["coach_id"]
    },{
      foreignKeyName: "proposals_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_profiles"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "proposals_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "request_board"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "proposals_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "proposals_slot_id_fkey"
      columns: ["slot_id"]
isOneToOne: false
      referencedRelation: "slots"
      referencedColumns: ["id"]
    }
                  ]
                },"requests": {
                  Row: {
                    "audience": Database["public"]['Enums']["request_audience"],"budget_max": number,"budget_min": number,"child_age": number | null,"city": string,"client_id": string,"created_at": string,"description": string,"expires_at": string,"id": string,"level": Database["public"]['Enums']["skill_level"],"schedule_note": string,"special_needs": boolean,"special_needs_note": string | null,"sport": string,"status": Database["public"]['Enums']["request_status"],"title": string,"updated_at": string
                  }
                  Insert: {
                    "audience": Database["public"]['Enums']["request_audience"],"budget_max": number,"budget_min": number,"child_age"?: number | null,"city": string,"client_id": string,"created_at"?: string,"description": string,"expires_at"?: string,"id"?: string,"level": Database["public"]['Enums']["skill_level"],"schedule_note"?: string,"special_needs"?: boolean,"special_needs_note"?: string | null,"sport": string,"status"?: Database["public"]['Enums']["request_status"],"title": string,"updated_at"?: string
                  }
                  Update: {
                    "audience"?: Database["public"]['Enums']["request_audience"],"budget_max"?: number,"budget_min"?: number,"child_age"?: number | null,"city"?: string,"client_id"?: string,"created_at"?: string,"description"?: string,"expires_at"?: string,"id"?: string,"level"?: Database["public"]['Enums']["skill_level"],"schedule_note"?: string,"special_needs"?: boolean,"special_needs_note"?: string | null,"sport"?: string,"status"?: Database["public"]['Enums']["request_status"],"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "requests_client_id_fkey"
      columns: ["client_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "requests_client_id_fkey"
      columns: ["client_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"reviews": {
                  Row: {
                    "booking_id": string,"client_id": string,"coach_id": string,"comment": string | null,"created_at": string,"id": string,"rating": number
                  }
                  Insert: {
                    "booking_id": string,"client_id": string,"coach_id": string,"comment"?: string | null,"created_at"?: string,"id"?: string,"rating": number
                  }
                  Update: {
                    "booking_id"?: string,"client_id"?: string,"coach_id"?: string,"comment"?: string | null,"created_at"?: string,"id"?: string,"rating"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "reviews_booking_id_fkey"
      columns: ["booking_id"]
isOneToOne: true
      referencedRelation: "bookings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_client_id_fkey"
      columns: ["client_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_client_id_fkey"
      columns: ["client_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"slots": {
                  Row: {
                    "coach_id": string,"ends_at": string,"id": string,"is_booked": boolean,"location": string,"starts_at": string
                  }
                  Insert: {
                    "coach_id": string,"ends_at": string,"id"?: string,"is_booked"?: boolean,"location": string,"starts_at": string
                  }
                  Update: {
                    "coach_id"?: string,"ends_at"?: string,"id"?: string,"is_booked"?: boolean,"location"?: string,"starts_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "slots_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_cv_stats"
      referencedColumns: ["coach_id"]
    },{
      foreignKeyName: "slots_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "coach_profiles"
      referencedColumns: ["user_id"]
    }
                  ]
                },"wallet_tx": {
                  Row: {
                    "amount": number,"booking_id": string | null,"created_at": string,"id": string,"meta": NonNullable<Json>,"owner_id": string | null,"system_account": string | null,"type": Database["public"]['Enums']["tx_type"]
                  }
                  Insert: {
                    "amount": number,"booking_id"?: string | null,"created_at"?: string,"id"?: string,"meta"?: NonNullable<Json>,"owner_id"?: string | null,"system_account"?: string | null,"type": Database["public"]['Enums']["tx_type"]
                  }
                  Update: {
                    "amount"?: number,"booking_id"?: string | null,"created_at"?: string,"id"?: string,"meta"?: NonNullable<Json>,"owner_id"?: string | null,"system_account"?: string | null,"type"?: Database["public"]['Enums']["tx_type"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "wallet_tx_booking_id_fkey"
      columns: ["booking_id"]
isOneToOne: false
      referencedRelation: "bookings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wallet_tx_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wallet_tx_owner_id_fkey"
      columns: ["owner_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"withdrawals": {
                  Row: {
                    "amount": number,"coach_id": string,"created_at": string,"id": string,"processed_at": string | null,"status": Database["public"]['Enums']["withdrawal_status"]
                  }
                  Insert: {
                    "amount": number,"coach_id": string,"created_at"?: string,"id"?: string,"processed_at"?: string | null,"status"?: Database["public"]['Enums']["withdrawal_status"]
                  }
                  Update: {
                    "amount"?: number,"coach_id"?: string,"created_at"?: string,"id"?: string,"processed_at"?: string | null,"status"?: Database["public"]['Enums']["withdrawal_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "withdrawals_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "withdrawals_coach_id_fkey"
      columns: ["coach_id"]
isOneToOne: false
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "coach_cv_stats": {
                  Row: {
                    "badges": Json | null,"coach_id": string | null,"completed_sessions": number | null,"distinct_clients": number | null,"member_since": string | null,"rating_avg": number | null,"rating_count": number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "coach_profiles_user_id_fkey"
      columns: ["coach_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "coach_profiles_user_id_fkey"
      columns: ["coach_id"]
isOneToOne: true
      referencedRelation: "public_profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"public_profiles": {
                  Row: {
                    "avatar_url": string | null,"city": string | null,"full_name": string | null,"id": string | null
                  }
                  Insert: {
                           "avatar_url"?: string | null,"city"?: string | null,"full_name"?: string | null,"id"?: string | null
                         }
                        Update: {
                           "avatar_url"?: string | null,"city"?: string | null,"full_name"?: string | null,"id"?: string | null
                         }
                        Relationships: [
                    
                  ]
                },"request_board": {
                  Row: {
                    "audience": Database["public"]['Enums']["request_audience"] | null,"budget_max": number | null,"budget_min": number | null,"child_age": number | null,"city": string | null,"client_first_name": string | null,"created_at": string | null,"description": string | null,"expires_at": string | null,"id": string | null,"level": Database["public"]['Enums']["skill_level"] | null,"proposals_count": number | null,"schedule_note": string | null,"special_needs": boolean | null,"special_needs_note": string | null,"sport": string | null,"status": Database["public"]['Enums']["request_status"] | null,"title": string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "_balance":
{ Args: { "p_uid": string }; Returns: number
                           },
"_lock_wallet":
{ Args: { "p_uid": string }; Returns: undefined
                           },
"_refund_booking":
{ Args: { "p_booking": Database["public"]['Tables']["bookings"]['Row'],"p_status": Database["public"]['Enums']["booking_status"] }; Returns: undefined
                           },
"accept_proposal":
{ Args: { "proposal_id": string }; Returns: string
                           },
"admin_credit":
{ Args: { "amount": number,"reason": string,"user_id": string }; Returns: undefined
                           },
"admin_metrics":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"admin_process_withdrawal":
{ Args: { "approve": boolean,"id": string }; Returns: undefined
                           },
"admin_set_coach_verified":
{ Args: { "coach_id": string,"verified": boolean }; Returns: undefined
                           },
"admin_verify_achievement":
{ Args: { "id": string,"verified": boolean }; Returns: undefined
                           },
"admin_verify_certification":
{ Args: { "id": string,"verified": boolean }; Returns: undefined
                           },
"assert_role":
{ Args: { "p_roles": (Database["public"]['Enums']["user_role"])[] }; Returns: string
                           },
"auth_role":
{ Args: Record<PropertyKey, never>; Returns: Database["public"]['Enums']["user_role"]
                           },
"book_slot":
{ Args: { "note"?: string,"offer_id"?: string,"slot_id": string }; Returns: string
                           },
"cancel_booking":
{ Args: { "booking_id": string }; Returns: undefined
                           },
"close_request":
{ Args: { "request_id": string }; Returns: undefined
                           },
"coach_cv_visible":
{ Args: { "p_coach": string }; Returns: boolean
                           },
"coach_share":
{ Args: { "p_price": number }; Returns: number
                           },
"complete_booking":
{ Args: { "booking_id": string }; Returns: undefined
                           },
"consume_ai_bio_quota":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"create_proposal":
{ Args: { "message": string,"price": number,"request_id": string,"slot_id": string }; Returns: string
                           },
"create_request":
{ Args: { "audience": Database["public"]['Enums']["request_audience"],"budget_max": number,"budget_min": number,"child_age": number,"city": string,"description": string,"level": Database["public"]['Enums']["skill_level"],"schedule_note": string,"special_needs": boolean,"special_needs_note": string,"sport": string,"title": string }; Returns: string
                           },
"has_contact_info":
{ Args: { "p_text": string }; Returns: boolean
                           },
"has_inclusive_badge":
{ Args: { "p_coach": string }; Returns: boolean
                           },
"insurance_fee":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_verified_coach":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"request_withdrawal":
{ Args: { "amount": number }; Returns: string
                           },
"respond_booking":
{ Args: { "accept": boolean,"booking_id": string }; Returns: undefined
                           },
"slugify":
{ Args: { "p_text": string }; Returns: string
                           },
"split_payout":
{ Args: { "p_price": number }; Returns: {
              "coach": number,"platform": number,"star": number,"total": number
            }[]
                           },
"submit_quiz":
{ Args: { "answers": Json,"slug": string }; Returns: Json
                           },
"topup_wallet":
{ Args: { "pack_id": string }; Returns: number
                           },
"unique_coach_slug":
{ Args: { "p_coach": string,"p_name": string }; Returns: string
                           },
"wallet_balance":
{ Args: { "uid": string }; Returns: number
                           },
"withdraw_proposal":
{ Args: { "proposal_id": string }; Returns: undefined
                           }
          }
          Enums: {
            "achievement_level": "local"|"regional"|"national"|"international"|"olympique","athlete_status": "actif"|"retraite"|"amateur","booking_status": "pending"|"confirmed"|"declined"|"cancelled"|"completed","offer_audience": "enfants"|"adultes"|"tous","proposal_status": "pending"|"accepted"|"rejected"|"withdrawn","request_audience": "enfant"|"adulte","request_status": "open"|"fulfilled"|"closed"|"expired","skill_level": "debutant"|"intermediaire"|"avance","tx_type": "topup"|"booking_hold"|"booking_refund"|"coach_payout"|"commission"|"insurance"|"withdrawal"|"admin_credit","user_role": "client"|"coach"|"admin","withdrawal_status": "pending"|"paid"|"rejected"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "achievement_level": ["local", "regional", "national", "international", "olympique"],"athlete_status": ["actif", "retraite", "amateur"],"booking_status": ["pending", "confirmed", "declined", "cancelled", "completed"],"offer_audience": ["enfants", "adultes", "tous"],"proposal_status": ["pending", "accepted", "rejected", "withdrawn"],"request_audience": ["enfant", "adulte"],"request_status": ["open", "fulfilled", "closed", "expired"],"skill_level": ["debutant", "intermediaire", "avance"],"tx_type": ["topup", "booking_hold", "booking_refund", "coach_payout", "commission", "insurance", "withdrawal", "admin_credit"],"user_role": ["client", "coach", "admin"],"withdrawal_status": ["pending", "paid", "rejected"]
          }
        }
} as const
