# Local development dependencies: `brew bundle` installs them (pnpm bootstrap runs it).
# Postgres 18 matches production, and the seed dump needs a pg_restore at least that new.
# Linking puts psql, pg_dump and pg_restore on the PATH; Homebrew skips that for versioned formulae.
brew "postgresql@18", link: true, start_service: true
