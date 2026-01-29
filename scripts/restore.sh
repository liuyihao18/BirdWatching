#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "用法: ./scripts/restore.sh <backup.sql> [uploads.tar.gz]" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SQL_FILE="$1"
UPLOADS_TAR="${2:-}"

if [ -f "${ROOT_DIR}/.env" ]; then
  # shellcheck disable=SC1091
  set -a
  . "${ROOT_DIR}/.env"
  set +a
fi

DB_NAME="${MYSQL_DATABASE:-bird}"
DB_ROOT_PWD="${MYSQL_ROOT_PASSWORD:-}"
if [ -z "${DB_ROOT_PWD}" ]; then
  echo "MYSQL_ROOT_PASSWORD 未设置" >&2
  exit 1
fi

if [ ! -f "${SQL_FILE}" ]; then
  echo "找不到数据库备份文件: ${SQL_FILE}" >&2
  exit 1
fi

# Restore DB
( cd "${ROOT_DIR}" && docker compose exec -T mysql mysql -uroot -p"${DB_ROOT_PWD}" "${DB_NAME}" < "${SQL_FILE}" )

# Restore uploads (optional)
if [ -n "${UPLOADS_TAR}" ]; then
  if [ ! -f "${UPLOADS_TAR}" ]; then
    echo "找不到图片备份文件: ${UPLOADS_TAR}" >&2
    exit 1
  fi
  mkdir -p "${ROOT_DIR}/backend/uploads"
  tar -xzf "${UPLOADS_TAR}" -C "${ROOT_DIR}/backend"
fi

echo "恢复完成。"
