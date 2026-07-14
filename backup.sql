

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cache; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration bigint NOT NULL
);


ALTER TABLE public.cache OWNER TO kawsar;

--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration bigint NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO kawsar;

--
-- Name: comment_likes; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.comment_likes (
    comment_id bigint NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.comment_likes OWNER TO kawsar;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.comments (
    id bigint NOT NULL,
    post_id bigint NOT NULL,
    user_id bigint NOT NULL,
    parent_comment_id bigint,
    reply_to_user_id bigint,
    content text NOT NULL,
    like_count bigint DEFAULT '0'::bigint NOT NULL,
    reply_count bigint DEFAULT '0'::bigint NOT NULL,
    created_at timestamp(0) with time zone,
    updated_at timestamp(0) with time zone,
    deleted_at timestamp(0) with time zone,
    CONSTRAINT comments_content_len CHECK (((char_length(content) > 0) AND (char_length(content) <= 2000)))
);


ALTER TABLE public.comments OWNER TO kawsar;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: kawsar
--

CREATE SEQUENCE public.comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO kawsar;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kawsar
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection character varying(255) NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO kawsar;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: kawsar
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO kawsar;

--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kawsar
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO kawsar;

--
-- Name: jobs; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO kawsar;

--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: kawsar
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO kawsar;

--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kawsar
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO kawsar;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: kawsar
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO kawsar;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kawsar
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.password_reset_tokens (
    email character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO kawsar;

--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.post_likes (
    post_id bigint NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.post_likes OWNER TO kawsar;

--
-- Name: post_media; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.post_media (
    id bigint NOT NULL,
    post_id bigint NOT NULL,
    file_path text NOT NULL,
    media_type character varying(255) DEFAULT 'image'::character varying NOT NULL,
    width integer,
    height integer,
    mime_type character varying(100) NOT NULL,
    file_size bigint NOT NULL,
    duration integer,
    "position" smallint DEFAULT '0'::smallint NOT NULL,
    created_at timestamp(0) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT post_media_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying])::text[])))
);


ALTER TABLE public.post_media OWNER TO kawsar;

--
-- Name: post_media_id_seq; Type: SEQUENCE; Schema: public; Owner: kawsar
--

CREATE SEQUENCE public.post_media_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.post_media_id_seq OWNER TO kawsar;

--
-- Name: post_media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kawsar
--

ALTER SEQUENCE public.post_media_id_seq OWNED BY public.post_media.id;


--
-- Name: posts; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.posts (
    id bigint NOT NULL,
    public_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id bigint NOT NULL,
    content text,
    visibility character varying(255) DEFAULT 'public'::character varying NOT NULL,
    like_count bigint DEFAULT '0'::bigint NOT NULL,
    comment_count bigint DEFAULT '0'::bigint NOT NULL,
    created_at timestamp(0) with time zone,
    updated_at timestamp(0) with time zone,
    deleted_at timestamp(0) with time zone,
    CONSTRAINT posts_content_len CHECK (((content IS NULL) OR (char_length(content) <= 10000))),
    CONSTRAINT posts_visibility_check CHECK (((visibility)::text = ANY ((ARRAY['public'::character varying, 'private'::character varying])::text[])))
);


ALTER TABLE public.posts OWNER TO kawsar;

--
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: kawsar
--

CREATE SEQUENCE public.posts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO kawsar;

--
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kawsar
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO kawsar;

