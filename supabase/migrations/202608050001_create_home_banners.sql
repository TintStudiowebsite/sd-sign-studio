create table if not exists public.banner_settings (
  banner_type text primary key check (banner_type in ('desktop', 'mobile')),
  headline text not null,
  subheadline text not null,
  is_enabled boolean not null default true,
  transition_ms integer not null default 5000 check (transition_ms between 1000 and 60000),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists public.banner_media (
  id uuid primary key default gen_random_uuid(),
  banner_type text not null references public.banner_settings(banner_type) on delete cascade,
  cloudinary_asset_id text,
  cloudinary_public_id text not null,
  secure_url text not null check (secure_url ~ '^https://'),
  resource_type text not null check (resource_type in ('image', 'video')),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  format text not null,
  bytes bigint not null check (bytes >= 0),
  duration_seconds numeric,
  sort_order integer not null check (sort_order >= 0),
  headline text not null default '',
  description text not null default '',
  alt_text text not null default '',
  created_at timestamptz not null default now(),
  constraint banner_media_exact_aspect_ratio check (
    (banner_type = 'desktop' and width * 9 = height * 16)
    or
    (banner_type = 'mobile' and width * 5 = height * 4)
  ),
  unique (banner_type, sort_order),
  unique (resource_type, cloudinary_public_id)
);

create index if not exists banner_media_banner_type_idx
  on public.banner_media (banner_type, sort_order);

insert into public.banner_settings (banner_type, headline, subheadline, is_enabled)
values
  (
    'desktop',
    'We design, print, and install your brand everywhere.',
    'Glasgow''s premier vehicle wrapping, storefront signage, and custom print fabrication agency. Built to make your brand unmissable.',
    false
  ),
  (
    'mobile',
    'We design, print, and install your brand everywhere.',
    'Glasgow''s premier vehicle wrapping, storefront signage, and custom print fabrication agency. Built to make your brand unmissable.',
    false
  )
on conflict (banner_type) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.banner_settings enable row level security;
alter table public.banner_media enable row level security;

drop policy if exists "public_read_enabled_banner_settings" on public.banner_settings;
create policy "public_read_enabled_banner_settings"
  on public.banner_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "admin_manage_banner_settings" on public.banner_settings;
create policy "admin_manage_banner_settings"
  on public.banner_settings
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "public_read_enabled_banner_media" on public.banner_media;
create policy "public_read_enabled_banner_media"
  on public.banner_media
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.banner_settings
      where banner_settings.banner_type = banner_media.banner_type
        and banner_settings.is_enabled = true
    )
  );

