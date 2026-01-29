#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${ROOT_DIR}/backups"
TIMESTAMP="$(date +%F_%H-%M-%S)"

mkdir -p "${BACKUP_DIR}"

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

SQL_FILE="${BACKUP_DIR}/bird_${DB_NAME}_${TIMESTAMP}.sql"
UPLOADS_TAR="${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz"

# DB dump
( cd "${ROOT_DIR}" && docker compose exec -T mysql mysqldump -uroot -p"${DB_ROOT_PWD}" "${DB_NAME}" > "${SQL_FILE}" )

# Uploads archive
if [ -d "${ROOT_DIR}/backend/uploads" ]; then
  tar -czf "${UPLOADS_TAR}" -C "${ROOT_DIR}/backend" uploads
else
  echo "未找到 backend/uploads，跳过图片备份" >&2
fi

echo "备份完成："
echo "- 数据库：${SQL_FILE}"
if [ -f "${UPLOADS_TAR}" ]; then
  echo "- 图片：${UPLOADS_TAR}"
fi