--
-- Name: users; Type: TABLE; Schema: public; Owner: kawsar
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    public_id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email public.citext NOT NULL,
    avatar character varying(255),
    password character varying(255) NOT NULL,
    status character varying(255) DEFAULT 'active'::character varying NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) with time zone,
    updated_at timestamp(0) with time zone,
    deleted_at timestamp(0) with time zone,
    CONSTRAINT users_name_len CHECK (((char_length((first_name)::text) > 0) AND (char_length((last_name)::text) > 0))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'deleted'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO kawsar;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: kawsar
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO kawsar;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: kawsar
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: post_media id; Type: DEFAULT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.post_media ALTER COLUMN id SET DEFAULT nextval('public.post_media_id_seq'::regclass);


--
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.cache (key, value, expiration) FROM stdin;
laravel-cache-bd890bac9579f62302ae6f6f8874f361:timer	i:1784061366;	1784061366
laravel-cache-bd890bac9579f62302ae6f6f8874f361	i:1;	1784061366
laravel-cache-bc0fd8c7d4ad4e2b0dfd04c67448dbe9:timer	i:1784061374;	1784061374
laravel-cache-bc0fd8c7d4ad4e2b0dfd04c67448dbe9	i:2;	1784061374
laravel-cache-2f485f57a842531371c4cfc3e1ec689c:timer	i:1784061592;	1784061592
laravel-cache-2f485f57a842531371c4cfc3e1ec689c	i:2;	1784061592
\.


--
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- Data for Name: comment_likes; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.comment_likes (comment_id, user_id, created_at) FROM stdin;
15	98	2026-07-15 02:35:23+06
14	98	2026-07-15 02:38:53+06
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.comments (id, post_id, user_id, parent_comment_id, reply_to_user_id, content, like_count, reply_count, created_at, updated_at, deleted_at) FROM stdin;
15	63	98	14	98	Hello	1	0	2026-07-15 02:35:21+06	2026-07-15 02:35:23+06	\N
14	63	98	\N	\N	Hello	1	1	2026-07-15 02:35:14+06	2026-07-15 02:38:52+06	\N
\.


--
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
13	default	{"uuid":"44972dd7-fa38-4155-9d1c-75e782fd8eda","displayName":"App\\\\Events\\\\CommentLiked","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"deleteWhenMissingModels":false,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":18:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\CommentLiked\\":3:{s:7:\\"comment\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:18:\\"App\\\\Models\\\\Comment\\";s:2:\\"id\\";i:14;s:9:\\"relations\\";a:0:{}s:10:\\"connection\\";s:5:\\"pgsql\\";s:15:\\"collectionClass\\";N;}s:4:\\"user\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:15:\\"App\\\\Models\\\\User\\";s:2:\\"id\\";i:98;s:9:\\"relations\\";a:0:{}s:10:\\"connection\\";s:5:\\"pgsql\\";s:15:\\"collectionClass\\";N;}s:5:\\"liked\\";b:0;}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:23:\\"deleteWhenMissingModels\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:12:\\"messageGroup\\";N;s:12:\\"deduplicator\\";N;s:13:\\"debounceOwner\\";s:0:\\"\\";s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}","batchId":null},"createdAt":1784061532,"delay":null}	0	\N	1784061532	1784061532
14	default	{"uuid":"196a30bb-2d15-4ee1-bb65-a349af74b753","displayName":"App\\\\Events\\\\CommentLiked","job":"Illuminate\\\\Queue\\\\CallQueuedHandler@call","maxTries":null,"maxExceptions":null,"failOnTimeout":false,"backoff":null,"timeout":null,"retryUntil":null,"deleteWhenMissingModels":false,"data":{"commandName":"Illuminate\\\\Broadcasting\\\\BroadcastEvent","command":"O:38:\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\":18:{s:5:\\"event\\";O:23:\\"App\\\\Events\\\\CommentLiked\\":3:{s:7:\\"comment\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:18:\\"App\\\\Models\\\\Comment\\";s:2:\\"id\\";i:14;s:9:\\"relations\\";a:0:{}s:10:\\"connection\\";s:5:\\"pgsql\\";s:15:\\"collectionClass\\";N;}s:4:\\"user\\";O:45:\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\":5:{s:5:\\"class\\";s:15:\\"App\\\\Models\\\\User\\";s:2:\\"id\\";i:98;s:9:\\"relations\\";a:0:{}s:10:\\"connection\\";s:5:\\"pgsql\\";s:15:\\"collectionClass\\";N;}s:5:\\"liked\\";b:1;}s:5:\\"tries\\";N;s:7:\\"timeout\\";N;s:7:\\"backoff\\";N;s:13:\\"maxExceptions\\";N;s:23:\\"deleteWhenMissingModels\\";N;s:10:\\"connection\\";N;s:5:\\"queue\\";N;s:12:\\"messageGroup\\";N;s:12:\\"deduplicator\\";N;s:13:\\"debounceOwner\\";s:0:\\"\\";s:5:\\"delay\\";N;s:11:\\"afterCommit\\";N;s:10:\\"middleware\\";a:0:{}s:7:\\"chained\\";a:0:{}s:15:\\"chainConnection\\";N;s:10:\\"chainQueue\\";N;s:19:\\"chainCatchCallbacks\\";N;}","batchId":null},"createdAt":1784061532,"delay":null}	0	\N	1784061532	1784061532
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2026_07_10_182952_create_posts_table	1
5	2026_07_10_183709_create_post_media_table	1
6	2026_07_10_184326_create_comments_table	1
7	2026_07_10_184833_create_post_likes_table	1
8	2026_07_10_185208_create_comment_likes_table	1
9	2026_07_14_233112_optimize_comment_cursor_indexes	1
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.password_reset_tokens (email, token, created_at) FROM stdin;
\.


--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.post_likes (post_id, user_id, created_at) FROM stdin;
63	98	2026-07-15 02:35:10+06
\.