drop policy if exists "admin_manage_banner_media" on public.banner_media;
create policy "admin_manage_banner_media"
  on public.banner_media
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create or replace function public.publish_home_banner(
  p_banner_type text,
  p_headline text,
  p_subheadline text,
  p_is_enabled boolean,
  p_transition_ms integer,
  p_media jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_position bigint;
  v_width integer;
  v_height integer;
  v_resource_type text;
  v_secure_url text;
  v_public_id text;
  v_media_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Administrator access is required' using errcode = '42501';
  end if;

  if p_banner_type not in ('desktop', 'mobile') then
    raise exception 'Unsupported banner type: %', p_banner_type using errcode = '22023';
  end if;

  if nullif(trim(p_headline), '') is null then
    raise exception 'Banner headline is required' using errcode = '23502';
  end if;

  if p_transition_ms not between 1000 and 60000 then
    raise exception 'Transition duration must be between 1000 and 60000 milliseconds' using errcode = '22023';
  end if;

  if jsonb_typeof(p_media) <> 'array' then
    raise exception 'Banner media must be a JSON array' using errcode = '22023';
  end if;

  if jsonb_array_length(p_media) > 8 then
    raise exception 'A banner can contain at most 8 media items' using errcode = '22023';
  end if;

  for v_item, v_position in
    select value, ordinality
    from jsonb_array_elements(p_media) with ordinality
  loop
    v_width := (v_item ->> 'width')::integer;
    v_height := (v_item ->> 'height')::integer;
    v_resource_type := v_item ->> 'resourceType';
    v_secure_url := v_item ->> 'secureUrl';
    v_public_id := v_item ->> 'publicId';

    if v_resource_type not in ('image', 'video') then
      raise exception 'Media item % has an unsupported resource type', v_position using errcode = '22023';
    end if;

    if v_secure_url is null or v_secure_url !~ '^https://' then
      raise exception 'Media item % must use a secure Cloudinary URL', v_position using errcode = '22023';
    end if;

    if v_public_id is null or v_public_id not like 'sd-sign-studio/banners/' || p_banner_type || '/%' then
      raise exception 'Media item % does not belong to the % banner folder', v_position, p_banner_type using errcode = '22023';
    end if;

    if p_banner_type = 'desktop' and v_width * 9 <> v_height * 16 then
      raise exception 'Desktop media item % must have an exact 16:9 aspect ratio', v_position using errcode = '22023';
    end if;

    if p_banner_type = 'mobile' and v_width * 5 <> v_height * 4 then
      raise exception 'Mobile media item % must have an exact 4:5 aspect ratio', v_position using errcode = '22023';
    end if;
  end loop;

  insert into public.banner_settings (
    banner_type,
    headline,
    subheadline,
    is_enabled,
    transition_ms,
    updated_by,
    updated_at
  )
  values (
    p_banner_type,
    trim(p_headline),
    trim(coalesce(p_subheadline, '')),
    p_is_enabled,
    p_transition_ms,
    (select auth.uid()),
    now()
  )
  on conflict (banner_type) do update
  set headline = excluded.headline,
      subheadline = excluded.subheadline,
      is_enabled = excluded.is_enabled,
      transition_ms = excluded.transition_ms,
      updated_by = excluded.updated_by,
      updated_at = excluded.updated_at;

  delete from public.banner_media
  where banner_type = p_banner_type;

  for v_item, v_position in
    select value, ordinality
    from jsonb_array_elements(p_media) with ordinality
  loop
    v_media_id := case
      when nullif(v_item ->> 'id', '') is null then gen_random_uuid()
      else (v_item ->> 'id')::uuid
    end;

    insert into public.banner_media (
      id,
      banner_type,
      cloudinary_asset_id,
      cloudinary_public_id,
      secure_url,
      resource_type,
      width,
      height,
      format,
      bytes,
      duration_seconds,
      sort_order,
      headline,
      description,
      alt_text
    )
    values (
      v_media_id,
      p_banner_type,
      nullif(v_item ->> 'assetId', ''),
      v_item ->> 'publicId',
      v_item ->> 'secureUrl',
      v_item ->> 'resourceType',
      (v_item ->> 'width')::integer,
      (v_item ->> 'height')::integer,
      coalesce(nullif(v_item ->> 'format', ''), 'unknown'),
      coalesce((v_item ->> 'bytes')::bigint, 0),
      nullif(v_item ->> 'durationSeconds', '')::numeric,
      v_position - 1,
      trim(coalesce(v_item ->> 'headline', '')),
      trim(coalesce(v_item ->> 'description', '')),
      trim(coalesce(v_item ->> 'altText', ''))
    );
  end loop;
end;
$$;

revoke all on function public.publish_home_banner(text, text, text, boolean, integer, jsonb) from public;
grant execute on function public.publish_home_banner(text, text, text, boolean, integer, jsonb) to authenticated;

revoke all on public.banner_settings from anon, authenticated;
revoke all on public.banner_media from anon, authenticated;

grant select (
  banner_type,
  headline,
  subheadline,
  is_enabled,
  transition_ms,
  updated_at
) on public.banner_settings to anon, authenticated;
grant select on public.banner_media to anon, authenticated;
grant insert, update, delete on public.banner_settings to authenticated;
grant insert, update, delete on public.banner_media to authenticated;

notify pgrst, 'reload schema';
