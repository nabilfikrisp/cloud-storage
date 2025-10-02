## timestamp

[last seen](https://www.youtube.com/watch?v=lie0cr3wESQ&t=2160s)

## assets

[assets](https://jsmastery.com/video-kit/02bcd653-f514-4cc8-aee5-a74ec8ce2ab1)

## notes 02-10-2025

- next js will mostly be client side, we will still use tanstack query for fetching
- nest js will use passport jwt and passport oauth2, but before that, i need to implement prisma

### db design

#### user

- id
- email
- password_hash
- username
- avatar
- role
- created_at
- updated_at

#### auth_provider

- id
- user_id
- provider (local, google, github, etc.)
- provider_account_id -- e.g. google sub or github id
- created_at
- updated_at

### post

- id
- user_id
- title
- slug
- image
- summary
- content
- view_count
- is_featured
- created_at
- updated_at

### category

- id
- name
- slug
- created_at
- updated_at

### comment

- id
- user_id
- post_id
- content
- created_at
- updated_at

### post_category

- id
- post_id
- category_id
- created_at
- updated_at

### saved_post (many user -> many post)

- id
- post_id
- user_id
- created_at
- updated_at