--
-- Data for Name: post_media; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.post_media (id, post_id, file_path, media_type, width, height, mime_type, file_size, duration, "position", created_at) FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.posts (id, public_id, user_id, content, visibility, like_count, comment_count, created_at, updated_at, deleted_at) FROM stdin;
63	4a234a44-7137-408d-8734-f098bf95c42c	98	Hello Everyone	public	1	2	2026-07-15 02:35:06+06	2026-07-15 02:35:21+06	\N
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
Ope6P4ZHviVViAOIrX1VPK9uvq6TRzvnfXbu4Vdd	98	127.0.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	eyJfdG9rZW4iOiJ0MzFMS3RsQ3pEc3lnN1hpdll2R1FKVWczTUN4ejk3ZmRQbnJOSlRjIiwidXJsIjpbXSwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAwXC9wb3N0c1wvNGEyMzRhNDQtNzEzNy00MDhkLTg3MzQtZjA5OGJmOTVjNDJjXC9jb21tZW50cyIsInJvdXRlIjoiY29tbWVudHMuaW5kZXgifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119LCJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI6OTh9	1784061535
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: kawsar
--

COPY public.users (id, public_id, first_name, last_name, email, avatar, password, status, remember_token, created_at, updated_at, deleted_at) FROM stdin;
98	6b4d5f00-4d8e-4b97-8538-366ffa036635	Demo	User	demouser@gmail.com	\N	$2y$12$obHRoJwcZwIRibDM8aO6w.xoy7.5xQwyeYf4Y78rW2NMKyZjkwfES	active	\N	2026-07-15 02:34:58+06	2026-07-15 02:34:58+06	\N
\.


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kawsar
--

SELECT pg_catalog.setval('public.comments_id_seq', 15, true);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kawsar
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kawsar
--

SELECT pg_catalog.setval('public.jobs_id_seq', 14, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kawsar
--

SELECT pg_catalog.setval('public.migrations_id_seq', 9, true);


--
-- Name: post_media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kawsar
--

SELECT pg_catalog.setval('public.post_media_id_seq', 5, true);


--
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kawsar
--

SELECT pg_catalog.setval('public.posts_id_seq', 63, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: kawsar
--

SELECT pg_catalog.setval('public.users_id_seq', 98, true);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: comment_likes comment_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_pkey PRIMARY KEY (comment_id, user_id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (email);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (post_id, user_id);


--
-- Name: post_media post_media_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.post_media
    ADD CONSTRAINT post_media_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: posts posts_public_id_unique; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_public_id_unique UNIQUE (public_id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_public_id_unique; Type: CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_public_id_unique UNIQUE (public_id);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: comment_likes_user_idx; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX comment_likes_user_idx ON public.comment_likes USING btree (user_id, created_at DESC);


--
-- Name: comments_parent_cursor_idx; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX comments_parent_cursor_idx ON public.comments USING btree (parent_comment_id, created_at, id) WHERE (deleted_at IS NULL);


--
-- Name: comments_post_top_level_cursor_idx; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX comments_post_top_level_cursor_idx ON public.comments USING btree (post_id, created_at DESC, id DESC) WHERE ((parent_comment_id IS NULL) AND (deleted_at IS NULL));


--
-- Name: comments_user_idx; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX comments_user_idx ON public.comments USING btree (user_id);


--
-- Name: failed_jobs_connection_queue_failed_at_index; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX failed_jobs_connection_queue_failed_at_index ON public.failed_jobs USING btree (connection, queue, failed_at);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: post_likes_user_idx; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX post_likes_user_idx ON public.post_likes USING btree (user_id, created_at DESC);


--
-- Name: post_media_post_idx; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX post_media_post_idx ON public.post_media USING btree (post_id, "position");


--
-- Name: posts_public_feed_idx; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX posts_public_feed_idx ON public.posts USING btree (created_at DESC, id DESC) WHERE (((visibility)::text = 'public'::text) AND (deleted_at IS NULL));


--
-- Name: posts_user_idx; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX posts_user_idx ON public.posts USING btree (user_id, created_at DESC) WHERE (deleted_at IS NULL);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: users_email_unique; Type: INDEX; Schema: public; Owner: kawsar
--

CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email) WHERE (deleted_at IS NULL);


--
-- Name: comment_likes comment_likes_comment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_comment_id_foreign FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comment_likes comment_likes_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_parent_comment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_comment_id_foreign FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comments comments_post_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_foreign FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: comments comments_reply_to_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_reply_to_user_id_foreign FOREIGN KEY (reply_to_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: comments comments_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_post_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_foreign FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_media post_media_post_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.post_media
    ADD CONSTRAINT post_media_post_id_foreign FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: posts posts_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: kawsar
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO kawsar;


--
-- PostgreSQL database dump complete
--

\unrestrict 5XK7eroT6yBot8a7bbihdrzAJ9tVZzYqIh5QpuQ7NzneyeeUDR6q3PBe5fPAtlN

