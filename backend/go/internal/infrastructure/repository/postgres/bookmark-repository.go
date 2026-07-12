package postgres

import (
	"context"
	"time"

	"swd392-chatbot-rag/internal/domain/document"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type BookmarkRepository struct {
	pool *pgxpool.Pool
}

func NewBookmarkRepository(pool *pgxpool.Pool) *BookmarkRepository {
	return &BookmarkRepository{pool: pool}
}

// ToggleBookmark adds a bookmark if it doesn't exist, or removes it if it does.
// Returns true if bookmarked, false if unbookmarked.
func (r *BookmarkRepository) ToggleBookmark(ctx context.Context, userID uuid.UUID, docID uuid.UUID) (bool, error) {
	// Check if exists
	var exists bool
	err := r.pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM user_bookmarks WHERE user_id = $1 AND document_id = $2)", userID, docID).Scan(&exists)
	if err != nil {
		return false, err
	}

	if exists {
		// Delete
		_, err := r.pool.Exec(ctx, "DELETE FROM user_bookmarks WHERE user_id = $1 AND document_id = $2", userID, docID)
		return false, err
	} else {
		// Insert
		_, err := r.pool.Exec(ctx, "INSERT INTO user_bookmarks (user_id, document_id, created_at) VALUES ($1, $2, $3)", userID, docID, time.Now())
		return true, err
	}
}

func (r *BookmarkRepository) GetBookmarkedDocuments(ctx context.Context, userID uuid.UUID) ([]*document.Document, error) {
	query := `
		SELECT d.id, d.owner_user_id, d.title, d.description, d.subject_id, d.status, d.visibility, d.page_count, d.total_chunks, d.total_chapters, d.view_count, d.download_count, d.search_text, d.created_at, d.updated_at, d.approved_at, d.slug, d.document_type_id, d.language_id, d.md5_hash, d.document_source_id,
		       s.name as subject_name, s.code as subject_code, dt.name as document_type_name, l.name as language_name, l.code as language_code, ds.name as document_source_name, u.email as owner_email, u.name as owner_full_name
		FROM documents d
		JOIN (
			SELECT user_id, document_id, MAX(created_at) as created_at 
			FROM user_bookmarks 
			GROUP BY user_id, document_id
		) b ON d.id = b.document_id
		JOIN users u ON d.owner_user_id = u.id
		LEFT JOIN subjects s ON d.subject_id = s.id
		LEFT JOIN document_types dt ON d.document_type_id = dt.id
		LEFT JOIN languages l ON d.language_id = l.id
		LEFT JOIN document_sources ds ON d.document_source_id = ds.id
		WHERE b.user_id = $1
		ORDER BY b.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var docs []*document.Document
	for rows.Next() {
		var doc document.Document
		err := rows.Scan(
			&doc.ID, &doc.OwnerUserID, &doc.Title, &doc.Description, &doc.SubjectID, &doc.Status, &doc.Visibility, &doc.PageCount, &doc.TotalChunks, &doc.TotalChapters, &doc.ViewCount, &doc.DownloadCount, &doc.SearchText, &doc.CreatedAt, &doc.UpdatedAt, &doc.ApprovedAt, &doc.Slug, &doc.DocumentTypeID, &doc.LanguageID, &doc.Md5Hash, &doc.DocumentSourceID,
			&doc.SubjectName, &doc.SubjectCode, &doc.DocumentTypeName, &doc.LanguageName, &doc.LanguageCode, &doc.DocumentSourceName, &doc.OwnerEmail, &doc.OwnerFullName,
		)
		if err != nil {
			return nil, err
		}
		docs = append(docs, &doc)
	}

	return docs, nil
}
