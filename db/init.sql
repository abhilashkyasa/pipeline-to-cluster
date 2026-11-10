create extension if not exists pgcrypto;

create table if not exists app_users (
  id serial primary key,
  username text unique not null,
  password_hash text not null,
  full_name text
);
create table if not exists pipelines (
  id serial primary key, name text not null, status text not null,
  branch text not null, duration_sec int not null, last_run timestamptz not null
);
create table if not exists insights (
  id serial primary key, title text not null, metric text not null,
  value numeric not null, trend numeric not null
);
create table if not exists daily_stats (
  day date primary key, builds int not null, failures int not null, deploys int not null
);

insert into app_users (username, password_hash)
values ('admin', crypt('SuperIntel@123', gen_salt('bf')))
on conflict (username) do nothing;

insert into pipelines (name, status, branch, duration_sec, last_run)
select * from (values
  ('superintel-web','success','main',312, now() - interval '1 hour'),
  ('superintel-api','running','develop',188, now() - interval '10 minutes'),
  ('model-trainer','failed','feature/gpu',903, now() - interval '3 hours'),
  ('data-ingest','success','main',145, now() - interval '5 hours'),
  ('inference-gateway','success','release/2.4',421, now() - interval '8 hours'),
  ('feature-store','failed','main',260, now() - interval '12 hours')
) v where not exists (select 1 from pipelines);

insert into insights (title, metric, value, trend)
select * from (values
  ('Deployment frequency','deploys/day',14,12),
  ('Change failure rate','%',6.4,-2.1),
  ('Lead time for changes','hours',3.2,-18),
  ('Mean time to recovery','minutes',27,-9)
) v where not exists (select 1 from insights);

insert into daily_stats (day, builds, failures, deploys)
select current_date - g, 30 + (g*7)%17, 2 + (g*3)%5, 10 + (g*5)%8
from generate_series(0,13) g
on conflict (day) do nothing;
