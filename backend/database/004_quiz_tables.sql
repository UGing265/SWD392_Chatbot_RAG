-- Migration: Create Quiz Tables
-- Description: Adds tables for AI Generated Quizzes

-- 1. quizzes
CREATE TABLE public.quizzes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    lecturer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title character varying(300) NOT NULL,
    description text,
    status character varying(30) DEFAULT 'draft'::character varying NOT NULL, -- 'draft', 'published', 'archived'
    total_questions integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.quizzes ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);

-- 2. quiz_questions
CREATE TABLE public.quiz_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_type character varying(30) DEFAULT 'single_choice'::character varying NOT NULL, -- 'single_choice', 'multiple_choice', 'true_false'
    content text NOT NULL,
    explanation text,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.quiz_questions ADD CONSTRAINT quiz_questions_pkey PRIMARY KEY (id);

-- 3. quiz_options
CREATE TABLE public.quiz_options (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    content text NOT NULL,
    is_correct boolean DEFAULT false NOT NULL,
    order_index integer DEFAULT 0 NOT NULL
);

ALTER TABLE ONLY public.quiz_options ADD CONSTRAINT quiz_options_pkey PRIMARY KEY (id);

-- 4. quiz_attempts
CREATE TABLE public.quiz_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    score numeric(5, 2) DEFAULT 0 NOT NULL,
    total_correct integer DEFAULT 0 NOT NULL,
    is_preview boolean DEFAULT false NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);

ALTER TABLE ONLY public.quiz_attempts ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);

-- 5. quiz_attempt_answers
CREATE TABLE public.quiz_attempt_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    attempt_id uuid NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    selected_option_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    is_correct boolean DEFAULT false NOT NULL
);

ALTER TABLE ONLY public.quiz_attempt_answers ADD CONSTRAINT quiz_attempt_answers_pkey PRIMARY KEY (id);

-- 6. quiz_generation_jobs
CREATE TABLE public.quiz_generation_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    lecturer_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
    progress integer DEFAULT 0 NOT NULL,
    result_quiz_id uuid REFERENCES public.quizzes(id) ON DELETE SET NULL,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.quiz_generation_jobs ADD CONSTRAINT quiz_generation_jobs_pkey PRIMARY KEY (id);

-- Indexes for performance
CREATE INDEX idx_quizzes_subject_id ON public.quizzes(subject_id);
CREATE INDEX idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX idx_quiz_options_question_id ON public.quiz_options(question_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempt_answers_attempt_id ON public.quiz_attempt_answers(attempt_id);
