#!/usr/bin/env bash

set -e

find . -type d -name node_modules -prune -print -exec rm -rf {} +
find . -type d -name dist -not -path "*/node_modules/*" -prune -print -exec rm -rf {} +
find . -type d -name coverage -prune -print -exec rm -rf {} +
find . -type d -name reports -prune -print -exec rm -rf {} +
find . -type d -name cache -prune -print -exec rm -rf {} +
find . -type d -name .cache -prune -print -exec rm -rf {} +
find . -type d -name .turbo -prune -print -exec rm -rf {} +
find . -type f -name *.tsbuildinfo -print -exec rm -rf '{}' +
find . -type f -name .DS_Store -print -exec rm -rf '{}' +
find . -type f -name .env -print -exec rm -rf '{}' +
