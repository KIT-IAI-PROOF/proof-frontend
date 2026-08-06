#!/bin/sh

ENV_CONFIG="/usr/share/nginx/html/env-config.js"

# Recreate mapConfig file
rm -f "$ENV_CONFIG"
touch "$ENV_CONFIG"

# Add assignment
echo "window._env_ = {" >> "$ENV_CONFIG"

# Read each line in .env file
# Each line represents key=value pairs
while IFS= read -r line || [ -n "$line" ]; do
  # Split env variables by character `=`
  case "$line" in
    *=*)
      varname=$(printf '%s\n' "$line" | sed 's/=.*//')
      varvalue=$(printf '%s\n' "$line" | sed 's/^[^=]*=//')
      ;;
    *)
      continue
      ;;
  esac

  # Read value of current variable if it exists as an environment variable
  value=$(printenv "$varname")

  # Otherwise use value from .env file
  if [ -z "$value" ]; then
    value=$varvalue
  fi

  # Append configuration property to JS file
  echo "  $varname: \"$value\"," >> "$ENV_CONFIG"
done < "/.env"

echo "}" >> "$ENV_CONFIG"